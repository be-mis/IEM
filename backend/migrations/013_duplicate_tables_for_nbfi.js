/**
 * Migration: Duplicate EPC tables for NBFI
 * Creates NBFI versions of all EPC tables and copies data, changing 'epc' to 'nbfi'
 */

const up = async (pool) => {
  console.log('📝 Running migration: 013_duplicate_tables_for_nbfi');
  
  try {
    // Copy table structures directly by creating tables based on existing EPC tables
    
    // 1. Create nbfi_chains (copy of epc_chains)
    console.log('Creating nbfi_chains table...');
    await pool.execute(`CREATE TABLE IF NOT EXISTS nbfi_chains LIKE epc_chains`);
    await pool.execute(`INSERT INTO nbfi_chains SELECT * FROM epc_chains`);
    console.log('✅ Created and populated nbfi_chains');

    // 2. Create nbfi_categories (copy of epc_categories)
    console.log('Creating nbfi_categories table...');
    await pool.execute(`CREATE TABLE IF NOT EXISTS nbfi_categories LIKE epc_categories`);
    await pool.execute(`INSERT INTO nbfi_categories SELECT * FROM epc_categories`);
    console.log('✅ Created and populated nbfi_categories');

    // 3. Create nbfi_store_class (copy of epc_store_class)
    console.log('Creating nbfi_store_class table...');
    await pool.execute(`CREATE TABLE IF NOT EXISTS nbfi_store_class LIKE epc_store_class`);
    await pool.execute(`INSERT INTO nbfi_store_class SELECT * FROM epc_store_class`);
    console.log('✅ Created and populated nbfi_store_class');

    // 4. Create nbfi_stores (copy of epc_stores, renamed to stores for NBFI)
    console.log('Creating nbfi_stores table...');
    await pool.execute(`CREATE TABLE IF NOT EXISTS nbfi_stores LIKE epc_stores`);
    // Remove foreign key constraints that reference epc tables
    await pool.execute(`ALTER TABLE nbfi_stores DROP FOREIGN KEY IF EXISTS nbfi_stores_ibfk_1`);
    await pool.execute(`ALTER TABLE nbfi_stores DROP FOREIGN KEY IF EXISTS nbfi_stores_ibfk_2`);
    await pool.execute(`INSERT INTO nbfi_stores SELECT * FROM epc_stores`);
    // Rename columns to use store terminology
    await pool.execute(`ALTER TABLE nbfi_stores CHANGE COLUMN storeCode storeCode VARCHAR(20) NOT NULL`);
    await pool.execute(`ALTER TABLE nbfi_stores CHANGE COLUMN storeName storeName VARCHAR(150) NOT NULL`);
    console.log('✅ Created and populated nbfi_stores');

    // 5. Create nbfi_item_list (copy of epc_item_list)
    console.log('Creating nbfi_item_list table...');
    await pool.execute(`CREATE TABLE IF NOT EXISTS nbfi_item_list LIKE epc_item_list`);
    await pool.execute(`ALTER TABLE nbfi_item_list DROP FOREIGN KEY IF EXISTS nbfi_item_list_ibfk_1`);
    await pool.execute(`INSERT INTO nbfi_item_list SELECT * FROM epc_item_list`);
    console.log('✅ Created and populated nbfi_item_list');

    // 6. Create nbfi_item_exclusivity_list (copy of epc_item_exclusivity_list)
    console.log('Creating nbfi_item_exclusivity_list table...');
    await pool.execute(`CREATE TABLE IF NOT EXISTS nbfi_item_exclusivity_list LIKE epc_item_exclusivity_list`);
    await pool.execute(`ALTER TABLE nbfi_item_exclusivity_list DROP FOREIGN KEY IF EXISTS nbfi_item_exclusivity_list_ibfk_1`);
    await pool.execute(`ALTER TABLE nbfi_item_exclusivity_list DROP FOREIGN KEY IF EXISTS nbfi_item_exclusivity_list_ibfk_2`);
    await pool.execute(`ALTER TABLE nbfi_item_exclusivity_list DROP FOREIGN KEY IF EXISTS nbfi_item_exclusivity_list_ibfk_3`);
    await pool.execute(`ALTER TABLE nbfi_item_exclusivity_list DROP FOREIGN KEY IF EXISTS nbfi_item_exclusivity_list_ibfk_4`);
    await pool.execute(`ALTER TABLE nbfi_item_exclusivity_list DROP FOREIGN KEY IF EXISTS nbfi_item_exclusivity_list_ibfk_5`);
    await pool.execute(`INSERT INTO nbfi_item_exclusivity_list SELECT * FROM epc_item_exclusivity_list`);
    console.log('✅ Created and populated nbfi_item_exclusivity_list');
    console.log('✅ Created and populated nbfi_item_exclusivity_list');

    console.log('✅ Successfully created all NBFI tables and copied data from EPC tables');

  } catch (error) {
    console.error('❌ Error in migration 013:', error);
    throw error;
  }
};

const down = async (pool) => {
  console.log('🔄 Rolling back migration: 013_duplicate_tables_for_nbfi');
  
  // Drop tables in reverse order (to handle foreign key constraints)
  await pool.execute('DROP TABLE IF EXISTS nbfi_item_exclusivity_list');
  console.log('✅ Dropped nbfi_item_exclusivity_list');
  
  await pool.execute('DROP TABLE IF EXISTS nbfi_item_list');
  console.log('✅ Dropped nbfi_item_list');
  
  await pool.execute('DROP TABLE IF EXISTS nbfi_stores');
  console.log('✅ Dropped nbfi_stores');
  
  await pool.execute('DROP TABLE IF EXISTS nbfi_store_class');
  console.log('✅ Dropped nbfi_store_class');
  
  await pool.execute('DROP TABLE IF EXISTS nbfi_categories');
  console.log('✅ Dropped nbfi_categories');
  
  await pool.execute('DROP TABLE IF EXISTS nbfi_chains');
  console.log('✅ Dropped nbfi_chains');
  
  console.log('✅ Rolled back migration 013');
};

module.exports = { up, down };
