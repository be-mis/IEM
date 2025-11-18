/**
 * Migration: Create NBFI Item Exclusivity LIST (canonical per-item table)
 * Creates `nbfi_item_exclusivity_list` as the canonical per-item exclusivity table for NBFI.
 * This replaces the old per-store table (`nbfi_item_exclusivity`) and ensures a per-item list
 * exists for later migrations to add SM/RDS/WDS flags.
 */
const up = async (pool) => {
  console.log('📝 Running migration: 014_create_nbfi_item_exclusivity_list');

  try {
    // Create nbfi_item_exclusivity_list table (canonical per-item exclusivity list)
    console.log('Creating nbfi_item_exclusivity_list table...');
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS nbfi_item_exclusivity_list (
        itemCode VARCHAR(100) NOT NULL,
        created_at TIMESTAMP NULL DEFAULT NULL,
        updated_at TIMESTAMP NULL DEFAULT NULL,
        PRIMARY KEY (itemCode)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci
    `);
    console.log('✅ Created nbfi_item_exclusivity_list table');

    console.log('✅ Migration 014 completed successfully');

  } catch (error) {
    console.error('❌ Error in migration 014:', error);
    throw error;
  }
};

const down = async (pool) => {
  console.log('🔄 Rolling back migration: 014_create_nbfi_item_exclusivity_list');

  await pool.execute('DROP TABLE IF EXISTS nbfi_item_exclusivity_list');
  console.log('✅ Dropped nbfi_item_exclusivity_list');

  console.log('✅ Rolled back migration 014');
};

module.exports = { up, down };
