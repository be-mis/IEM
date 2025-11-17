const { connectDatabase, getPool } = require('./config/database');

(async () => {
  await connectDatabase();
  const pool = getPool();
  
  const [rows] = await pool.execute("DESCRIBE nbfi_brands");
  console.log('nbfi_brands structure:');
  rows.forEach(r => console.log(r.Field, '-', r.Type));
  
  const [data] = await pool.execute("SELECT * FROM nbfi_brands LIMIT 3");
  console.log('\nSample data:');
  console.log(data);
  
  process.exit(0);
})();
