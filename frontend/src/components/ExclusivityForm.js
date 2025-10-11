import React, { useState, useCallback } from 'react';

// MUI Core Components (only the ones used)
import { Box, Grid, Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { StoreMallDirectoryOutlined, InventoryOutlined, DisabledByDefaultOutlined } from '@mui/icons-material';

import Filter from '../components/Filter';
import ListOfBranch from '../components/ListOfBranch';
import ListOfItems from '../components/ListOfItems';
// import ListOfExclusion from '../components/ListOfExclusion';
import ListOfExclusionContainer from '../components/ListOfExclusionContainer';

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
  // const [selected, setSelected] = useState({ chain: '', category: '', storeClass: '' });

  // ✅ Keep all filter values here (fixes 'no-undef' on chain/category/storeClass)
  const [filters, setFilters] = useState({
    chain: '',
    category: '',
    storeClass: '',
    transaction: '',
  });
  
  // ADD THIS NEW STATE:
  const [quantities, setQuantities] = useState({});

  // Handy aliases if you need them locally
  const { chain, category, storeClass, transaction } = filters;

  
  // Receive filter changes from <Filter />
  const handleFilterChange = useCallback((next) => {
    // next shape is: { chain, category, storeClass, transaction }
    setFilters(next);
  }, []);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box>
        <Filter onChange={handleFilterChange} />
      </Box>

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
                setQuantities={setQuantities} />
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid>
      </Box>

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
                {/* <ListOfExclusion /> */}
                <ListOfExclusionContainer
                filters={filters}
                quantities={quantities} />
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}