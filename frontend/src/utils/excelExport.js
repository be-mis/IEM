// src/utils/excelExport.js
import * as XLSX from 'xlsx';

/**
 * Generate filename based on filters and current date
 * Format: EPC_{CHAIN}_{CATEGORY}_{STORECLASS}_{MMDDYYYY}.xlsx
 */
export function generateFilename(filters) {
  const { chain = 'VARIOUSCHAIN', category = 'CATEGORY', storeClass = 'STORE' } = filters;
  
  // Format date as MMDDYYYY
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const year = now.getFullYear();
  const dateStr = `${month}${day}${year}`;
  
  // Convert to uppercase and remove spaces
  const chainStr = String(chain).toUpperCase().replace(/\s+/g, '');
  const categoryStr = String(category).toUpperCase().replace(/\s+/g, '');
  const storeClassStr = String(storeClass).toUpperCase().replace(/\s+/g, '');
  
  return `EPC_${chainStr}_${categoryStr}_${storeClassStr}_${dateStr}.xlsx`;
}

/**
 * Create rowKey to match quantities (from ListOfItems)
 */
function createRowKey(itemCode, itemDescription) {
  return `${itemCode}|${itemDescription}`;
}

/**
 * Generate Excel data rows based on branches, items, quantities, and exclusions
 */
export function generateExcelData(branches, items, quantities, filters) {
  const rows = [];
  const { transaction = 'CST-RepeatOrder' } = filters;
  const sourceWarehouse = '01-RLS'; // Constant
  
  // Process each branch
  branches.forEach(branch => {
    const { branchCode, branchName } = branch;
    
    // Get target warehouse (remove 'C-' prefix)
    const targetWarehouse = branchCode.replace(/^C-/, '');
    
    // Get excluded item IDs for this branch
    const excludedItemIds = Array.isArray(branch.excludedItemIds) 
      ? branch.excludedItemIds 
      : [];
    
    // Process each item
    items.forEach(item => {
      const { itemCode, itemDescription } = item;
      
      // Create key to get quantity
      const key = createRowKey(itemCode, itemDescription);
      const quantity = quantities[key];
      
      // Check conditions:
      // 1. Quantity must be > 0
      // 2. Item must NOT be in this branch's exclusion list
      if (quantity && Number(quantity) > 0 && !excludedItemIds.includes(itemCode)) {
        rows.push({
          'Branch Code': branchCode,
          'Branch Name': branchName, // Keep original formatting
          'Transfer Type': transaction,
          'Source Warehouse': sourceWarehouse,
          'Target Warehouse': targetWarehouse,
          '16 Digit Item Code': itemCode,
          'Quantity': Number(quantity)
        });
      }
    });
  });
  
  return rows;
}

/**
 * Export data to Excel file
 */
export function exportToExcel(data, filename) {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('No data to export. Please ensure you have items with quantity > 0.');
  }
  
  // Create worksheet from JSON data
  const worksheet = XLSX.utils.json_to_sheet(data);
  
  // Set column widths (matching template)
  worksheet['!cols'] = [
    { wch: 12 },      // Branch Code
    { wch: 47 },      // Branch Name
    { wch: 16 },      // Transfer Type
    { wch: 18 },      // Source Warehouse
    { wch: 17 },      // Target Warehouse
    { wch: 17 },      // 16 Digit Item Code
    { wch: 9 }        // Quantity
  ];
  
  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Transfer Orders');
  
  // Export file
  XLSX.writeFile(workbook, filename);
}

/**
 * Main export function - orchestrates the entire export process
 */
export function handleExportExcel(branches, items, quantities, filters) {
  try {
    // Validate inputs
    if (!Array.isArray(branches) || branches.length === 0) {
      throw new Error('No branches available to export.');
    }
    
    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('No items available to export.');
    }
    
    if (!quantities || typeof quantities !== 'object') {
      throw new Error('Quantities data is not available.');
    }
    
    // Generate data rows
    const data = generateExcelData(branches, items, quantities, filters);
    
    if (data.length === 0) {
      throw new Error('No data to export. Please ensure you have items with quantity > 0 that are not excluded.');
    }
    
    // Generate filename
    const filename = generateFilename(filters);
    
    // Export to Excel
    exportToExcel(data, filename);
    
    return {
      success: true,
      message: `Successfully exported ${data.length} rows to ${filename}`,
      rowCount: data.length
    };
  } catch (error) {
    return {
      success: false,
      message: error.message || 'Failed to export Excel file.'
    };
  }
}