/**
 * Migration: Add unique constraint on itemCode in epc_item_exclusivity_list
 * Created: 2025-11-03
 * Description: Prevents duplicate itemCode entries and ensures data integrity
 */

const up = async (pool) => {
  console.log('📝 Running migration: 008_add_unique_itemcode_constraint');
  
  // First, remove any duplicate rows (keep only the first occurrence of each itemCode)
  await pool.execute(`
    DELETE e1 FROM epc_item_exclusivity_list e1
    INNER JOIN epc_item_exclusivity_list e2 
    WHERE e1.id > e2.id AND e1.itemCode = e2.itemCode
  `);
  
  // Add unique constraint on itemCode
  await pool.execute(`
    ALTER TABLE epc_item_exclusivity_list
    ADD UNIQUE KEY unique_itemcode (itemCode)
  `);

  console.log('✅ Added unique constraint on itemCode and removed duplicates');
};

const down = async (pool) => {
  console.log('🔄 Rolling back migration: 008_add_unique_itemcode_constraint');
  
  // Remove the unique constraint
  await pool.execute(`
    ALTER TABLE epc_item_exclusivity_list
    DROP INDEX unique_itemcode
  `);
  
  console.log('✅ Removed unique constraint on itemCode');
};

module.exports = { up, down };
