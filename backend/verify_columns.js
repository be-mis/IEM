const { connectDatabase, getPool } = require('./config/database');

async function verifyColumns() {
  try {
    await connectDatabase();
    const pool = getPool();
    
    const [rows] = await pool.query('DESCRIBE epc_item_list');
    console.log('Table structure:');
    rows.forEach(r => {
      console.log(`  ${r.Field.padEnd(20)} ${r.Type.padEnd(15)} ${r.Null.padEnd(5)} ${r.Key.padEnd(5)} ${r.Default || 'NULL'}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

verifyColumns();
