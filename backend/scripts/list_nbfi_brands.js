const { connectDatabase, getPool } = require('../config/database');

(async () => {
  await connectDatabase();
  const pool = getPool();
  const [rows] = await pool.execute('SELECT brandCode, brand FROM nbfi_brands ORDER BY id');
  console.log(JSON.stringify(rows, null, 2));
  process.exit(0);
})();
