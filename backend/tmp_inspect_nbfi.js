const mysql = require('mysql2/promise');
(async () => {
  try {
    const c = await mysql.createConnection({ host: 'localhost', user: 'root', password: '', database: 'item_exclusivity' });
    const [tables] = await c.execute("SHOW TABLES LIKE 'nbfi%'");
    console.log('NBFI TABLES:', tables.map(t => Object.values(t)[0]));
    const check = ['nbfi_item_list','nbfi_item_exclusivity_list','nbfi_items','nbfi_items_list','nbfi_item_exclusivities','nbfi_item_exclusivities_list'];
    for (const name of check) {
      try {
        const [cols] = await c.execute('DESCRIBE `' + name + '`');
        console.log('\nDESCRIBE', name, cols.map(c => c.Field));
      } catch (e) {
        // ignore
      }
    }
    await c.end();
  } catch (err) {
    console.error('Error inspecting DB:', err && err.message ? err.message : err);
  }
})();
