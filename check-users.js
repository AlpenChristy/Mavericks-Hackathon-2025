import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  user: 'postgres',
  password: '1234',
  host: 'localhost',
  port: 5432,
  database: 'rewear_app',
});

async function checkUsers() {
  try {
    const result = await pool.query('SELECT id, email, name, role FROM users ORDER BY joined_date');
    
    console.log('Current users in database:');
    console.log('========================');
    
    if (result.rows.length === 0) {
      console.log('No users found in the database.');
      console.log('Please create a user first through the signup process.');
      return;
    }
    
    result.rows.forEach((user, index) => {
      console.log(`${index + 1}. ID: ${user.id}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Role: ${user.role}`);
      console.log('---');
    });
    
    console.log('\nTo make a user admin, run this SQL in pgAdmin:');
    console.log('UPDATE users SET role = \'admin\' WHERE email = \'[USER_EMAIL]\';');
    console.log('\nReplace [USER_EMAIL] with the email of the user you want to make admin.');
    
  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    await pool.end();
  }
}

checkUsers(); 