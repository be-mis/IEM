import React, { useState } from 'react';

// MUI Core Components (only the ones used)
import { Box, Grid, Accordion, AccordionSummary, AccordionDetails, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { StoreMallDirectoryOutlined, InventoryOutlined, DisabledByDefaultOutlined } from '@mui/icons-material';

import Filter from '../components/Filter';
import ListOfBranch from '../components/ListOfBranch';
import ListOfItems from '../components/ListOfItems';
import ListOfExclusion from '../components/ListOfExclusion';

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
  const [selected, setSelected] = useState({ chain: '', category: '', storeClass: '' });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box>
        <Filter
          onChange={({ chain, category, storeClass }) => {
            setSelected({ chain, category, storeClass });
          }}
        />
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
                <ListOfBranch filters={selected} />
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
              <AccordionDetails>
                <ListOfItems filters={selected} />
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
              <AccordionDetails>
                <ListOfExclusion />
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}