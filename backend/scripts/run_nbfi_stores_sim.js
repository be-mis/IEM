(async ()=>{
  try {
    const { connectDatabase, getPool } = require('../config/database');
    await connectDatabase();
    const pool = getPool();

    const chain='SM';
    const storeClass='ASEH';
    const category='UMBRO';
    const sanitize = (s) => String(s || '').trim().replace(/\s+/g, '_').replace(/[^A-Za-z0-9_]/g, '').toLowerCase();
    const brandCol = `brand_${sanitize(category)}`;

    const [colInfo] = await pool.execute(
      `SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'nbfi_stores' AND COLUMN_NAME = ?`,
      [brandCol]
    );
    console.log('colInfo', colInfo);
    const dataType = (colInfo[0].DATA_TYPE||'').toLowerCase();
    const numericTypes = new Set(['tinyint', 'int', 'smallint', 'mediumint', 'bigint', 'bit', 'boolean']);
    let query, params;
    if (numericTypes.has(dataType)){
      query = `SELECT DISTINCT s.storeCode, s.storeName, s.chainCode, s.storeClassification FROM nbfi_stores s WHERE s.chainCode = ? AND s.\`${brandCol}\` = 1 AND s.storeClassification = ? ORDER BY s.storeCode ASC`;
      params=[chain, storeClass];
    } else {
      query = `SELECT DISTINCT s.storeCode, s.storeName, s.chainCode, s.storeClassification FROM nbfi_stores s WHERE s.chainCode = ? AND (s.\`${brandCol}\` = ? OR s.\`${brandCol}\` = '1') AND (s.storeClassification = ? OR s.storeClassification IS NULL) ORDER BY s.storeCode ASC`;
      params=[chain, storeClass, storeClass];
    }
    console.log('SQL:', query.replace(/\s+/g,' ').trim());
    console.log('params',params);
    const [rows] = await pool.execute(query, params);
    console.log('rows count', rows.length);
    const allowedTypes=['SM','RDS','WDS'];
    const branchesWithExclusions = await Promise.all(rows.map(async (branch)=>{
      let storeType = (branch.storeClassification || branch.categoryClass || '')+'';
      storeType = String(storeType).trim().toUpperCase();
      if (!allowedTypes.includes(storeType)) storeType='SM';
      const [colCheck] = await pool.execute(`SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'nbfi_item_exclusivity_list' AND COLUMN_NAME = ?`,[storeType]);
      console.log('colCheck for',storeType, colCheck);
      if (!Array.isArray(colCheck) || colCheck.length===0) return {branchCode:branch.storeCode, branchName:branch.storeName, excludedItemIds:[]};
      const [exclusions] = await pool.execute(`SELECT itemCode FROM nbfi_item_exclusivity_list WHERE \`${storeType}\` = 1`);
      return {branchCode:branch.storeCode, branchName:branch.storeName, excludedItemIds: Array.isArray(exclusions)?exclusions.map(e=>e.itemCode).filter(Boolean):[] };
    }));
    console.log('branchesWithExclusions', JSON.stringify(branchesWithExclusions,null,2));
    await pool.end();
  } catch (err){
    console.error('SIM ERROR', err);
    process.exit(1);
  }
})();
