/**
 * Migration: Remove storeBrand from nbfi_store_exclusivity_list
 * This migration will drop the `storeBrand` column if it exists.
 * The down migration will add the column back as VARCHAR(15) NULL.
 */

const up = async (pool) => {
  console.log('📝 Running migration: 015_remove_storeBrand_from_nbfi_store_exclusivity_list');
  try {
    // Check if column exists before attempting to drop
    const [cols] = await pool.execute(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'nbfi_store_exclusivity_list' AND COLUMN_NAME = 'storeBrand'
    `);

    if (Array.isArray(cols) && cols.length > 0) {
      console.log('Dropping column storeBrand from nbfi_store_exclusivity_list...');
      await pool.execute(`ALTER TABLE nbfi_store_exclusivity_list DROP COLUMN storeBrand`);
      console.log('✅ Dropped storeBrand');
    } else {
      console.log('ℹ️ Column storeBrand does not exist; nothing to do');
    }

    console.log('✅ Migration 015 completed successfully');
  } catch (error) {
    console.error('❌ Error in migration 015:', error);
    throw error;
  }
};

const down = async (pool) => {
  console.log('🔄 Rolling back migration: 015_remove_storeBrand_from_nbfi_store_exclusivity_list');
  try {
    // Add the column back if it does not exist
    const [cols] = await pool.execute(`
      SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'nbfi_store_exclusivity_list' AND COLUMN_NAME = 'storeBrand'
    `);

    if (!Array.isArray(cols) || cols.length === 0) {
      console.log('Adding column storeBrand to nbfi_store_exclusivity_list...');
      await pool.execute(`ALTER TABLE nbfi_store_exclusivity_list ADD COLUMN storeBrand VARCHAR(15) NULL AFTER storeClassification`);
      console.log('✅ Added storeBrand');
    } else {
      console.log('ℹ️ Column storeBrand already exists; nothing to do');
    }

    console.log('✅ Rolled back migration 015');
  } catch (error) {
    console.error('❌ Error rolling back migration 015:', error);
    throw error;
  }
};

module.exports = { up, down };
