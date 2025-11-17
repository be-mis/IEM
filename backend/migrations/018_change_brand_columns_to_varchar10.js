/**
 * Migration: Change brand_* columns to VARCHAR(10)
 * This updates all brand_* columns in nbfi_store_exclusivity_list and nbfi_stores
 * to be VARCHAR(10) NULL. The down migration reverts them back to TINYINT(1) DEFAULT 0 NULL.
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
  console.log('📝 Running migration: 018_change_brand_columns_to_varchar10');
  try {
    const [brands] = await pool.execute('SELECT brandCode, brand FROM nbfi_brands');

    for (const b of brands) {
      const code = String(b.brandCode || b.brand || '').trim();
      if (!code) continue;
      const col = `brand_${sanitize(code)}`;

      // nbfi_store_exclusivity_list
      const [cols1] = await pool.execute(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'nbfi_store_exclusivity_list' AND COLUMN_NAME = ?`, [col]);
      if (Array.isArray(cols1) && cols1.length > 0) {
        console.log(`Altering nbfi_store_exclusivity_list.${col} -> VARCHAR(10)`);
        await pool.execute(`ALTER TABLE nbfi_store_exclusivity_list MODIFY COLUMN \`${col}\` VARCHAR(10) NULL`);
      }

      // nbfi_stores
      const [cols2] = await pool.execute(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'nbfi_stores' AND COLUMN_NAME = ?`, [col]);
      if (Array.isArray(cols2) && cols2.length > 0) {
        console.log(`Altering nbfi_stores.${col} -> VARCHAR(10)`);
        await pool.execute(`ALTER TABLE nbfi_stores MODIFY COLUMN \`${col}\` VARCHAR(10) NULL`);
      }
    }

    console.log('✅ Migration 018 completed successfully');
  } catch (error) {
    console.error('❌ Error in migration 018:', error);
    throw error;
  }
};

const down = async (pool) => {
  console.log('🔄 Rolling back migration: 018_change_brand_columns_to_varchar10');
  try {
    const [brands] = await pool.execute('SELECT brandCode, brand FROM nbfi_brands');

    for (const b of brands) {
      const code = String(b.brandCode || b.brand || '').trim();
      if (!code) continue;
      const col = `brand_${sanitize(code)}`;

      // nbfi_store_exclusivity_list
      const [cols1] = await pool.execute(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'nbfi_store_exclusivity_list' AND COLUMN_NAME = ?`, [col]);
      if (Array.isArray(cols1) && cols1.length > 0) {
        console.log(`Reverting nbfi_store_exclusivity_list.${col} -> TINYINT(1)`);
        await pool.execute(`ALTER TABLE nbfi_store_exclusivity_list MODIFY COLUMN \`${col}\` TINYINT(1) DEFAULT 0 NULL`);
      }

      // nbfi_stores
      const [cols2] = await pool.execute(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'nbfi_stores' AND COLUMN_NAME = ?`, [col]);
      if (Array.isArray(cols2) && cols2.length > 0) {
        console.log(`Reverting nbfi_stores.${col} -> TINYINT(1)`);
        await pool.execute(`ALTER TABLE nbfi_stores MODIFY COLUMN \`${col}\` TINYINT(1) DEFAULT 0 NULL`);
      }
    }

    console.log('✅ Rolled back migration 018');
  } catch (error) {
    console.error('❌ Error rolling back migration 018:', error);
    throw error;
  }
};

module.exports = { up, down };
