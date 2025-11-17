/**
 * Migration: Create NBFI Item Exclusivity Table
 * Creates a simple store-item exclusivity mapping table for NBFI
 * Note: nbfi_store_exclusivity_list already exists for store classifications
 * This creates nbfi_item_exclusivity for item exclusions per store
 */

const up = async (pool) => {
  console.log('📝 Running migration: 014_create_nbfi_item_exclusivity');
  
  try {
    // Create nbfi_item_exclusivity table (for store-item exclusions)
    console.log('Creating nbfi_item_exclusivity table...');
    await pool.execute(`
      CREATE TABLE IF NOT EXISTS nbfi_item_exclusivity (
        id INT AUTO_INCREMENT PRIMARY KEY,
        storeCode VARCHAR(20) NOT NULL,
        itemCode VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_store_item (storeCode, itemCode),
        INDEX idx_storeCode (storeCode),
        INDEX idx_itemCode (itemCode)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Created nbfi_item_exclusivity table');

    console.log('✅ Migration 014 completed successfully');

  } catch (error) {
    console.error('❌ Error in migration 014:', error);
    throw error;
  }
};

const down = async (pool) => {
  console.log('🔄 Rolling back migration: 014_create_nbfi_item_exclusivity');
  
  await pool.execute('DROP TABLE IF EXISTS nbfi_item_exclusivity');
  console.log('✅ Dropped nbfi_item_exclusivity');
  
  console.log('✅ Rolled back migration 014');
};

module.exports = { up, down };
