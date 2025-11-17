/**
 * Migration: Add brand_* columns to nbfi_store_exclusivity_list
 * For each brand in nbfi_brands, this migration will add a column
 * named `brand_<sanitized_brandCode>` (lowercase, spaces -> underscores,
 * non-alphanum removed). Columns are TINYINT(1) DEFAULT 0.
 *
 * The down migration will drop these columns.
 */

const sanitize = (s) => {
  if (!s) return '';
  // Default: replace spaces with underscore and strip non-alphanum
  let out = String(s).trim().replace(/\s+/g, '_').replace(/[^A-Za-z0-9_]/g, '').toLowerCase();
  // Special-cases: prefer no underscore for these brands
  if (out === 'jumping_beans') out = 'jumpingbeans';
  if (out === 'justice_league') out = 'justiceleague';
  if (out === 'island_haze') out = 'islandhaze';
  return out;
};

const up = async (pool) => {
  console.log('📝 Running migration: 016_add_brand_columns_to_nbfi_store_exclusivity_list');
  try {
    // Read brands
    const [brands] = await pool.execute('SELECT brandCode, brand FROM nbfi_brands');

    for (const b of brands) {
      const code = String(b.brandCode || b.brand || '').trim();
      if (!code) continue;
      const col = `brand_${sanitize(code)}`;

      // check if column exists
      const [cols] = await pool.execute(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'nbfi_store_exclusivity_list' AND COLUMN_NAME = ?`, [col]);

      if (!Array.isArray(cols) || cols.length === 0) {
        console.log(`Adding column ${col} for brand ${code}...`);
        // Build SQL string explicitly because some DDL statements don't accept parameter placeholders for identifiers/comments
        const comment = String(b.brand || '').replace(/'/g, "''");
        const sql = `ALTER TABLE nbfi_store_exclusivity_list ADD COLUMN \`${col}\` TINYINT(1) DEFAULT 0 NULL COMMENT '${comment}' AFTER storeClassification`;
        await pool.execute(sql);
        console.log(`✅ Added ${col}`);
      } else {
        console.log(`ℹ️ Column ${col} already exists; skipping`);
      }
    }

    console.log('✅ Migration 016 completed successfully');
  } catch (error) {
    console.error('❌ Error in migration 016:', error);
    throw error;
  }
};

const down = async (pool) => {
  console.log('🔄 Rolling back migration: 016_add_brand_columns_to_nbfi_store_exclusivity_list');
  try {
    const [brands] = await pool.execute('SELECT brandCode, brand FROM nbfi_brands');

    for (const b of brands) {
      const code = String(b.brandCode || b.brand || '').trim();
      if (!code) continue;
      const col = `brand_${sanitize(code)}`;

      const [cols] = await pool.execute(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'nbfi_store_exclusivity_list' AND COLUMN_NAME = ?`, [col]);

      if (Array.isArray(cols) && cols.length > 0) {
        console.log(`Dropping column ${col}...`);
        await pool.execute(`ALTER TABLE nbfi_store_exclusivity_list DROP COLUMN \`${col}\``);
        console.log(`✅ Dropped ${col}`);
      } else {
        console.log(`ℹ️ Column ${col} does not exist; skipping`);
      }
    }

    console.log('✅ Rolled back migration 016');
  } catch (error) {
    console.error('❌ Error rolling back migration 016:', error);
    throw error;
  }
};

module.exports = { up, down };
