/**
 * Migration: Create epc_item_list table
 * Created: 2025-11-03
 * Description: Creates the master item list table
 */

const up = async (pool) => {
  console.log('📝 Running migration: 005_create_epc_item_list_table');
  
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS epc_item_list (
      id INT(11) NOT NULL AUTO_INCREMENT,
      itemCode VARCHAR(16) NOT NULL,
      itemDescription VARCHAR(50) NOT NULL,
      itemCategory VARCHAR(15) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci
  `);

  // Insert sample data from SQL dump
  const sampleItems = [
    ['2010021398261839', 'ADAIR FLOOR LAMP', 'Lamps'],
    ['2010030199171167', 'ADELLA (OLD CODE) VINTAGE CLOCK', 'Clocks'],
    ['2010030498013467', 'AEGEAN / ETHAN 3D WALL CLOCK', 'Clocks'],
    ['2010020198018168', 'AEGEAN ALICIA TABLE LAMP', 'Lamps'],
    ['2010012098170025', 'AEGEAN BLUSH CHAMBER CNVS ART', 'Decors'],
    ['2010010798170134', 'AEGEAN CITY LIFE SET OF 3 WALL FRAME', 'Frames'],
    ['2010010798020133', 'AEGEAN EARTH TONES A SET OF 5 W. FRME', 'Frames'],
    ['2010030198021181', 'ANGIE  ROUND TABLE CLOCK', 'Clocks'],
    ['2010050204010013', 'AEGEAN WICKED DOTS PLLR CNDL', 'Decors'],
    ['2010010298160016', 'AUTUMN FAM FRAME - 3OPENING', 'Frames'],
    ['2010010398160019', 'BRY MEMO HOLDER + PLANNER', 'Stationery'],
    ['2010050598300016', 'BOTTLE STOPPER LED FAIRY LGHT', 'Decors'],
    ['2010020298187043', 'ESS BEAU DIMMABLE LED DESK LAMP', 'Lamps'],
    ['2010030298160003', 'ESS BIANCA DIGITAL CLOCK', 'Clocks'],
    ['2070010198220005', 'REUSABLE / WITH BREATHING VALVECLOTH MASK', 'Stationery'],
    ['2030021098130101', 'FLAMINGO GRP TUMBLE W/ STRAW', 'Stationery'],
    ['2030013098980003', 'MINI WACKY FACES HGHLGHTR SET', 'Stationery'],
    ['2010030198171195', 'ESS BELINDA VINTAGE TABLE CLOCK', 'Clocks'],
    ['2010010104160019', 'ESS CAVERN A PHOTO FRAME 8x10', 'Frames'],
    ['2010042798030001', 'ESS DECOR. BALLS MAGNIFICO', 'Decors']
  ];

  for (const item of sampleItems) {
    await pool.execute(`
      INSERT IGNORE INTO epc_item_list 
      (itemCode, itemDescription, itemCategory) 
      VALUES (?, ?, ?)
    `, item);
  }

  console.log('✅ Created epc_item_list table and inserted sample data');
};

const down = async (pool) => {
  console.log('🔄 Rolling back migration: 005_create_epc_item_list_table');
  await pool.execute('DROP TABLE IF EXISTS epc_item_list');
  console.log('✅ Dropped epc_item_list table');
};

module.exports = { up, down };
