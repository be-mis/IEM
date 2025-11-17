const { connectDatabase, getPool } = require('./config/database');

(async () => {
  await connectDatabase();
  const pool = getPool();
  
  console.log('=== NBFI STORES TABLE ===');
  const [stores] = await pool.execute("DESCRIBE nbfi_stores");
  stores.forEach(r => console.log(r.Field, '-', r.Type));
  
  console.log('\n=== NBFI STORES SAMPLE DATA ===');
  const [storeData] = await pool.execute("SELECT * FROM nbfi_stores LIMIT 3");
  console.log(storeData);
  
  console.log('\n=== NBFI STORE EXCLUSIVITY LIST ===');
  const [exclusivity] = await pool.execute("DESCRIBE nbfi_store_exclusivity_list");
  exclusivity.forEach(r => console.log(r.Field, '-', r.Type));
  
  console.log('\n=== NBFI STORE EXCLUSIVITY SAMPLE DATA ===');
  const [exclusivityData] = await pool.execute("SELECT * FROM nbfi_store_exclusivity_list LIMIT 3");
  console.log(exclusivityData);
  
  process.exit(0);
})();
