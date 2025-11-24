import React, { useState, useCallback } from 'react';
import { 
  Box, Grid, Accordion, AccordionSummary, AccordionDetails, 
  Typography, Button, Alert, Snackbar 
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { 
  StoreMallDirectoryOutlined, InventoryOutlined, DisabledByDefaultOutlined, TuneOutlined
} from '@mui/icons-material';

import Filter from '../components/Filter';
import ListOfBranch from '../components/ListOfBranch';
import ListOfItems from '../components/ListOfItems';
import ListOfExclusionContainer from '../components/ListOfExclusionContainer';
import { useBranches } from '../hooks/useBranches';
import useItems from '../hooks/useItems';
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

export default function ExclusivityForm() {
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
  const { branches: rawBranches, loading: branchesLoading } = useBranches(filters);
  const { items: rawItems, loading: itemsLoading } = useItems(filters);

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
      <Box component="form" noValidate autoComplete="off">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <TuneOutlined />
          <strong>Parameter</strong>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1 }}>
            <Filter onChange={handleFilterChange} />
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
      </Box>

      {/* List of Branches */}
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
                  List of Branches
                </SectionHeader>
              </AccordionSummary>
              <AccordionDetails sx={{ maxHeight: 560 }}>
                <ListOfBranch filters={filters} />
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
                <ListOfItems 
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
              <AccordionDetails sx={{ overflow: 'hidden', maxHeight: 570 }}>
                <ListOfExclusionContainer 
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