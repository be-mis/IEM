import React, { useState, useCallback } from 'react';
import { 
  Box, Grid, Accordion, AccordionSummary, AccordionDetails, 
  Typography, Button, Alert, Snackbar 
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { 
  StoreMallDirectoryOutlined, 
  InventoryOutlined, 
  DisabledByDefaultOutlined 
} from '@mui/icons-material';

import Filter from '../components/Filter';
import NBFIListOfBranch from '../components/NBFIListOfBranch';
import NBFIListOfItems from '../components/NBFIListOfItems';
import NBFIListOfExclusionContainer from '../components/NBFIListOfExclusionContainer';
import { useNBFIBranches } from '../hooks/useNBFIBranches';
import useNBFIItems from '../hooks/useNBFIItems';
import { handleExportExcel } from '../utils/excelExport';

const SectionHeader = ({ children, sx }) => (
  <Typography
    variant="h6"
    sx={{
      display: 'flex',
      alignItems: 'center',
      color: '#374151',
      fontWeight: 600,
      gap: 1,
      ...sx,
    }}
  >
    {children}
  </Typography>
);

export default function NBFIExclusivityForm() {
  const [filters, setFilters] = useState({
    chain: '',
    category: '',
    storeClass: '',
    transaction: '',
  });
  
  const [quantities, setQuantities] = useState({});
  
  // ✅ NEW: Store branches with their exclusion data
  const [branchesWithExclusions, setBranchesWithExclusions] = useState([]);
  
  // Snackbar state for showing export feedback
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' // 'success' | 'error' | 'info' | 'warning'
  });
  
  // Fetch branches and items data for export
  const { branches: rawBranches, loading: branchesLoading } = useNBFIBranches(filters);
  const { items: rawItems, loading: itemsLoading } = useNBFIItems(filters);

  const handleFilterChange = useCallback((next) => {
    setFilters(next);
  }, []);
  
  const handleCloseSnackbar = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);
  
  // ✅ NEW: Handle branches changes from ListOfExclusion
  const handleBranchesChange = useCallback((branches) => {
    setBranchesWithExclusions(branches);
  }, []);
  
  const handleExport = useCallback(() => {
    // Check if data is still loading
    if (branchesLoading || itemsLoading) {
      setSnackbar({
        open: true,
        message: 'Please wait, data is still loading...',
        severity: 'warning'
      });
      return;
    }
    
    // ✅ Use branchesWithExclusions if available (from ListOfExclusion), 
    // otherwise use rawBranches from API
    const branches = branchesWithExclusions.length > 0 
      ? branchesWithExclusions.map(b => ({
          branchCode: b.code,
          branchName: b.name,
          excludedItemIds: Array.isArray(b.excludedItemIds) ? b.excludedItemIds : []
        }))
      : (rawBranches || []).map(b => ({
          branchCode: b.branchCode,
          branchName: b.branchName,
          excludedItemIds: []
        }));
    
    // Prepare items data (ensure proper structure)
    const items = (rawItems || []).map(i => ({
      itemCode: i.itemCode || '',
      itemDescription: i.itemDescription || i.description || ''
    }));
    
    // Call export function
    const result = handleExportExcel(branches, items, quantities, filters);
    
    // Show result to user
    setSnackbar({
      open: true,
      message: result.message,
      severity: result.success ? 'success' : 'error'
    });
  }, [rawBranches, rawItems, quantities, filters, branchesWithExclusions, branchesLoading, itemsLoading]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Filter and Export Button Row */}
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
        <Box sx={{ flex: 1 }}>
          <Filter onChange={handleFilterChange} categoryLabel="Brand" isNBFI={true} />
        </Box>
        <Button
          variant="contained"
          color="primary"
          size="large"
          startIcon={<FileDownloadIcon />}
          onClick={handleExport}
          disabled={branchesLoading || itemsLoading || !filters.transaction}
        >
          Export to Excel
        </Button>
      </Box>

      {/* List of Stores */}
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12} md={12}>
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1-content"
                id="panel1-header"
                sx={{ backgroundColor: '#f5f5f5' }}
              >
                <SectionHeader>
                  <StoreMallDirectoryOutlined />
                  List of Stores
                </SectionHeader>
              </AccordionSummary>
              <AccordionDetails sx={{ maxHeight: 560 }}>
                <NBFIListOfBranch filters={filters} />
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid>
      </Box>

      {/* List of Items */}
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12} md={12}>
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel2-content"
                id="panel2-header"
                sx={{ backgroundColor: '#f5f5f5' }}
              >
                <SectionHeader>
                  <InventoryOutlined />
                  List of Items
                </SectionHeader>
              </AccordionSummary>
              <AccordionDetails sx={{ maxHeight: 560 }}>
                <NBFIListOfItems 
                  filters={filters}
                  quantities={quantities}
                  setQuantities={setQuantities}
                />
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid>
      </Box>

      {/* Exclusion */}
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12} md={12}>
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel3-content"
                id="panel3-header"
                sx={{ backgroundColor: '#f5f5f5' }}
              >
                <SectionHeader>
                  <DisabledByDefaultOutlined />
                  Exclusion
                </SectionHeader>
              </AccordionSummary>
              <AccordionDetails sx={{ maxHeight: 560 }}>
                <NBFIListOfExclusionContainer 
                  filters={filters}
                  quantities={quantities}
                  onBranchesChange={handleBranchesChange}
                />
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid>
      </Box>
      
      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
