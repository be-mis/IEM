import React, { useState } from 'react';

// MUI Core Components
import { Box, Paper, TextField, Drawer, AppBar, Toolbar, List, Typography, IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText, Card, CardContent, Grid, Button,
  useTheme, useMediaQuery, Chip, Select, FormControl, InputLabel, FormHelperText, CircularProgress, Alert, Snackbar, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Tooltip,
  Accordion, AccordionSummary, AccordionDetails} from '@mui/material';


  // MUI Icons
import {
  Dashboard as DashboardIcon, Add as AddIcon, ViewList as ViewListIcon, CheckCircle as ReceiveIcon,
  Assignment as AssignIcon, Assessment as ReportsIcon, Menu as MenuIcon, Inventory2, Build, AttachMoney, ExpandLessOutlined, 
  Description, TrendingUp, Warning, CheckCircleOutline, Star, AutoAwesome, TuneOutlined, AssignmentTurnedIn as Assignment, Delete,
  Visibility as VisibilityIcon, Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon, DeleteForever as DeleteForeverIcon, } from '@mui/icons-material';

import { styled, createTheme, ThemeProvider } from '@mui/material/styles';

import ListOfBranch from '../components/ListOfBranch'

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
      mb: 2,
      mt: 3,
    }}
  >
    {children}
  </Typography>
);

export default function ColorTextFields() {
    
    const [selectedChain, setChain] = React.useState('');
  
    const handleChangeChain = (event) => {
        setChain(event.target.value);
    };
    
    return (
        <Box component="form" sx={{ '& > :not(style)': { width: '100%' } }} noValidate autoComplete="off" >
                <Grid container spacing={3}>
                    <Grid item xs={12} md={3}>
                        <FormControl required size="small" sx={{width: '100%', '& .MuiInputLabel-root.Mui-focused': {
                        backgroundColor: 'white', paddingX: '5px' }  }}>
                            <InputLabel id="filter-chain">Chain</InputLabel>
                            <Select
                            labelId="filter-chain"
                            id="demo-simple-select-required"
                            value={selectedChain}
                            label="Chain *"
                            onChange={handleChangeChain}
                            >
                                <MenuItem value="VARIOUS CHAIN">VARIOUS CHAIN</MenuItem>
                                <MenuItem value="SM HOMEWORLD">SM HOMEWORLD</MenuItem>
                                <MenuItem value="OUR HOME">OUR HOME</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <FormControl required size="small" sx={{width: '100%', '& .MuiInputLabel-root.Mui-focused': {
                        backgroundColor: 'white', paddingX: '5px' }  }}>
                            <InputLabel id="filter-category">Category</InputLabel>
                            <Select
                            labelId="filter-category"
                            id="demo-simple-select-required"
                            value={selectedChain}
                            label="Chain *"
                            onChange={handleChangeChain}
                            >
                                <MenuItem value="CLOCKS">CLOCKS</MenuItem>
                                <MenuItem value="DERCOR">DERCOR</MenuItem>
                                <MenuItem value="FRAMES">FRAMES</MenuItem>
                                <MenuItem value="LAMPS">LAMPS</MenuItem>
                                <MenuItem value="STATIONERY">STATIONERY</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <FormControl required size="small" sx={{width: '100%', '& .MuiInputLabel-root.Mui-focused': {
                        backgroundColor: 'white', paddingX: '5px' }  }}>
                            <InputLabel id="filter-store-class">Store Classification</InputLabel>
                            <Select
                            labelId="filter-store-class"
                            id="demo-simple-select-required"
                            value={selectedChain}
                            label="Chain *"
                            onChange={handleChangeChain}
                            >
                                <MenuItem value="VARIOUS CHAIN">VARIOUS CHAIN</MenuItem>
                                <MenuItem value="SM HOMEWORLD">SM HOMEWORLD</MenuItem>
                                <MenuItem value="OUR HOME">OUR HOME</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <FormControl required size="small" sx={{width: '100%', '& .MuiInputLabel-root.Mui-focused': {
                        backgroundColor: 'white', paddingX: '5px' }  }}>
                            <InputLabel id="filter-transaction-type" sx={{ backgroundColor: whiteTheme}}>Transaction Type</InputLabel>
                            <Select
                            labelId="filter-transaction-type"
                            id="demo-simple-select-required"
                            value={selectedChain}
                            label="Chain *"
                            onChange={handleChangeChain}
                            >
                                <MenuItem value="VARIOUS CHAIN">VARIOUS CHAIN</MenuItem>
                                <MenuItem value="SM HOMEWORLD">SM HOMEWORLD</MenuItem>
                                <MenuItem value="OUR HOME">OUR HOME</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>
        </Box>
    );
}