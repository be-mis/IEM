const fs = require('fs').promises;
const path = require('path');

(async () => {
  try {
    const sqlPath = path.join(__dirname, '..', 'sql', 'item_exclusivity.sql');
    const raw = await fs.readFile(sqlPath, 'utf8');

    // Split statements on semicolon followed by newline or end-of-string
    // Split statements on semicolon followed by newline or end-of-string
    const parts = raw.split(/;\s*(?:\r?\n|$)/g).map(s => s && s.trim()).filter(Boolean);

    const statements = [];
    for (const stmt of parts) {
      let t = stmt.trim();
      if (!t) continue;

      // Handle MySQL-versioned comments like /*!40101 CREATE TABLE ... */
      if (t.startsWith('/*!')) {
        // Remove leading /*!digits and optional space
        t = t.replace(/^\/\!\d*\s?/, '');
        // Remove trailing */ if present
        if (t.endsWith('*/')) t = t.slice(0, -2).trim();
      }

      const up = t.toUpperCase();
      // Skip comments and client directives
      if (t.startsWith('--')) continue;
      if (up.startsWith('SET') || up.startsWith('START TRANSACTION') || up.startsWith('COMMIT')) continue;
      if (t.startsWith('/*') && !t.startsWith('/*!')) continue;

      statements.push(t);
    }

    console.log(`Found ${statements.length} executable statement(s) (dry-run).`);
    console.log('---');

    for (let i = 0; i < statements.length; i++) {
      const s = statements[i];
      console.log(`-- Statement ${i + 1} (${s.length} chars) --`);
      // Print full statement but limit very long single-line outputs for readability
      if (s.length > 2000) {
        console.log(s.slice(0, 2000) + '\n...[truncated]...');
      } else {
        console.log(s + '\n');
      }
    }

    console.log('---\nDry-run complete. No DB changes were made.');
  } catch (err) {
    console.error('Dry-run failed:', err.message);
    process.exit(1);
  }
})();
