import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  user: 'postgres',
  password: '1234',
  host: 'localhost',
  port: 5432,
  database: 'rewear_app',
});

async function checkItems() {
  try {
    const result = await pool.query(`
      SELECT i.id, i.title, i.approval_status, i.status, i.uploader_id, u.name as uploader_name
      FROM items i
      LEFT JOIN users u ON i.uploader_id = u.id
      ORDER BY i.created_at DESC
    `);
    
    console.log('Current items in database:');
    console.log('========================');
    
    if (result.rows.length === 0) {
      console.log('No items found in the database.');
      return;
    }
    
    result.rows.forEach((item, index) => {
      console.log(`${index + 1}. ID: ${item.id}`);
      console.log(`   Title: ${item.title}`);
      console.log(`   Uploader: ${item.uploader_name} (${item.uploader_id})`);
      console.log(`   Status: ${item.status}`);
      console.log(`   Approval: ${item.approval_status}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('Error checking items:', error);
  } finally {
    await pool.end();
  }
}

checkItems(); 