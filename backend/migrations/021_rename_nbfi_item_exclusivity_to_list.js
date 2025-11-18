/**
 * Migration: Rename or migrate legacy `nbfi_item_exclusivity` to `nbfi_item_exclusivity_list`
 * - If legacy table exists and the list table does NOT exist: RENAME TABLE
 * - If both exist: copy DISTINCT itemCode from legacy into list, then DROP legacy
 * - Ensure `SM`, `RDS`, `WDS` columns exist on the list table
 */

const up = async (pool) => {
  console.log('📝 Running migration: 021_rename_nbfi_item_exclusivity_to_list');
  try {
    // Check existence
    const [legacy] = await pool.execute("SHOW TABLES LIKE 'nbfi_item_exclusivity'");
    const [list] = await pool.execute("SHOW TABLES LIKE 'nbfi_item_exclusivity_list'");

    if (Array.isArray(legacy) && legacy.length > 0 && (!Array.isArray(list) || list.length === 0)) {
      console.log('Legacy table exists and list is missing — renaming table');
      await pool.execute('RENAME TABLE nbfi_item_exclusivity TO nbfi_item_exclusivity_list');
      console.log('Renamed nbfi_item_exclusivity -> nbfi_item_exclusivity_list');
    } else if (Array.isArray(legacy) && legacy.length > 0 && Array.isArray(list) && list.length > 0) {
      console.log('Both legacy and list exist — migrating distinct itemCodes and dropping legacy');
      await pool.execute(`INSERT IGNORE INTO nbfi_item_exclusivity_list (itemCode)
        SELECT DISTINCT itemCode FROM nbfi_item_exclusivity WHERE itemCode IS NOT NULL`);
      await pool.execute('DROP TABLE IF EXISTS nbfi_item_exclusivity');
      console.log('Migrated distinct itemCodes and dropped legacy table');
    } else {
      console.log('Legacy table not present — nothing to rename/migrate');
    }

    // Ensure SM/RDS/WDS columns exist on list table
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

    console.log('✅ Migration 021 complete');
  } catch (err) {
    console.error('❌ Migration 021 failed:', err);
    throw err;
  }
};

const down = async (pool) => {
  console.log('🔄 Rolling back migration: 021_rename_nbfi_item_exclusivity_to_list');
  try {
    // If list exists and legacy doesn't, rename back
    const [list] = await pool.execute("SHOW TABLES LIKE 'nbfi_item_exclusivity_list'");
    const [legacy] = await pool.execute("SHOW TABLES LIKE 'nbfi_item_exclusivity'");

    if (Array.isArray(list) && list.length > 0 && (!Array.isArray(legacy) || legacy.length === 0)) {
      console.log('Renaming nbfi_item_exclusivity_list back to nbfi_item_exclusivity');
      await pool.execute('RENAME TABLE nbfi_item_exclusivity_list TO nbfi_item_exclusivity');
      console.log('Renamed back to legacy table');
    } else {
      console.log('No action for rollback (either legacy exists or list missing)');
    }

    console.log('✅ Rollback 021 complete');
  } catch (err) {
    console.error('❌ Rollback 021 failed:', err);
    throw err;
  }
};

module.exports = { up, down };
