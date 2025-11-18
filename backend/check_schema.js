const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'item_exclusivity'
  });
  
  console.log('\n=== All BARBIZON items in nbfi_item_list ===');
  const [items] = await conn.execute(
    'SELECT itemCode, itemDescription FROM nbfi_item_list WHERE itemBrand = ?',
    ['BARBIZON']
  );
  console.log('Total items:', items.length);
  items.forEach((r, i) => console.log(`  ${i+1}. ${r.itemCode} - ${r.itemDescription}`));
  
  console.log('\n=== Items in nbfi_sm_item_exclusivity_list with ASEH=1 ===');
  const [excluded] = await conn.execute(
    'SELECT itemCode, ASEH FROM nbfi_sm_item_exclusivity_list WHERE ASEH = 1'
  );
  console.log('Total excluded:', excluded.length);
  excluded.forEach(r => console.log(`  ${r.itemCode} (ASEH=${r.ASEH})`));
  
  console.log('\n=== JOIN query (what /nbfi/exclusivity-items returns) ===');
  const [joinResult] = await conn.execute(`
    SELECT DISTINCT i.itemCode, i.itemDescription, i.itemBrand
    FROM nbfi_item_list i
    INNER JOIN nbfi_sm_item_exclusivity_list e ON i.itemCode = e.itemCode
    WHERE LOWER(i.itemBrand) = LOWER('BARBIZON')
      AND e.ASEH = 1
    ORDER BY i.itemCode ASC
  `);
  console.log('Items with ASEH=1:', joinResult.length);
  joinResult.forEach(r => console.log(`  ${r.itemCode} - ${r.itemDescription}`));
  
  console.log('\n=== LEFT JOIN query (what /nbfi/items-for-assignment returns) ===');
  const [leftJoin] = await conn.execute(`
    SELECT DISTINCT i.itemCode, i.itemDescription, i.itemBrand
    FROM nbfi_item_list i
    LEFT JOIN nbfi_sm_item_exclusivity_list e ON i.itemCode = e.itemCode
    WHERE LOWER(i.itemBrand) = LOWER('BARBIZON')
      AND (e.itemCode IS NULL OR e.ASEH IS NULL OR e.ASEH != 1)
    ORDER BY i.itemCode ASC
  `);
  console.log('Available items (not ASEH=1):', leftJoin.length);
  leftJoin.forEach(r => console.log(`  ${r.itemCode} - ${r.itemDescription}`));
  
  await conn.end();
})();
