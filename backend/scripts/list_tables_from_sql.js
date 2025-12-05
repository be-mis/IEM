const fs = require('fs').promises;
const path = require('path');

(async () => {
  try {
    const sqlPath = path.join(__dirname, '..', 'sql', 'item_exclusivity.sql');
    const raw = await fs.readFile(sqlPath, 'utf8');

    const creates = [];
    const createRegex = /CREATE TABLE\s+`([^`]+)`\s*\(([\s\S]*?)\)\s*ENGINE=/gi;
    let m;
    while ((m = createRegex.exec(raw)) !== null) {
      creates.push({ name: m[1], body: m[2].trim() });
    }

    const alters = [];
    const alterRegex = /ALTER TABLE\s+`([^`]+)`([\s\S]*?)\;/gi;
    while ((m = alterRegex.exec(raw)) !== null) {
      alters.push({ name: m[1], stmt: m[2].trim() });
    }

    console.log(`Found ${creates.length} CREATE TABLE(s) and ${alters.length} ALTER TABLE statement(s) in the dump.`);
    console.log('---');

    for (const c of creates) {
      console.log(`CREATE TABLE: ${c.name}`);
      const preview = c.body.split('\n').slice(0, 6).map(l => l.trim()).join(' | ');
      console.log(`  Columns preview: ${preview}${c.body.split('\n').length > 6 ? ' | ...' : ''}`);
      console.log('');
    }

    for (const a of alters) {
      console.log(`ALTER TABLE: ${a.name}`);
      const preview = a.stmt.split('\n').slice(0, 3).map(l => l.trim()).join(' | ');
      console.log(`  Statement preview: ${preview}${a.stmt.split('\n').length > 3 ? ' | ...' : ''}`);
      console.log('');
    }

    console.log('---\nScan complete.');
  } catch (err) {
    console.error('Scan failed:', err.message);
    process.exit(1);
  }
})();
