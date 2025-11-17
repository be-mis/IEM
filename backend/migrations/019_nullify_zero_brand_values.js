/**
 * Migration: Nullify '0' values in brand_* columns
 * This migration will set brand_* = NULL where the value is the string '0' or numeric 0.
 * The down migration will convert NULLs back to the string '0'.
 */

const sanitize = (s) => {
  if (!s) return '';
  let out = String(s).trim().replace(/\s+/g, '_').replace(/[^A-Za-z0-9_]/g, '').toLowerCase();
  if (out === 'jumping_beans') out = 'jumpingbeans';
  if (out === 'justice_league') out = 'justiceleague';
  if (out === 'island_haze') out = 'islandhaze';
  return out;
};

const up = async (pool) => {
  console.log('📝 Running migration: 019_nullify_zero_brand_values');
  try {
    const [brands] = await pool.execute('SELECT brandCode, brand FROM nbfi_brands');

    for (const b of brands) {
      const code = String(b.brandCode || b.brand || '').trim();
      if (!code) continue;
      const col = `brand_${sanitize(code)}`;

      // nbfi_store_exclusivity_list
      const [cols1] = await pool.execute(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'nbfi_store_exclusivity_list' AND COLUMN_NAME = ?`, [col]);
      if (Array.isArray(cols1) && cols1.length > 0) {
        console.log(`Nullifying nbfi_store_exclusivity_list.${col} values equal to '0'...`);
        await pool.execute(`UPDATE nbfi_store_exclusivity_list SET \`${col}\` = NULL WHERE TRIM(COALESCE(\`${col}\`, '')) = '0'`);
      }

      // nbfi_stores
      const [cols2] = await pool.execute(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'nbfi_stores' AND COLUMN_NAME = ?`, [col]);
      if (Array.isArray(cols2) && cols2.length > 0) {
        console.log(`Nullifying nbfi_stores.${col} values equal to '0'...`);
        await pool.execute(`UPDATE nbfi_stores SET \`${col}\` = NULL WHERE TRIM(COALESCE(\`${col}\`, '')) = '0'`);
      }
    }

    console.log('✅ Migration 019 completed successfully');
  } catch (error) {
    console.error('❌ Error in migration 019:', error);
    throw error;
  }
};

const down = async (pool) => {
  console.log('🔄 Rolling back migration: 019_nullify_zero_brand_values');
  try {
    const [brands] = await pool.execute('SELECT brandCode, brand FROM nbfi_brands');

    for (const b of brands) {
      const code = String(b.brandCode || b.brand || '').trim();
      if (!code) continue;
      const col = `brand_${sanitize(code)}`;

      // nbfi_store_exclusivity_list
      const [cols1] = await pool.execute(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'nbfi_store_exclusivity_list' AND COLUMN_NAME = ?`, [col]);
      if (Array.isArray(cols1) && cols1.length > 0) {
        console.log(`Reverting NULLs to '0' in nbfi_store_exclusivity_list.${col}...`);
        await pool.execute(`UPDATE nbfi_store_exclusivity_list SET \`${col}\` = '0' WHERE \`${col}\` IS NULL`);
      }

      // nbfi_stores
      const [cols2] = await pool.execute(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'nbfi_stores' AND COLUMN_NAME = ?`, [col]);
      if (Array.isArray(cols2) && cols2.length > 0) {
        console.log(`Reverting NULLs to '0' in nbfi_stores.${col}...`);
        await pool.execute(`UPDATE nbfi_stores SET \`${col}\` = '0' WHERE \`${col}\` IS NULL`);
      }
    }

    console.log('✅ Rolled back migration 019');
  } catch (error) {
    console.error('❌ Error rolling back migration 019:', error);
    throw error;
  }
};

module.exports = { up, down };
