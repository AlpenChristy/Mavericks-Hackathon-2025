import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',
  password: '1234',
  host: 'localhost',
  port: 5432,
  database: 'rewear_app',
});

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const client = await pool.connect();
    console.log('✅ Database connection successful!');
    
    // Test if tables exist
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log('📋 Available tables:');
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // Test users table specifically
    const usersResult = await client.query('SELECT COUNT(*) as count FROM users');
    console.log(`👥 Users in database: ${usersResult.rows[0].count}`);
    
    client.release();
    console.log('✅ Database test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Make sure:');
    console.error('1. PostgreSQL is running');
    console.error('2. Database "rewear_app" exists');
    console.error('3. Tables are created from database_setup.sql');
    console.error('4. Credentials are correct (postgres/1234)');
  } finally {
    await pool.end();
  }
}

testConnection(); 