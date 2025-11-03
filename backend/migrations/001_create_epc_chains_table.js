/**
 * Migration: Create epc_chains table
 * Created: 2025-11-03
 * Description: Creates the chains lookup table for storing chain information
 */

const up = async (pool) => {
  console.log('📝 Running migration: 001_create_epc_chains_table');
  
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS epc_chains (
      id INT(11) NOT NULL AUTO_INCREMENT,
      chainCode VARCHAR(10) NOT NULL,
      chainName VARCHAR(255) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY (chainCode)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci
  `);

  // Insert default data
  const chains = [
    ['vChain', 'VARIOUS CHAIN'],
    ['sMH', 'SM HOMEWORLD'],
    ['oH', 'OUR HOME']
  ];

  for (const [chainCode, chainName] of chains) {
    await pool.execute(`
      INSERT IGNORE INTO epc_chains (chainCode, chainName) 
      VALUES (?, ?)
    `, [chainCode, chainName]);
  }

  console.log('✅ Created epc_chains table and inserted default data');
};

const down = async (pool) => {
  console.log('🔄 Rolling back migration: 001_create_epc_chains_table');
  await pool.execute('DROP TABLE IF EXISTS epc_chains');
  console.log('✅ Dropped epc_chains table');
};

module.exports = { up, down };
