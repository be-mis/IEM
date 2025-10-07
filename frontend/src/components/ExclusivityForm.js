import React, { useState } from 'react';

// MUI Core Components
import { Box, Paper, TextField, Drawer, AppBar, Toolbar, List, Typography, IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText, Card, CardContent, Grid, Button,
  useTheme, useMediaQuery, Chip, Select, FormControl, InputLabel, FormHelperText, CircularProgress, Alert, Snackbar, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Tooltip,
  Accordion, AccordionSummary, AccordionDetails} from '@mui/material';


  // MUI Icons
import {
  Dashboard as DashboardIcon, Add as AddIcon, InventoryOutlined, DisabledByDefaultOutlined, ViewList as ViewListIcon, CheckCircle as ReceiveIcon,
  Assignment as AssignIcon, Assessment as ReportsIcon, Menu as MenuIcon, Inventory2, Build, AttachMoney, ExpandLessOutlined, 
  Description, TrendingUp, Warning, CheckCircleOutline, Star, AutoAwesome, TuneOutlined, StoreMallDirectoryOutlined, AssignmentTurnedIn as Assignment, Delete,
  Visibility as VisibilityIcon, Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon, DeleteForever as DeleteForeverIcon, } from '@mui/icons-material';

import { styled, createTheme, ThemeProvider } from '@mui/material/styles';

import Filter from '../components/Filter'
import ListOfBranch from '../components/ListOfBranch'
import ListOfItems from '../components/ListOfItems'
import ListOfExclusion from '../components/ListOfExclusion'

const whiteTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb',
    },
    secondary: {
      main: '#7c3aed',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#1f2937',
      secondary: '#6b7280',
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
  }
});

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

export default function ColorTextFields() {
    const [selected, setSelected] = useState({ chain: '', category: '', storeClass: '' });

    const [selectedChain, setChain] = React.useState('');
  
    const handleChangeChain = (event) => {
        setChain(event.target.value);
    };
    
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }} >
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
                        <Accordion >
                            <AccordionSummary
                            expandIcon={<ExpandLessOutlined />}
                            aria-controls="panel1-content"
                            id="panel1-header"
                            sx={{ backgroundColor: '#f5f5f5' }}
                            >
                              <SectionHeader><StoreMallDirectoryOutlined/>List of Branches</SectionHeader>
                            </AccordionSummary>
                            <AccordionDetails>
                            <div style={{ marginTop: 16 }}>
                              <ListOfBranch filters={selected} />
                            </div>


                              {/* <ListOfBranch filters={selected} /> */}
                            </AccordionDetails>
                        </Accordion>
                    </Grid>
                </Grid>
            </Box>
            <Box>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={12}>
                        <Accordion >
                            <AccordionSummary
                            expandIcon={<ExpandLessOutlined />}
                            aria-controls="panel2-content"
                            id="panel2-header"
                            sx={{ backgroundColor: '#f5f5f5' }}
                            >
                                <SectionHeader> <InventoryOutlined/>List of Items</SectionHeader>
                            </AccordionSummary>
                            <AccordionDetails>
                                <ListOfItems />
                            </AccordionDetails>
                        </Accordion>
                    </Grid>
                </Grid>
            </Box>
            <Box>
                <Grid container spacing={3}>
                    <Grid item xs={12} md={12}>
                        <Accordion >
                            <AccordionSummary
                            expandIcon={<ExpandLessOutlined />}
                            aria-controls="panel2-content"
                            id="panel2-header"
                            sx={{ backgroundColor: '#f5f5f5' }}
                            >
                                <SectionHeader><DisabledByDefaultOutlined/>Exclusion</SectionHeader>
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