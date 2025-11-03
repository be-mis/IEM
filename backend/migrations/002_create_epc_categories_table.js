/**
 * Migration: Create epc_categories table
 * Created: 2025-11-03
 * Description: Creates the categories lookup table for storing item categories
 */

const up = async (pool) => {
  console.log('📝 Running migration: 002_create_epc_categories_table');
  
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS epc_categories (
      id INT(11) NOT NULL AUTO_INCREMENT,
      catCode VARCHAR(15) NOT NULL,
      category VARCHAR(15) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY (catCode)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci
  `);

  // Insert default data
  const categories = [
    ['Clocks', 'Clocks'],
    ['Decors', 'Decors'],
    ['Frames', 'Frames'],
    ['Lamps', 'Lamps'],
    ['Stationery', 'Stationery']
  ];

  for (const [catCode, category] of categories) {
    await pool.execute(`
      INSERT IGNORE INTO epc_categories (catCode, category) 
      VALUES (?, ?)
    `, [catCode, category]);
  }

  console.log('✅ Created epc_categories table and inserted default data');
};

const down = async (pool) => {
  console.log('🔄 Rolling back migration: 002_create_epc_categories_table');
  await pool.execute('DROP TABLE IF EXISTS epc_categories');
  console.log('✅ Dropped epc_categories table');
};

module.exports = { up, down };
