/**
 * Migration: Create epc_store_class table
 * Created: 2025-11-03
 * Description: Creates the store classification lookup table
 */

const up = async (pool) => {
  console.log('📝 Running migration: 003_create_epc_store_class_table');
  
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS epc_store_class (
      id INT(11) NOT NULL AUTO_INCREMENT,
      storeClassCode VARCHAR(50) NOT NULL,
      storeClassification VARCHAR(255) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY (storeClassCode)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci
  `);

  // Insert default data
  const storeClasses = [
    ['ASEH', 'A Stores – Extra High'],
    ['BSH', 'B Stores – High'],
    ['CSM', 'C Stores – Medium'],
    ['DSS', 'D Stores – Small'],
    ['ESES', 'E Stores – Extra Small']
  ];

  for (const [storeClassCode, storeClassification] of storeClasses) {
    await pool.execute(`
      INSERT IGNORE INTO epc_store_class (storeClassCode, storeClassification) 
      VALUES (?, ?)
    `, [storeClassCode, storeClassification]);
  }

  console.log('✅ Created epc_store_class table and inserted default data');
};

const down = async (pool) => {
  console.log('🔄 Rolling back migration: 003_create_epc_store_class_table');
  await pool.execute('DROP TABLE IF EXISTS epc_store_class');
  console.log('✅ Dropped epc_store_class table');
};

module.exports = { up, down };
