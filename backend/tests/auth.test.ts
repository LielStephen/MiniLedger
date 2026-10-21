import request from 'supertest';
import jwt from 'jsonwebtoken';
import { app } from '../src/app';
import { setupTestDatabase } from './setupTestDb';
import { query } from '../src/db';
import { config } from '../src/config';
import { resetOtpRateLimits } from '../src/middleware/rateLimit';

describe('Auth Endpoints Flow', () => {
  beforeEach(async () => {
    await setupTestDatabase();
  });

  describe('POST /auth/request-otp', () => {
    it('should generate OTP and not return it in the response body', async () => {
      const res = await request(app)
        .post('/auth/request-otp')
        .send({ phone: '9876543210' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.otp).toBeUndefined(); // MUST NOT return OTP in response

      // Check DB entry
      const otps = await query('SELECT * FROM otps WHERE phone = $1', ['+919876543210']);
      expect(otps.rowCount).toBe(1);
      expect(otps.rows[0].used).toBe(false);
      expect(otps.rows[0].code_hash).toBeDefined();
    });

    it('should reject invalid phone format', async () => {
      const res = await request(app)
        .post('/auth/request-otp')
        .send({ phone: '123' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation Error');
    });

    it('should enforce rate limit of 3 requests per 10 minutes', async () => {
      resetOtpRateLimits();
      const phone = '9998887776';

      // 1st request
      const res1 = await request(app).post('/auth/request-otp').send({ phone });
      expect(res1.status).toBe(200);

      // 2nd request
      const res2 = await request(app).post('/auth/request-otp').send({ phone });
      expect(res2.status).toBe(200);

      // 3rd request
      const res3 = await request(app).post('/auth/request-otp').send({ phone });
      expect(res3.status).toBe(200);

      // 4th request -> blocked by rate limiter
      const res4 = await request(app).post('/auth/request-otp').send({ phone });
      expect(res4.status).toBe(429);
      expect(res4.body.error).toBe('Too Many Requests');
    });
  });

  describe('POST /auth/verify-otp', () => {
    it('should verify valid OTP, create user, and return 7d JWT token', async () => {
      // Mock console.log to capture the generated OTP
      let loggedOtp = '';
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation((msg: string) => {
        const match = msg.match(/\[MOCK OTP\] \+919876543210 -> (\d{6})/);
        if (match) {
          loggedOtp = match[1];
        }
      });

      // Request OTP
      await request(app)
        .post('/auth/request-otp')
        .send({ phone: '9876543210' });

      expect(loggedOtp).toHaveLength(6);
      consoleSpy.mockRestore();

      // Verify OTP
      const res = await request(app)
        .post('/auth/verify-otp')
        .send({ phone: '+919876543210', otp: loggedOtp });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user).toBeDefined();
      expect(res.body.user.phone).toBe('+919876543210');

      // Verify token decoding
      const decoded = jwt.verify(res.body.token, config.jwtSecret) as any;
      expect(decoded.phone).toBe('+919876543210');
      expect(decoded.id).toBe(res.body.user.id);

      // Verify OTP cannot be reused
      const reuseRes = await request(app)
        .post('/auth/verify-otp')
        .send({ phone: '+919876543210', otp: loggedOtp });

      expect(reuseRes.status).toBe(400);
      expect(reuseRes.body.message).toContain('Invalid or expired OTP');
    });

    it('should reject wrong OTP code', async () => {
      await request(app)
        .post('/auth/request-otp')
        .send({ phone: '9876543210' });

      const res = await request(app)
        .post('/auth/verify-otp')
        .send({ phone: '+919876543210', otp: '000000' });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('Invalid or expired OTP');
    });
  });
});
