const { connectDatabase, getPool } = require('./config/database');

async function checkNBFIItems() {
  await connectDatabase();
  const pool = getPool();
  
  console.log('=== NBFI_ITEM_LIST TABLE STRUCTURE ===');
  const [columns] = await pool.execute(`
    DESCRIBE nbfi_item_list
  `);
  console.log(columns);
  
  console.log('\n=== SAMPLE DATA ===');
  const [rows] = await pool.execute(`
    SELECT * FROM nbfi_item_list LIMIT 5
  `);
  console.log(rows);
  
  console.log('\n=== UNIQUE CATEGORIES ===');
  const [categories] = await pool.execute(`
    SELECT DISTINCT itemCategory FROM nbfi_item_list LIMIT 10
  `);
  console.log(categories);
  
  await pool.end();
}

checkNBFIItems().catch(console.error);
