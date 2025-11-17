const { connectDatabase, getPool } = require('../config/database');

(async () => {
  await connectDatabase();
  const pool = getPool();

  // Status report for the new brand columns
  const colsToCheck = ['brand_justiceleague', 'brand_islandhaze'];
  try {
    for (const col of colsToCheck) {
      const [rows] = await pool.execute(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'nbfi_store_exclusivity_list' AND COLUMN_NAME = ?`, [col]);

      if (Array.isArray(rows) && rows.length > 0) {
        console.log(`Column ${col} exists.`);
      } else {
        console.log(`Column ${col} NOT found.`);
      }
    }

    console.log('Status check complete. No old column names referenced in this script.');
    process.exit(0);
  } catch (err) {
    console.error('Error during status check:', err);
    process.exit(1);
  }
})();
