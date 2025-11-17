const { connectDatabase, getPool } = require('./config/database');

(async () => {
  await connectDatabase();
  const pool = getPool();
  
  const [rows] = await pool.execute("SHOW TABLES LIKE 'nbfi_%'");
  console.log('NBFI tables:');
  rows.forEach(r => console.log(Object.values(r)[0]));
  
  process.exit(0);
})();
