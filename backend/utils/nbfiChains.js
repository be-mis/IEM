// runtime helper to load allowed NBFI chain codes from the database
const { getPool } = require('../config/database');

const DEFAULT_CHAINS = ['SM', 'RDS', 'WDS'];

async function getAllowedChains(pool) {
  try {
    const p = pool || getPool();
    const [rows] = await p.execute('SELECT chainCode FROM nbfi_chains');
    if (!Array.isArray(rows) || rows.length === 0) return DEFAULT_CHAINS;
    return rows.map(r => String(r.chainCode || '').trim().toUpperCase()).filter(Boolean);
  } catch (err) {
    // If the table doesn't exist or any error occurs, fallback to defaults
    return DEFAULT_CHAINS;
  }
}

module.exports = { getAllowedChains };
