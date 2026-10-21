import { getPool, query } from './index';

/**
 * Seeds sample user and loans for development and demoing
 */
export async function seed(): Promise<void> {
  console.log('[SEED] Seeding demo data...');

  // 1. Create or get demo user
  const demoPhone = '+919876543210';
  const userResult = await query<{ id: string }>(
    `INSERT INTO users (phone)
     VALUES ($1)
     ON CONFLICT (phone) DO UPDATE SET phone = EXCLUDED.phone
     RETURNING id;`,
    [demoPhone]
  );

  const userId = userResult.rows[0].id;
  console.log(`[SEED] Demo user id: ${userId} (${demoPhone})`);

  // Clear existing loans for demo user to ensure clean seed state
  await query(`DELETE FROM loans WHERE user_id = $1;`, [userId]);

  const today = new Date();
  const formatOffsetDate = (offsetDays: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offsetDays);
    return d.toISOString().split('T')[0];
  };

  // Sample loans: overdue, pending, and repaid
  const sampleLoans = [
    {
      friendName: 'Alex Chen',
      amount: 1500.0,
      dueDate: formatOffsetDate(-5), // 5 days overdue
      isRepaid: false,
      repaidAt: null,
      receiptUrl: null,
    },
    {
      friendName: 'Priya Sharma',
      amount: 2400.5,
      dueDate: formatOffsetDate(-2), // 2 days overdue
      isRepaid: false,
      repaidAt: null,
      receiptUrl: null,
    },
    {
      friendName: 'David Miller',
      amount: 350.0,
      dueDate: formatOffsetDate(3), // Due in 3 days
      isRepaid: false,
      repaidAt: null,
      receiptUrl: null,
    },
    {
      friendName: 'Sara Connor',
      amount: 800.0,
      dueDate: formatOffsetDate(10), // Due in 10 days
      isRepaid: false,
      repaidAt: null,
      receiptUrl: null,
    },
    {
      friendName: 'Rohan Verma',
      amount: 1200.0,
      dueDate: formatOffsetDate(-12),
      isRepaid: true,
      repaidAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      receiptUrl: null,
    },
    {
      friendName: 'Emma Watson',
      amount: 500.0,
      dueDate: formatOffsetDate(-1),
      isRepaid: true,
      repaidAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      receiptUrl: null,
    },
  ];

  for (const loan of sampleLoans) {
    await query(
      `INSERT INTO loans (user_id, friend_name, amount, due_date, is_repaid, repaid_at, receipt_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7);`,
      [
        userId,
        loan.friendName,
        loan.amount,
        loan.dueDate,
        loan.isRepaid,
        loan.repaidAt,
        loan.receiptUrl,
      ]
    );
  }

  console.log(`[SEED] Successfully seeded ${sampleLoans.length} loans for ${demoPhone}.`);
}

if (require.main === module || (process.argv[1] && process.argv[1].endsWith('seed.ts'))) {
  seed()
    .then(async () => {
      await getPool().end();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error('[SEED ERROR]', err);
      await getPool().end();
      process.exit(1);
    });
}
