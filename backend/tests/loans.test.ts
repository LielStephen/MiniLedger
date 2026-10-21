import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../src/app';
import { setupTestDatabase } from './setupTestDb';
import { query } from '../src/db';
import { config } from '../src/config';

describe('Loans Endpoints', () => {
  let user1Token: string;
  let user1Id: string;
  let user2Token: string;
  let user2Id: string;

  beforeEach(async () => {
    await setupTestDatabase();

    // Create user 1
    const u1 = await query(`INSERT INTO users (phone) VALUES ($1) RETURNING id;`, ['+919876543210']);
    user1Id = u1.rows[0].id;
    user1Token = jwt.sign({ id: user1Id, phone: '+919876543210' }, config.jwtSecret);

    // Create user 2 for isolation testing
    const u2 = await query(`INSERT INTO users (phone) VALUES ($1) RETURNING id;`, ['+919999999999']);
    user2Id = u2.rows[0].id;
    user2Token = jwt.sign({ id: user2Id, phone: '+919999999999' }, config.jwtSecret);
  });

  describe('POST /loans (Validation & Creation)', () => {
    it('should return 401 Unauthorized when token is missing', async () => {
      const res = await request(app)
        .post('/loans')
        .send({ friendName: 'Alice', amount: 500, dueDate: '2026-11-01' });

      expect(res.status).toBe(401);
    });

    it('should return 400 when friendName is empty', async () => {
      const res = await request(app)
        .post('/loans')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ friendName: '', amount: 500, dueDate: '2026-11-01' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation Error');
      expect(res.body.message).toContain('Friend name cannot be empty');
    });

    it('should return 400 when amount is negative or zero', async () => {
      const res1 = await request(app)
        .post('/loans')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ friendName: 'Alice', amount: -100, dueDate: '2026-11-01' });

      expect(res1.status).toBe(400);
      expect(res1.body.message).toContain('greater than zero');

      const res2 = await request(app)
        .post('/loans')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ friendName: 'Alice', amount: 0, dueDate: '2026-11-01' });

      expect(res2.status).toBe(400);
      expect(res2.body.message).toContain('greater than zero');
    });

    it('should return 400 when dueDate is invalid', async () => {
      const res = await request(app)
        .post('/loans')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ friendName: 'Alice', amount: 200, dueDate: 'not-a-date' });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Invalid due date format');
    });

    it('should successfully create a loan entry', async () => {
      const res = await request(app)
        .post('/loans')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ friendName: 'Bob Dylan', amount: 1500.5, dueDate: '2026-12-25' });

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.friendName).toBe('Bob Dylan');
      expect(res.body.amount).toBe(1500.5);
      expect(res.body.dueDate).toBe('2026-12-25');
      expect(res.body.isRepaid).toBe(false);
      expect(res.body.isOverdue).toBe(false);
    });
  });

  describe('GET /loans and Overdue computation', () => {
    it('should list loans sorted by due date with computed isOverdue', async () => {
      // Loan 1: in future (not overdue)
      await query(
        `INSERT INTO loans (user_id, friend_name, amount, due_date, is_repaid)
         VALUES ($1, 'Future Friend', 300, CURRENT_DATE + INTERVAL '5 days', false);`,
        [user1Id]
      );

      // Loan 2: in past, not repaid (overdue!)
      await query(
        `INSERT INTO loans (user_id, friend_name, amount, due_date, is_repaid)
         VALUES ($1, 'Late Friend', 800, CURRENT_DATE - INTERVAL '3 days', false);`,
        [user1Id]
      );

      // Loan 3: in past, but repaid (not overdue)
      await query(
        `INSERT INTO loans (user_id, friend_name, amount, due_date, is_repaid, repaid_at)
         VALUES ($1, 'Good Friend', 1000, CURRENT_DATE - INTERVAL '10 days', true, CURRENT_TIMESTAMP);`,
        [user1Id]
      );

      const res = await request(app)
        .get('/loans')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(3);

      const late = res.body.find((l: any) => l.friendName === 'Late Friend');
      expect(late.isOverdue).toBe(true);
      expect(late.isRepaid).toBe(false);

      const future = res.body.find((l: any) => l.friendName === 'Future Friend');
      expect(future.isOverdue).toBe(false);
      expect(future.isRepaid).toBe(false);

      const good = res.body.find((l: any) => l.friendName === 'Good Friend');
      expect(good.isOverdue).toBe(false);
      expect(good.isRepaid).toBe(true);
    });
  });

  describe('PATCH /loans/:id/repay Flow', () => {
    it('should successfully mark loan as repaid with timestamp', async () => {
      const insert = await query(
        `INSERT INTO loans (user_id, friend_name, amount, due_date, is_repaid)
         VALUES ($1, 'Charlie', 500, CURRENT_DATE + INTERVAL '2 days', false)
         RETURNING id;`,
        [user1Id]
      );
      const loanId = insert.rows[0].id;

      const res = await request(app)
        .patch(`/loans/${loanId}/repay`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body.isRepaid).toBe(true);
      expect(res.body.repaidAt).toBeDefined();

      // Verify in DB
      const dbCheck = await query(`SELECT is_repaid, repaid_at FROM loans WHERE id = $1;`, [loanId]);
      expect(dbCheck.rows[0].is_repaid).toBe(true);
      expect(dbCheck.rows[0].repaid_at).not.toBeNull();
    });

    it('should return 409 Conflict when loan is already repaid', async () => {
      const insert = await query(
        `INSERT INTO loans (user_id, friend_name, amount, due_date, is_repaid, repaid_at)
         VALUES ($1, 'Charlie', 500, CURRENT_DATE, true, CURRENT_TIMESTAMP)
         RETURNING id;`,
        [user1Id]
      );
      const loanId = insert.rows[0].id;

      const res = await request(app)
        .patch(`/loans/${loanId}/repay`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(409);
      expect(res.body.message).toContain('already marked as repaid');
    });

    it('should return 404 when loan does not belong to requesting user', async () => {
      const insert = await query(
        `INSERT INTO loans (user_id, friend_name, amount, due_date, is_repaid)
         VALUES ($1, 'Private Loan', 500, CURRENT_DATE, false)
         RETURNING id;`,
        [user2Id]
      );
      const user2LoanId = insert.rows[0].id;

      // User 1 attempts to repay User 2's loan
      const res = await request(app)
        .patch(`/loans/${user2LoanId}/repay`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Loan not found');
    });
  });

  describe('GET /loans/summary Math and Overdue', () => {
    it('should return accurate summary metrics calculated with a single SQL query', async () => {
      // 1. Repaid loan: 1000
      await query(
        `INSERT INTO loans (user_id, friend_name, amount, due_date, is_repaid, repaid_at)
         VALUES ($1, 'Friend A', 1000, CURRENT_DATE - INTERVAL '10 days', true, CURRENT_TIMESTAMP);`,
        [user1Id]
      );

      // 2. Pending future loan: 500
      await query(
        `INSERT INTO loans (user_id, friend_name, amount, due_date, is_repaid)
         VALUES ($1, 'Friend B', 500, CURRENT_DATE + INTERVAL '5 days', false);`,
        [user1Id]
      );

      // 3. Overdue loan 1: 300
      await query(
        `INSERT INTO loans (user_id, friend_name, amount, due_date, is_repaid)
         VALUES ($1, 'Friend C', 300, CURRENT_DATE - INTERVAL '2 days', false);`,
        [user1Id]
      );

      // 4. Overdue loan 2: 700
      await query(
        `INSERT INTO loans (user_id, friend_name, amount, due_date, is_repaid)
         VALUES ($1, 'Friend D', 700, CURRENT_DATE - INTERVAL '4 days', false);`,
        [user1Id]
      );

      // Total lent: 1000 + 500 + 300 + 700 = 2500
      // Total repaid: 1000
      // Total pending: 500 + 300 + 700 = 1500
      // Overdue amount: 300 + 700 = 1000
      // Overdue count: 2

      const res = await request(app)
        .get('/loans/summary')
        .set('Authorization', `Bearer ${user1Token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        totalLent: 2500,
        totalRepaid: 1000,
        totalPending: 1500,
        overdueAmount: 1000,
        overdueCount: 2,
      });
    });

    it('should return zeros for a new user with no loans', async () => {
      const res = await request(app)
        .get('/loans/summary')
        .set('Authorization', `Bearer ${user2Token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        totalLent: 0,
        totalRepaid: 0,
        totalPending: 0,
        overdueAmount: 0,
        overdueCount: 0,
      });
    });
  });
});
