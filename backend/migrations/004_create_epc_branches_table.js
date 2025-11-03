/**
 * Migration: Create epc_branches table
 * Created: 2025-11-03
 * Description: Creates the branches table with dynamic category classification columns
 */

const up = async (pool) => {
  console.log('📝 Running migration: 004_create_epc_branches_table');
  
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS epc_branches (
      branchCode VARCHAR(20) NOT NULL,
      branchName VARCHAR(150) NOT NULL,
      chainCode VARCHAR(20) DEFAULT NULL,
      lampsClass VARCHAR(50) DEFAULT NULL,
      decorsClass VARCHAR(50) DEFAULT NULL,
      clocksClass VARCHAR(50) DEFAULT NULL,
      stationeryClass VARCHAR(50) DEFAULT NULL,
      framesClass VARCHAR(50) DEFAULT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (branchCode),
      KEY idx_branchName (branchName)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC
  `);

  // Insert sample data from SQL dump
  const sampleBranches = [
    ['C-LAND001', 'THE LANDMARK DEPT STORE FILINVEST ALABANG', 'vChain', 'ASEH', null, null, null, null],
    ['C-LAND002', 'THE LANDMARK DEPT STORE MAKATI', 'vChain', 'ASEH', null, null, null, null],
    ['C-LAND003', 'THE LANDMARK DEPT STORE TRINOMA', 'vChain', null, null, null, null, null],
    ['C-LAND004', 'THE LANDMARK DEPT STORE  NUVALI', 'vChain', 'ASEH', null, null, null, null],
    ['C-LAND005', 'THE LANDMARK DEPT STORE MANILA BAY', 'vChain', 'ASEH', null, null, null, null]
  ];

  for (const branch of sampleBranches) {
    await pool.execute(`
      INSERT IGNORE INTO epc_branches 
      (branchCode, branchName, chainCode, lampsClass, decorsClass, clocksClass, stationeryClass, framesClass) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, branch);
  }

  console.log('✅ Created epc_branches table and inserted sample data');
};

const down = async (pool) => {
  console.log('🔄 Rolling back migration: 004_create_epc_branches_table');
  await pool.execute('DROP TABLE IF EXISTS epc_branches');
  console.log('✅ Dropped epc_branches table');
};

module.exports = { up, down };
