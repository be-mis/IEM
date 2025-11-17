/**
 * Migration: Modify NBFI item exclusivity structure
 * - Ensure `nbfi_item_exclusivity_list` has columns `SM`, `RDS`, `WDS` (VARCHAR(10) NULL)
 * - If an old `nbfi_item_exclusivity` per-store table exists, migrate distinct itemCode values
 *   into `nbfi_item_exclusivity_list` and drop the old table.
 * - Remove any `storeCode` column from `nbfi_item_exclusivity_list` if present.
 */

const up = async (pool) => {
  console.log('📝 Running migration: 020_modify_nbfi_item_exclusivity_list');
  try {
    // Ensure nbfi_item_exclusivity_list exists (it may have been created by earlier migrations)
    await pool.execute(`CREATE TABLE IF NOT EXISTS nbfi_item_exclusivity_list (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      itemCode VARCHAR(100) NOT NULL,
      created_at TIMESTAMP NULL DEFAULT NULL,
      updated_at TIMESTAMP NULL DEFAULT NULL,
      UNIQUE KEY uniq_item (itemCode)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    // Add SM, RDS, WDS columns if they don't exist
    const cols = ['SM','RDS','WDS'];
    for (const c of cols) {
      const [check] = await pool.execute(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'nbfi_item_exclusivity_list' AND COLUMN_NAME = ?`,
        [c]
      );
      if (!Array.isArray(check) || check.length === 0) {
        await pool.execute(`ALTER TABLE nbfi_item_exclusivity_list ADD COLUMN \`${c}\` VARCHAR(10) NULL`);
        console.log(`Added column ${c} to nbfi_item_exclusivity_list`);
      }
    }

    // If a legacy per-store table exists, migrate distinct itemCodes into the list table
    const [legacy] = await pool.execute("SHOW TABLES LIKE 'nbfi_item_exclusivity'");
    if (Array.isArray(legacy) && legacy.length > 0) {
      console.log('Found legacy table nbfi_item_exclusivity — migrating itemCodes');
      // Insert distinct itemCodes (ignore duplicates)
      await pool.execute(`INSERT IGNORE INTO nbfi_item_exclusivity_list (itemCode)
        SELECT DISTINCT itemCode FROM nbfi_item_exclusivity`);

      // Drop the legacy table
      await pool.execute('DROP TABLE IF EXISTS nbfi_item_exclusivity');
      console.log('Dropped legacy nbfi_item_exclusivity table');
    }

    // If storeCode column exists in nbfi_item_exclusivity_list, drop it (user requested removal)
    const [storeCodeCol] = await pool.execute(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'nbfi_item_exclusivity_list' AND COLUMN_NAME = 'storeCode'`
    );
    if (Array.isArray(storeCodeCol) && storeCodeCol.length > 0) {
      await pool.execute(`ALTER TABLE nbfi_item_exclusivity_list DROP COLUMN storeCode`);
      console.log('Dropped column storeCode from nbfi_item_exclusivity_list');
    }

    console.log('✅ Migration 020 complete');
  } catch (err) {
    console.error('❌ Migration 020 failed:', err);
    throw err;
  }
};

const down = async (pool) => {
  console.log('🔄 Rolling back migration: 020_modify_nbfi_item_exclusivity_list');
  try {
    // Remove SM/RDS/WDS columns if present
    for (const c of ['SM','RDS','WDS']) {
      const [check] = await pool.execute(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'nbfi_item_exclusivity_list' AND COLUMN_NAME = ?`,
        [c]
      );
      if (Array.isArray(check) && check.length > 0) {
        await pool.execute(`ALTER TABLE nbfi_item_exclusivity_list DROP COLUMN \`${c}\``);
        console.log(`Dropped column ${c} from nbfi_item_exclusivity_list`);
      }
    }

    // Note: recreating the legacy per-store table with original data is not possible here
    // because source mapping (storeCode→SM/RDS/WDS) is ambiguous. Create an empty legacy table
    // to allow rollback of code that expects it.
    await pool.execute(`CREATE TABLE IF NOT EXISTS nbfi_item_exclusivity (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      storeCode VARCHAR(50) DEFAULT NULL,
      itemCode VARCHAR(100) NOT NULL,
      created_at TIMESTAMP NULL DEFAULT NULL,
      updated_at TIMESTAMP NULL DEFAULT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    console.log('✅ Rollback 020 complete (legacy table recreated empty)');
  } catch (err) {
    console.error('❌ Rollback 020 failed:', err);
    throw err;
  }
};

module.exports = { up, down };
