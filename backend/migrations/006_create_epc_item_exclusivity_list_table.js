/**
 * Migration: Create epc_item_exclusivity_list table
 * Created: 2025-11-03
 * Description: Creates the item exclusivity matrix table with chain/store class combinations
 */

const up = async (pool) => {
  console.log('📝 Running migration: 006_create_epc_item_exclusivity_list_table');
  
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS epc_item_exclusivity_list (
      id INT(10) NOT NULL AUTO_INCREMENT,
      itemCode VARCHAR(20) NOT NULL,
      vChainASEH INT(2) DEFAULT NULL,
      vChainBSH INT(2) DEFAULT NULL,
      vChainCSM INT(2) DEFAULT NULL,
      vChainDSS INT(2) DEFAULT NULL,
      vChainESES INT(2) DEFAULT NULL,
      sMHASEH INT(2) DEFAULT NULL,
      sMHBSH INT(2) DEFAULT NULL,
      sMHCSM INT(2) DEFAULT NULL,
      sMHDSS INT(2) DEFAULT NULL,
      sMHESES INT(2) DEFAULT NULL,
      oHASEH INT(2) DEFAULT NULL,
      oHBSH INT(2) DEFAULT NULL,
      oHCSM INT(2) DEFAULT NULL,
      oHDSS INT(2) DEFAULT NULL,
      oHESES INT(2) DEFAULT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci
  `);

  // Insert sample data from SQL dump
  const sampleExclusivity = [
    ['2010021398261839', 1, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    ['2010030199171167', 1, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    ['2010030498013467', 1, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    ['2010020198018168', 1, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    ['2010012098170025', 1, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
  ];

  for (const item of sampleExclusivity) {
    await pool.execute(`
      INSERT IGNORE INTO epc_item_exclusivity_list 
      (itemCode, vChainASEH, vChainBSH, vChainCSM, vChainDSS, vChainESES, 
       sMHASEH, sMHBSH, sMHCSM, sMHDSS, sMHESES, 
       oHASEH, oHBSH, oHCSM, oHDSS, oHESES) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, item);
  }

  console.log('✅ Created epc_item_exclusivity_list table and inserted sample data');
};

const down = async (pool) => {
  console.log('🔄 Rolling back migration: 006_create_epc_item_exclusivity_list_table');
  await pool.execute('DROP TABLE IF EXISTS epc_item_exclusivity_list');
  console.log('✅ Dropped epc_item_exclusivity_list table');
};

module.exports = { up, down };
