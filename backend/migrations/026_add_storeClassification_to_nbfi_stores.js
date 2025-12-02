/**
 * Migration: Add `storeClassification` column to `nbfi_stores`
 * - Adds `storeClassification` VARCHAR(50) NULL AFTER `chainCode`.
 * - Down migration drops the column if present.
 */

const up = async (pool) => {
  console.log('📝 Running migration: 026_add_storeClassification_to_nbfi_stores');
  try {
    const [cols] = await pool.execute(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'nbfi_stores' AND COLUMN_NAME = 'storeClassification'`);

    if (!Array.isArray(cols) || cols.length === 0) {
      console.log('Adding column storeClassification to nbfi_stores...');
      await pool.execute("ALTER TABLE nbfi_stores ADD COLUMN `storeClassification` VARCHAR(50) DEFAULT NULL AFTER `chainCode`");
      console.log('✅ Added storeClassification to nbfi_stores');
    } else {
      console.log('ℹ️ Column storeClassification already exists in nbfi_stores; skipping');
    }

    console.log('✅ Migration 026 completed successfully');
  } catch (error) {
    console.error('❌ Error in migration 026:', error);
    throw error;
  }
};

const down = async (pool) => {
  console.log('🔄 Rolling back migration: 026_add_storeClassification_to_nbfi_stores');
  try {
    const [cols] = await pool.execute(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'nbfi_stores' AND COLUMN_NAME = 'storeClassification'`);

    if (Array.isArray(cols) && cols.length > 0) {
      console.log('Dropping column storeClassification from nbfi_stores...');
      await pool.execute('ALTER TABLE nbfi_stores DROP COLUMN `storeClassification`');
      console.log('✅ Dropped storeClassification');
    } else {
      console.log('ℹ️ Column storeClassification does not exist in nbfi_stores; skipping');
    }

    console.log('✅ Rolled back migration 026');
  } catch (error) {
    console.error('❌ Error rolling back migration 026:', error);
    throw error;
  }
};

module.exports = { up, down };