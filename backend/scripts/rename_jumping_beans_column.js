const { connectDatabase, getPool } = require('../config/database');

(async () => {
  await connectDatabase();
  const pool = getPool();
  try {
    // Status check: ensure new column exists
    const [cols] = await pool.execute(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'nbfi_store_exclusivity_list' AND COLUMN_NAME = 'brand_jumpingbeans'`);

    if (Array.isArray(cols) && cols.length > 0) {
      console.log('Column brand_jumpingbeans exists. No action required.');
      process.exit(0);
    }

    console.log('Column brand_jumpingbeans not found. If you need to rename an older column, run the migration or the original rename script.');
    process.exit(0);
  } catch (err) {
    console.error('Error checking column:', err);
    process.exit(1);
  }
})();
