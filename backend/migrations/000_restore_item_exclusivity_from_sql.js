const fs = require('fs').promises;
const path = require('path');

const up = async (pool) => {
  console.log('📝 Running migration: 000_restore_item_exclusivity_from_sql');

  const sqlPath = path.join(__dirname, '..', 'sql', 'item_exclusivity.sql');
  const raw = await fs.readFile(sqlPath, 'utf8');

  // Split statements on semicolon followed by newline or end-of-string
  const parts = raw.split(/;\s*(?:\r?\n|$)/g).map(s => s && s.trim()).filter(Boolean);

  for (const stmt of parts) {
    const t = stmt.trim();
    if (!t) continue;

    // Skip client directives and comments
    if (t.startsWith('--')) continue;
    const upCase = t.toUpperCase();
    if (upCase.startsWith('SET') || upCase.startsWith('START TRANSACTION') || upCase.startsWith('COMMIT')) continue;
    if (t.startsWith('/*') || t.startsWith('/*!')) continue;

    try {
      // Execute statement directly
      await pool.execute(t);
    } catch (err) {
      console.error('Error executing statement (truncated):', t.slice(0, 200));
      throw err;
    }
  }

  console.log('✅ Restored schema from SQL file');
};

const down = async (pool) => {
  console.log('🔄 Rolling back migration: 000_restore_item_exclusivity_from_sql');

  const sqlPath = path.join(__dirname, '..', 'sql', 'item_exclusivity.sql');
  const raw = await fs.readFile(sqlPath, 'utf8');

  // Collect created table names from the dump
  const tableNames = [];
  const createRegex = /CREATE TABLE\s+`([^`]+)`/gi;
  let m;
  while ((m = createRegex.exec(raw)) !== null) {
    const name = m[1];
    // Avoid dropping migrations table to preserve migration history
    if (name === 'migrations') continue;
    tableNames.push(name);
  }

  // Drop in reverse order (best-effort)
  for (const tbl of tableNames.reverse()) {
    try {
      await pool.execute(`DROP TABLE IF EXISTS \`${tbl}\``);
      console.log(`✅ Dropped ${tbl}`);
    } catch (err) {
      console.error(`❌ Failed to drop ${tbl}: ${err.message}`);
      throw err;
    }
  }
};

module.exports = { up, down };
