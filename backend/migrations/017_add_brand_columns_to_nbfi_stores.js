/**
 * Migration: Add brand_* columns to nbfi_stores
 * For each brand in nbfi_brands, this migration will add a column
 * named `brand_<sanitized_brandCode>` (lowercase, spaces -> underscores,
 * non-alphanum removed). Columns are TINYINT(1) DEFAULT 0.
 *
 * The down migration will drop these columns.
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
  console.log('📝 Running migration: 017_add_brand_columns_to_nbfi_stores');
  try {
    // Read brands
    const [brands] = await pool.execute('SELECT brandCode, brand FROM nbfi_brands');

    for (const b of brands) {
      const code = String(b.brandCode || b.brand || '').trim();
      if (!code) continue;
      const col = `brand_${sanitize(code)}`;

      // check if column exists
      const [cols] = await pool.execute(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'nbfi_stores' AND COLUMN_NAME = ?`, [col]);

      if (!Array.isArray(cols) || cols.length === 0) {
        console.log(`Adding column ${col} for brand ${code} to nbfi_stores...`);
        const comment = String(b.brand || '').replace(/'/g, "''");
        const sql = `ALTER TABLE nbfi_stores ADD COLUMN \`${col}\` TINYINT(1) DEFAULT 0 NULL COMMENT '${comment}' AFTER chainCode`;
        await pool.execute(sql);
        console.log(`✅ Added ${col} to nbfi_stores`);
      } else {
        console.log(`ℹ️ Column ${col} already exists in nbfi_stores; skipping`);
      }
    }

    console.log('✅ Migration 017 completed successfully');
  } catch (error) {
    console.error('❌ Error in migration 017:', error);
    throw error;
  }
};

const down = async (pool) => {
  console.log('🔄 Rolling back migration: 017_add_brand_columns_to_nbfi_stores');
  try {
    const [brands] = await pool.execute('SELECT brandCode, brand FROM nbfi_brands');

    for (const b of brands) {
      const code = String(b.brandCode || b.brand || '').trim();
      if (!code) continue;
      const col = `brand_${sanitize(code)}`;

      const [cols] = await pool.execute(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'nbfi_stores' AND COLUMN_NAME = ?`, [col]);

      if (Array.isArray(cols) && cols.length > 0) {
        console.log(`Dropping column ${col} from nbfi_stores...`);
        await pool.execute(`ALTER TABLE nbfi_stores DROP COLUMN \`${col}\``);
        console.log(`✅ Dropped ${col}`);
      } else {
        console.log(`ℹ️ Column ${col} does not exist in nbfi_stores; skipping`);
      }
    }

    console.log('✅ Rolled back migration 017');
  } catch (error) {
    console.error('❌ Error rolling back migration 017:', error);
    throw error;
  }
};

module.exports = { up, down };
