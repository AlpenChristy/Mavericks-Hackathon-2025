import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  user: 'postgres',
  password: '1234',
  host: 'localhost',
  port: 5432,
  database: 'rewear_app',
});

async function checkPoints() {
  try {
    const result = await pool.query(`
      SELECT id, name, email, points, role
      FROM users
      ORDER BY name
    `);
    
    console.log('Current user points:');
    console.log('===================');
    
    result.rows.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email})`);
      console.log(`   Points: ${user.points}`);
      console.log(`   Role: ${user.role}`);
      console.log('---');
    });
    
    // Also check recent transactions
    console.log('\nRecent point transactions:');
    console.log('==========================');
    
    const transactions = await pool.query(`
      SELECT pt.*, u.name as user_name
      FROM point_transactions pt
      LEFT JOIN users u ON pt.user_id = u.id
      ORDER BY pt.created_at DESC
      LIMIT 10
    `);
    
    transactions.rows.forEach((tx, index) => {
      console.log(`${index + 1}. ${tx.user_name}: ${tx.amount} points (${tx.type})`);
      console.log(`   Description: ${tx.description}`);
      console.log(`   Date: ${tx.created_at}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('Error checking points:', error);
  } finally {
    await pool.end();
  }
}

checkPoints(); 