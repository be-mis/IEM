/**
 * Migration: Drop nbfi_store_exclusivity_list
 *
 * This migration drops the `nbfi_store_exclusivity_list` table if it exists.
 * The down migration recreates a minimal version of the table so rollbacks
 * are possible; it does not attempt to recreate brand_* columns.
 */

const up = async (pool) => {
  console.log('📝 Running migration: 022_drop_nbfi_store_exclusivity_list');
  try {
    const [tables] = await pool.execute(`
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'nbfi_store_exclusivity_list'
    `);

    if (Array.isArray(tables) && tables.length > 0) {
      console.log('Dropping table nbfi_store_exclusivity_list...');
      await pool.execute('DROP TABLE IF EXISTS nbfi_store_exclusivity_list');
      console.log('✅ Dropped nbfi_store_exclusivity_list');
    } else {
      console.log('ℹ️ Table nbfi_store_exclusivity_list not present; nothing to do');
    }

    console.log('✅ Migration 022 completed successfully');
  } catch (error) {
    console.error('❌ Error in migration 022:', error);
    throw error;
  }
};

const down = async (pool) => {
  console.log('🔄 Rolling back migration: 022_drop_nbfi_store_exclusivity_list');
  try {
    // Recreate a minimal nbfi_store_exclusivity_list so downstream code can be rolled back.
    console.log('Creating minimal nbfi_store_exclusivity_list...');
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS nbfi_store_exclusivity_list (
        storeCode VARCHAR(20) NOT NULL,
        storeClassification VARCHAR(50) DEFAULT NULL,
        created_at TIMESTAMP NULL DEFAULT NULL,
        updated_at TIMESTAMP NULL DEFAULT NULL,
        PRIMARY KEY (storeCode)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);

    console.log('✅ Recreated minimal nbfi_store_exclusivity_list');
    console.log('✅ Rolled back migration 022');
  } catch (error) {
    console.error('❌ Error rolling back migration 022:', error);
    throw error;
  }
};

module.exports = { up, down };
