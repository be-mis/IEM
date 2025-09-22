import React, { useState } from 'react';

// MUI Core Components
import { Box, Drawer, AppBar, Toolbar, List, Typography, IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText, Card, CardContent, Grid, Button,
  useTheme, useMediaQuery, Chip, Paper, TextField, Select, FormControl, InputLabel, CircularProgress, Alert, Snackbar, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Tooltip,
  Accordion, AccordionSummary, AccordionDetails} from '@mui/material';

  // MUI Icons
import {
  Dashboard as DashboardIcon, Add as AddIcon, ViewList as ViewListIcon, CheckCircle as ReceiveIcon,
  Assignment as AssignIcon, Assessment as ReportsIcon, Menu as MenuIcon, Inventory2, Build, AttachMoney, ExpandLessOutlined, 
  Description, TrendingUp, Warning, CheckCircleOutline, Star, AutoAwesome, TuneOutlined, AssignmentTurnedIn as Assignment, Delete,
  Visibility as VisibilityIcon, Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon, DeleteForever as DeleteForeverIcon, } from '@mui/icons-material';

import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import MuiAlert from '@mui/material/Alert';

// Custom Hooks
import { useInventoryItems, useDashboardStats } from '../hooks/useInventory';

import ExclusivityForm from '../components/ExclusivityForm';
import ListOfBranch from '../components/ListOfBranch';


// Create clean white theme
const drawerWidth = 300;
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
      gap: 1,
      ...sx,
    }}
  >
    {children}
  </Typography>
);

// Styled Components
const ModernDrawer = styled(Drawer)(({ theme }) => ({
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
}));
const ModernAppBar = styled(AppBar)(({ theme }) => ({
  background: '#ffffff',
  color: '#1f2937',
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  border: '1px solid #e5e7eb',
  borderTop: 'none',
}));
const NavItem = styled(ListItemButton)(({ theme, active }) => ({
  margin: '4px 16px',
  borderRadius: '8px',
  background: active ? '#eff6ff' : 'transparent',
  border: active ? '1px solid #dbeafe' : '1px solid transparent',
  color: active ? '#2563eb' : '#6b7280',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    background: '#f9fafb',
    color: '#1f2937',
  },
}));
const UltraModernCard = styled(Card)(({ theme }) => ({
  background: '#ffffff',
  border: '1px solid #e5e7eb',
  borderRadius: '12px',
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  transition: 'all 0.2s ease-in-out',
  '&:hover': {
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
}));
const FloatingActionButton = styled(Button)(({ theme }) => ({
  borderRadius: '8px',
  padding: '12px 24px',
  background: '#2563eb',
  color: 'white',
  fontWeight: '600',
  fontSize: '14px',
  textTransform: 'none',
  transition: 'all 0.2s ease-in-out',
  boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  '&:hover': {
    background: '#1d4ed8',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  },
}));
const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    background: '#ffffff',
    borderRadius: '8px',
    '& fieldset': {
      borderColor: '#d1d5db',
    },
    '&:hover fieldset': {
      borderColor: '#9ca3af',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#2563eb',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#6b7280',
    fontWeight: 500,
  },
  '& .MuiOutlinedInput-input': {
    color: '#1f2937',
  },
}));
const EditableTableCell = ({ value, onSave, type = 'text', options = [] }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || '');
  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };
  const handleCancel = () => {
    setEditValue(value || '');
    setIsEditing(false);
  };
  if (isEditing) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 200 }}>
        {type === 'select' ? (
          <FormControl size="small" fullWidth>
            <Select
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              sx={{ fontSize: '0.875rem' }}
            >
              {options.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <TextField
            size="small"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            type={type}
            fullWidth
            sx={{
              '& .MuiOutlinedInput-input': { fontSize: '0.875rem' },
            }}
          />
        )}
        <IconButton size="small" onClick={handleSave} color="success">
          <SaveIcon fontSize="small" />
        </IconButton>
        <IconButton size="small" onClick={handleCancel} color="error">
          <CancelIcon fontSize="small" />
        </IconButton>
      </Box>
    );
  }
  return (
    <Box 
      onClick={() => setIsEditing(true)} 
      sx={{ 
        cursor: 'pointer', 
        padding: '8px',
        borderRadius: '4px',
        '&:hover': { 
          background: '#f3f4f6',
        },
        minHeight: '40px',
        display: 'flex',
        alignItems: 'center'
      }}
    >
      {type === 'status' ? (
        <Chip
          label={value}
          size="small"
          sx={{
            background:
              value === 'available' ? '#dcfce7' :
              value === 'assigned' ? '#fef3c7' :
              '#fee2e2',
            color:
              value === 'available' ? '#166534' :
              value === 'assigned' ? '#92400e' :
              '#991b1b',
            fontWeight: '600'
          }}
        />
      ) : (
        <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
          {value || 'Click to edit'}
        </Typography>
      )}
    </Box>
  );
};

// Dashboard Component
const Dashboard = () => {
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [openDetailsDialog, setOpenDetailsDialog] = useState(null);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false); // Added loading state

  // Hooks
  const { items, loading: itemsLoading, error, addItem, deleteItem, updateItem, checkOutItem, checkInItem } = useInventoryItems();
  const { stats } = useDashboardStats();

  // Dialog states
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openAssignDialog, setOpenAssignDialog] = useState(null);
  const [openReceiveDialog, setOpenReceiveDialog] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [disposalConfirm, setDisposalConfirm] = useState(null);

  // Enhanced form states with more fields
  const [newItem, setNewItem] = useState({
    name: '',
    brand: '',
    model: '',
    serialNumber: '',
    category: '',
    hostname: '',
    operatingSystem: '',
    processor: '',
    ram: '',
    storage: '',
    purchaseDate: '',
    warrantyPeriod: '',
    deploymentDate: '',
    location: '',
    notes: ''
  });
  const [assignmentData, setAssignmentData] = useState({ 
    assignedTo: '', 
    department: '', 
    email: '', 
    phone: '' 
  });
  const [returnData, setReturnData] = useState({ 
    condition: 'good', 
    notes: '' 
  });
  const [disposalData, setDisposalData] = useState({ 
    reason: '', 
    disposalDate: '', 
    notes: '' 
  });

  // Snackbar
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' 
  });

  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenDetails = async (id) => {
    try {
      const item = items.find(item => item.id === id);
      setDetails(item);
      setOpenDetailsDialog(id);
    } catch (err) {
      showSnackbar('Failed to load item details', 'error');
    }
  };

  // Update menuItems to include Disposal
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, view: 'dashboard' },
    { text: 'Exclusivity Form', icon: <AddIcon />, view: 'exclusivityform' },
    { text: 'Add Item', icon: <AddIcon />, view: 'add' },
    { text: 'View Items', icon: <ViewListIcon />, view: 'view' },
    { text: 'Assign', icon: <AssignIcon />, view: 'assign' },
    { text: 'Receive', icon: <ReceiveIcon />, view: 'receive' },
    { text: 'Reports', icon: <ReportsIcon />, view: 'reports' },
    { text: 'Disposal', icon: <DeleteForeverIcon />, view: 'disposal' }, // Added new Disposal tab
  ];

  // Enhanced add item handler with more fields
  const handleAddItem = async () => {
    if (!newItem.name?.trim()) {
      showSnackbar('Item name is required', 'error');
      return;
    }
    if (!newItem.serialNumber?.trim()) {
      showSnackbar('Serial number is required', 'error');
      return;
    }
    const itemData = {
      item_name: newItem.name.trim(),
      serial_number: newItem.serialNumber.trim(),
      brand: newItem.brand?.trim() || null,
      model: newItem.model?.trim() || null,
      category: newItem.category,
      hostname: newItem.hostname?.trim() || null,
      operating_system: newItem.operatingSystem?.trim() || null,
      processor: newItem.processor?.trim() || null,
      ram: newItem.ram?.trim() || null,
      storage: newItem.storage?.trim() || null,
      purchase_date: newItem.purchaseDate || null,
      warranty_period: newItem.warrantyPeriod?.trim() || null,
      deployment_date: newItem.deploymentDate || null,
      location: newItem.location?.trim() || null,
      status: 'available',
      condition_status: 'good',
      quantity: 1,
      notes: newItem.notes?.trim() || null,
    };
    setLoading(true);
    try {
      await addItem(itemData);
      setNewItem({
        name: '', brand: '', model: '', serialNumber: '', category: 'Desktop',
        hostname: '', operatingSystem: '', processor: '', ram: '', storage: '',
        purchaseDate: '', warrantyPeriod: '', deploymentDate: '', location: '', notes: ''
      });
      setOpenAddDialog(false);
      setCurrentView('dashboard');
      showSnackbar('Item added successfully!', 'success');
    } catch (err) {
      console.error('Add item error:', err);
      showSnackbar('Failed to add item: ' + (err.response?.data?.error || err.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  // Enhanced field update handler
  const handleFieldUpdate = async (itemId, field, value) => {
    try {
      await updateItem(itemId, { [field]: value });
      showSnackbar('Item updated successfully!', 'success');
    } catch (err) {
      showSnackbar('Failed to update item: ' + err.message, 'error');
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await deleteItem(id);
      setDeleteConfirm(null);
      showSnackbar('Item deleted successfully!');
    } catch (err) {
      showSnackbar('Failed to delete item: ' + err.message, 'error');
    }
  };

  const handleDisposal = async (id) => {
    if (!disposalData.reason?.trim()) {
      showSnackbar('Please enter a disposal reason', 'error');
      return;
    }
    try {
      await updateItem(id, {
        status: 'retired',
        disposal_reason: disposalData.reason,
        disposal_date: disposalData.disposalDate || new Date().toISOString(),
        notes: disposalData.notes || '',
      });
      setDisposalConfirm(null);
      setDisposalData({ reason: '', disposalDate: '', notes: '' });
      showSnackbar('Item marked for disposal successfully!', 'success');
    } catch (err) {
      showSnackbar('Failed to mark item for disposal: ' + err.message, 'error');
    }
  };

  const handleAssign = async (id) => {
    if (!assignmentData.assignedTo?.trim()) {
      showSnackbar('Please enter who the item is assigned to', 'error');
      return;
    }
    try {
      await checkOutItem(id, {
        assigned_to_name: assignmentData.assignedTo,
        department: assignmentData.department,
        email: assignmentData.email,
        phone: assignmentData.phone,
        assignment_date: new Date().toISOString(),
      });
      setOpenAssignDialog(null);
      setAssignmentData({ assignedTo: '', department: '', email: '', phone: '' });
      showSnackbar('Item assigned successfully!');
    } catch (err) {
      showSnackbar('Failed to assign item: ' + err.message, 'error');
    }
  };

  const handleReceive = async (id) => {
    try {
      await checkInItem(id, returnData);
      setOpenReceiveDialog(null);
      setReturnData({ condition: 'good', notes: '' });
      showSnackbar('Item received back successfully!');
    } catch (err) {
      showSnackbar('Failed to receive item: ' + err.message, 'error');
    }
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'exclusivityform' :
        return (
            <UltraModernCard>
              <CardContent sx={{ p: 4 }}>
                <ExclusivityForm />
              </CardContent>
            </UltraModernCard>
        );
      case 'add':
        return (
          <Box sx={{ mb: 4 }}>
            {/* <Typography variant="h4" sx={{ color: '#1f2937', mb: 2 }}>Add New Item</Typography> */}
            <UltraModernCard>
              <CardContent sx={{ p: 4 }}>
                <Box component="form" onSubmit={(e) => { e.preventDefault(); handleAddItem(); }}>
                  <SectionHeader><TuneOutlined />Parameter</SectionHeader>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth  size="small">
                        <InputLabel>Chain</InputLabel>
                        <Select
                          value={newItem.category}
                          label="Category"
                          onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                          sx={{
                            background: '#ffffff',
                            borderRadius: '8px',
                          }}
                        >
                          <MenuItem value="VARIOUS CHAIN">VARIOUS CHAIN</MenuItem>
                          <MenuItem value="SM HOMEWORLD">SM HOMEWORLD</MenuItem>
                          <MenuItem value="OUR HOME">OUR HOME</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Category</InputLabel>
                        <Select
                          value={newItem.category}
                          label="Category"
                          onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                          sx={{
                            background: '#ffffff',
                            borderRadius: '8px',
                          }}
                        >
                          <MenuItem value="LAMPS">LAMPS</MenuItem>
                          <MenuItem value="DECOR">DECOR</MenuItem>
                          <MenuItem value="FRAMES">FRAMES</MenuItem>
                          <MenuItem value="CLOCKS">CLOCKS</MenuItem>
                          <MenuItem value="STATIONERY">STATIONERY</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Store Classification</InputLabel>
                        <Select
                          value={newItem.category}
                          label="Category"
                          onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                          sx={{
                            background: '#ffffff',
                            borderRadius: '8px',
                          }}
                        >
                          <MenuItem value="Desktop">Desktop</MenuItem>
                          <MenuItem value="Laptop">Laptop</MenuItem>
                          <MenuItem value="Monitor">Monitor</MenuItem>
                          <MenuItem value="Network Equipment">Network Equipment</MenuItem>
                          <MenuItem value="Mobile Device">Mobile Device</MenuItem>
                          <MenuItem value="Accessories">Accessories</MenuItem>
                          <MenuItem value="Other">Other</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Transaction Type</InputLabel>
                        <Select
                          value={newItem.category}
                          label="Category"
                          onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                          sx={{
                            background: '#ffffff',
                            borderRadius: '8px',
                          }}
                        >
                          <MenuItem value="Desktop">Desktop</MenuItem>
                          <MenuItem value="Laptop">Laptop</MenuItem>
                          <MenuItem value="Monitor">Monitor</MenuItem>
                          <MenuItem value="Network Equipment">Network Equipment</MenuItem>
                          <MenuItem value="Mobile Device">Mobile Device</MenuItem>
                          <MenuItem value="Accessories">Accessories</MenuItem>
                          <MenuItem value="Other">Other</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    {/* <Grid item xs={12} md={4}>
                      <StyledTextField
                        fullWidth
                        label="Brand"
                        value={newItem.brand}
                        onChange={(e) => setNewItem({ ...newItem, brand: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <StyledTextField
                        fullWidth
                        label="Model"
                        value={newItem.model}
                        onChange={(e) => setNewItem({ ...newItem, model: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <StyledTextField
                        fullWidth
                        label="Serial Number *"
                        value={newItem.serialNumber}
                        onChange={(e) => setNewItem({ ...newItem, serialNumber: e.target.value })}
                        required
                      />
                    </Grid> */}
                  </Grid>

                  <SectionHeader><Build /> List of Branch</SectionHeader>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={12}>
                       <Accordion >
                        <AccordionSummary
                          expandIcon={<ExpandLessOutlined />}
                          aria-controls="panel1-content"
                          id="panel1-header"
                        >
                          <Typography component="span">Accordion 1</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Typography>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
                            malesuada lacus ex, sit amet blandit leo lobortis eget.
                          </Typography>
                          <ListOfBranch />
                        </AccordionDetails>
                      </Accordion>
                      <Accordion>
                        <AccordionSummary
                          expandIcon={<ExpandLessOutlined />}
                          aria-controls="panel2-content"
                          id="panel2-header"
                        >
                          <Typography component="span">Accordion 2</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Typography>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
                            malesuada lacus ex, sit amet blandit leo lobortis eget.
                          </Typography>
                        </AccordionDetails>
                      </Accordion>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <StyledTextField
                        fullWidth
                        label="Hostname"
                        value={newItem.hostname}
                        onChange={(e) => setNewItem({ ...newItem, hostname: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <StyledTextField
                        fullWidth
                        label="Operating System"
                        value={newItem.operatingSystem}
                        onChange={(e) => setNewItem({ ...newItem, operatingSystem: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <StyledTextField
                        fullWidth
                        label="Processor"
                        value={newItem.processor}
                        onChange={(e) => setNewItem({ ...newItem, processor: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <StyledTextField
                        fullWidth
                        label="RAM"
                        value={newItem.ram}
                        onChange={(e) => setNewItem({ ...newItem, ram: e.target.value })}
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <StyledTextField
                        fullWidth
                        label="Storage"
                        value={newItem.storage}
                        onChange={(e) => setNewItem({ ...newItem, storage: e.target.value })}
                      />
                    </Grid>
                  </Grid>

                  <SectionHeader><AttachMoney /> List of Item</SectionHeader>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={3}>
                      <StyledTextField
                        fullWidth
                        label="Purchase Date"
                        type="date"
                        value={newItem.purchaseDate}
                        onChange={(e) => setNewItem({ ...newItem, purchaseDate: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <StyledTextField
                        fullWidth
                        label="Deployment Date"
                        type="date"
                        value={newItem.deploymentDate}
                        onChange={(e) => setNewItem({ ...newItem, deploymentDate: e.target.value })}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <StyledTextField
                        fullWidth
                        label="Warranty Period"
                        value={newItem.warrantyPeriod}
                        onChange={(e) => setNewItem({ ...newItem, warrantyPeriod: e.target.value })}
                        placeholder="e.g., 3 years"
                      />
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <StyledTextField
                        fullWidth
                        label="Location"
                        value={newItem.location}
                        onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                      />
                    </Grid>
                  </Grid>

                  <SectionHeader><Description /> Exclusion</SectionHeader>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <StyledTextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Notes"
                        value={newItem.notes}
                        onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                        placeholder="Any additional notes or comments..."
                      />
                    </Grid>
                  </Grid>

                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    gap: 2, 
                    pt: 4,
                    borderTop: '1px solid #e2e8f0'
                  }}>
                    <Button onClick={() => setCurrentView('dashboard')} disabled={loading}>
                      Cancel
                    </Button>
                    <FloatingActionButton type="submit" disabled={loading}>
                      {loading ? 'Adding...' : 'Add Item'}
                    </FloatingActionButton>
                  </Box>
                </Box>
              </CardContent>
            </UltraModernCard>
          </Box>
        );
      case 'view':
        return (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography variant="h4" sx={{ color: '#1f2937' }}>Inventory Items</Typography>
              <FloatingActionButton
                startIcon={<AddIcon />}
                onClick={() => setOpenAddDialog(true)}
              >
                Add Item
              </FloatingActionButton>
            </Box>
            {itemsLoading ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error">{error}</Alert>
            ) : (
              <TableContainer component={Paper} sx={{ border: '1px solid #e5e7eb' }}>
                <Table>
                  <TableHead sx={{ background: '#f9fafb' }}>
                    <TableRow>
                      <TableCell><strong>Name</strong></TableCell>
                      <TableCell><strong>Category</strong></TableCell>
                      <TableCell><strong>Brand</strong></TableCell>
                      <TableCell><strong>Model</strong></TableCell>
                      <TableCell><strong>Serial</strong></TableCell>
                      <TableCell><strong>Hostname</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell><strong>Assigned To</strong></TableCell>
                      <TableCell><strong>Location</strong></TableCell>
                      <TableCell><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} align="center" sx={{ color: '#6b7280', py: 4 }}>
                          No items found. Add one to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      items.map((item) => (
                        <TableRow key={item.id} sx={{ '&:hover': { background: '#f9fafb' } }}>
                          <TableCell>
                            <EditableTableCell
                              value={item.item_name}
                              onSave={(value) => handleFieldUpdate(item.id, 'item_name', value)}
                            />
                          </TableCell>
                          <TableCell>
                            <EditableTableCell
                              value={item.category || 'Other'}
                              onSave={(value) => handleFieldUpdate(item.id, 'category', value)}
                              type="select"
                              options={['Desktop', 'Laptop', 'Monitor', 'Network Equipment', 'Mobile Device', 'Accessories', 'Other']}
                            />
                          </TableCell>
                          <TableCell>
                            <EditableTableCell
                              value={item.brand}
                              onSave={(value) => handleFieldUpdate(item.id, 'brand', value)}
                            />
                          </TableCell>
                          <TableCell>
                            <EditableTableCell
                              value={item.model}
                              onSave={(value) => handleFieldUpdate(item.id, 'model', value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                              {item.serial_number}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <EditableTableCell
                              value={item.hostname}
                              onSave={(value) => handleFieldUpdate(item.id, 'hostname', value)}
                            />
                          </TableCell>
                          <TableCell>
                            <EditableTableCell
                              value={item.status}
                              onSave={(value) => handleFieldUpdate(item.id, 'status', value)}
                              type="status"
                              options={['available', 'assigned', 'maintenance', 'retired']}
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ color: item.assigned_to ? '#374151' : '#9ca3af' }}>
                              {item.assigned_to || 'Not assigned'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <EditableTableCell
                              value={item.location}
                              onSave={(value) => handleFieldUpdate(item.id, 'location', value)}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Tooltip title="View Details">
                                <IconButton size="small" onClick={() => handleOpenDetails(item.id)}>
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Assign">
                                <IconButton size="small" onClick={() => setOpenAssignDialog(item.id)}>
                                  <AssignIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Receive">
                                <IconButton size="small" onClick={() => setOpenReceiveDialog(item.id)}>
                                  <ReceiveIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Mark for Disposal">
                                <IconButton size="small" onClick={() => setDisposalConfirm(item.id)}>
                                  <DeleteForeverIcon fontSize="small" color="error" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton size="small" onClick={() => setDeleteConfirm(item.id)}>
                                  <Delete fontSize="small" color="error" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            {/* Enhanced Details Dialog */}
            {openDetailsDialog && (
              <Dialog open onClose={() => setOpenDetailsDialog(null)} maxWidth="lg" fullWidth>
                <DialogTitle>
                  <Typography variant="h6" fontWeight="600">
                    Item Details - {details?.item_name}
                  </Typography>
                </DialogTitle>
                <DialogContent>
                  <Grid container spacing={4} sx={{ mt: 1 }}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ mb: 2, color: '#374151' }}>Basic Information</Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography><strong>Name:</strong> {details?.item_name}</Typography>
                        <Typography><strong>Category:</strong> {details?.category || 'N/A'}</Typography>
                        <Typography><strong>Brand:</strong> {details?.brand}</Typography>
                        <Typography><strong>Model:</strong> {details?.model}</Typography>
                        <Typography><strong>Serial Number:</strong> {details?.serial_number}</Typography>
                        <Typography><strong>Status:</strong> {details?.status}</Typography>
                        <Typography><strong>Location:</strong> {details?.location || 'N/A'}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ mb: 2, color: '#374151' }}>Assignment Information</Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography><strong>Assigned To:</strong> {details?.assigned_to || 'Not assigned'}</Typography>
                        <Typography><strong>Department:</strong> {details?.department || 'N/A'}</Typography>
                        <Typography><strong>Email:</strong> {details?.assigned_email || 'N/A'}</Typography>
                        <Typography><strong>Phone:</strong> {details?.assigned_phone || 'N/A'}</Typography>
                        <Typography><strong>Assignment Date:</strong> {details?.assignment_date ? new Date(details.assignment_date).toLocaleDateString() : 'N/A'}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="h6" sx={{ mb: 2, color: '#374151' }}>Purchase & Warranty</Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography><strong>Purchase Date:</strong> {details?.purchase_date ? new Date(details.purchase_date).toLocaleDateString() : 'N/A'}</Typography>
                        <Typography><strong>Warranty Period:</strong> {details?.warranty_period || 'N/A'}</Typography>
                        <Typography><strong>Deployment Date:</strong> {details?.deployment_date ? new Date(details.deployment_date).toLocaleDateString() : 'N/A'}</Typography>
                        <Typography><strong>Condition:</strong> {details?.condition_status || 'N/A'}</Typography>
                        <Typography><strong>Created:</strong> {details?.created_at ? new Date(details.created_at).toLocaleDateString() : 'N/A'}</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="h6" sx={{ mb: 2, color: '#374151' }}>Notes</Typography>
                      <Paper sx={{ p: 2, background: '#f9fafb' }}>
                        <Typography variant="body2">
                          {details?.notes || 'No notes available'}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setOpenDetailsDialog(null)}>Close</Button>
                  <Button 
                    variant="contained" 
                    startIcon={<EditIcon />}
                    onClick={() => {
                      setOpenDetailsDialog(null);
                      setCurrentView('view');
                    }}
                  >
                    Edit Item
                  </Button>
                </DialogActions>
              </Dialog>
            )}
          </Box>
        );
      case 'assign':
        return (
          <Box>
            <Typography variant="h4" sx={{ color: '#1f2937', mb: 3 }}>Assign Items</Typography>
            {/* Available Items Section */}
            <UltraModernCard sx={{ mb: 4 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Available Items for Assignment</Typography>
                {itemsLoading ? (
                  <CircularProgress />
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Item Name</TableCell>
                          <TableCell>Brand</TableCell>
                          <TableCell>Model</TableCell>
                          <TableCell>Serial Number</TableCell>
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {items.filter(item => item.status === 'available').map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.item_name}</TableCell>
                            <TableCell>{item.brand}</TableCell>
                            <TableCell>{item.model}</TableCell>
                            <TableCell>{item.serial_number}</TableCell>
                            <TableCell>
                              <Button 
                                variant="contained" 
                                size="small"
                                onClick={() => setOpenAssignDialog(item.id)}
                              >
                                Assign
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {items.filter(item => item.status === 'available').length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} align="center" sx={{ color: '#6b7280', py: 4 }}>
                              No available items to assign
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </UltraModernCard>
            {/* Currently Assigned Items Section */}
            <UltraModernCard>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Currently Assigned Items</Typography>
                {itemsLoading ? (
                  <CircularProgress />
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Item Name</TableCell>
                          <TableCell>Brand</TableCell>
                          <TableCell>Model</TableCell>
                          <TableCell>Serial Number</TableCell>
                          <TableCell>Assigned To</TableCell>
                          <TableCell>Department</TableCell>
                          <TableCell>Date Assigned</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {items.filter(item => item.status === 'assigned').map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.item_name}</TableCell>
                            <TableCell>{item.brand}</TableCell>
                            <TableCell>{item.model}</TableCell>
                            <TableCell>{item.serial_number}</TableCell>
                            <TableCell>{item.assigned_to || 'Not specified'}</TableCell>
                            <TableCell>{item.department || 'Not specified'}</TableCell>
                            <TableCell>
                              {item.assignment_date ? new Date(item.assignment_date).toLocaleDateString() : 'Not specified'}
                            </TableCell>
                          </TableRow>
                        ))}
                        {items.filter(item => item.status === 'assigned').length === 0 && (
                          <TableRow>
                            <TableCell colSpan={7} align="center" sx={{ color: '#6b7280', py: 4 }}>
                              No items currently assigned
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </UltraModernCard>
          </Box>
        );
      case 'receive':
        return (
          <Box>
            <Typography variant="h4" sx={{ color: '#1f2937', mb: 3 }}>Receive Items</Typography>
            <UltraModernCard>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Assigned Items for Return</Typography>
                {itemsLoading ? (
                  <CircularProgress />
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Item Name</TableCell>
                          <TableCell>Brand</TableCell>
                          <TableCell>Model</TableCell>
                          <TableCell>Serial Number</TableCell>
                          <TableCell>Assigned To</TableCell>
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {items.filter(item => item.status === 'assigned').map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.item_name}</TableCell>
                            <TableCell>{item.brand}</TableCell>
                            <TableCell>{item.model}</TableCell>
                            <TableCell>{item.serial_number}</TableCell>
                            <TableCell>{item.assigned_to || 'Unknown'}</TableCell>
                            <TableCell>
                              <Button 
                                variant="contained" 
                                color="success"
                                size="small"
                                onClick={() => setOpenReceiveDialog(item.id)}
                              >
                                Receive
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {items.filter(item => item.status === 'assigned').length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ color: '#6b7280', py: 4 }}>
                              No assigned items to receive
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </UltraModernCard>
          </Box>
        );
      case 'reports':
        return (
          <Box>
            <Typography variant="h4" sx={{ color: '#1f2937', mb: 3 }}>Reports & Analytics</Typography>
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <UltraModernCard>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Inventory Summary</Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography>Total Items:</Typography>
                      <Typography fontWeight="bold">{stats.totalItems}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography>Available:</Typography>
                      <Typography fontWeight="bold" color="success.main">{stats.available}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography>Assigned:</Typography>
                      <Typography fontWeight="bold" color="warning.main">{stats.assigned}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography>Maintenance:</Typography>
                      <Typography fontWeight="bold" color="error.main">{stats.maintenance}</Typography>
                    </Box>
                  </CardContent>
                </UltraModernCard>
              </Grid>
              <Grid item xs={12} md={6}>
                <UltraModernCard>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Quick Actions</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setCurrentView('add')}>
                        Add New Item
                      </Button>
                      <Button variant="outlined" startIcon={<ViewListIcon />} onClick={() => setCurrentView('view')}>
                        View All Items
                      </Button>
                      <Button variant="outlined" startIcon={<AssignIcon />} onClick={() => setCurrentView('assign')}>
                        Assign Item
                      </Button>
                    </Box>
                  </CardContent>
                </UltraModernCard>
              </Grid>
            </Grid>
            <UltraModernCard>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ mb: 3 }}>Recent Items</Typography>
                {itemsLoading ? (
                  <CircularProgress />
                ) : items.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Item Name</TableCell>
                          <TableCell>Brand</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Date Added</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {items.slice(0, 5).map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.item_name}</TableCell>
                            <TableCell>{item.brand}</TableCell>
                            <TableCell>
                              <Chip 
                                label={item.status} 
                                size="small"
                                color={item.status === 'available' ? 'success' : 'warning'}
                              />
                            </TableCell>
                            <TableCell>{new Date(item.created_at).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Typography color="textSecondary">No items found.</Typography>
                )}
              </CardContent>
            </UltraModernCard>
          </Box>
        );
      case 'disposal':
        return (
          <Box>
            <Typography variant="h4" sx={{ color: '#1f2937', mb: 3 }}>Items for Disposal</Typography>
            <UltraModernCard>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>Items Marked for Disposal</Typography>
                {itemsLoading ? (
                  <CircularProgress />
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Item Name</TableCell>
                          <TableCell>Brand</TableCell>
                          <TableCell>Model</TableCell>
                          <TableCell>Serial Number</TableCell>
                          <TableCell>Reason</TableCell>
                          <TableCell>Date</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {items.filter(item => item.status === 'retired').map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.item_name}</TableCell>
                            <TableCell>{item.brand}</TableCell>
                            <TableCell>{item.model}</TableCell>
                            <TableCell>{item.serial_number}</TableCell>
                            <TableCell>{item.disposal_reason}</TableCell>
                            <TableCell>{item.disposal_date ? new Date(item.disposal_date).toLocaleDateString() : 'N/A'}</TableCell>
                            <TableCell>
                              <Button 
                                variant="outlined" 
                                color="error"
                                size="small"
                                onClick={() => setDeleteConfirm(item.id)}
                              >
                                Remove
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {items.filter(item => item.status === 'retired').length === 0 && (
                          <TableRow>
                            <TableCell colSpan={7} align="center" sx={{ color: '#6b7280', py: 4 }}>
                              No items marked for disposal
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </UltraModernCard>
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>Mark Item for Disposal</Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button 
                  variant="outlined" 
                  color="error"
                  startIcon={<DeleteForeverIcon />}
                  onClick={() => setCurrentView('view')}
                >
                  Select Item
                </Button>
              </Box>
            </Box>
          </Box>
        );
      default:
        return (
          <Box sx={{ width: '100%' }}>
            <Box sx={{ mb: 6, textAlign: 'center' }}>
              <Typography variant="h2" sx={{ fontWeight: '900', color: '#1f2937', mb: 1 }}>
                Dashboard
              </Typography>
              <Typography variant="h6" sx={{ color: '#6b7280', maxWidth: '600px', mx: 'auto' }}>
                MIS Inventory Management System
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 6 }}>
              <Grid container spacing={3} sx={{ maxWidth: '1000px' }}>
                <Grid item xs={12} sm={6} md={3}>
                  <UltraModernCard sx={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(255,255,255,0.1)',
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                    },
                    '&:hover::before': {
                      opacity: 1,
                    }
                  }}>
                    <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ 
                          background: 'rgba(255,255,255,0.2)', 
                          borderRadius: '12px', 
                          p: 1.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Inventory2 sx={{ fontSize: 28, color: 'white' }} />
                        </Box>
                        <Typography variant="h3" sx={{ fontWeight: '800', color: 'white' }}>
                          {stats.totalItems}
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{ fontWeight: '600', color: 'rgba(255,255,255,0.9)' }}>
                        Total Items
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
                        All inventory items
                      </Typography>
                    </CardContent>
                  </UltraModernCard>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <UltraModernCard sx={{ 
                    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(255,255,255,0.1)',
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                    },
                    '&:hover::before': {
                      opacity: 1,
                    }
                  }}>
                    <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ 
                          background: 'rgba(255,255,255,0.2)', 
                          borderRadius: '12px', 
                          p: 1.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <CheckCircleOutline sx={{ fontSize: 28, color: 'white' }} />
                        </Box>
                        <Typography variant="h3" sx={{ fontWeight: '800', color: 'white' }}>
                          {stats.available}
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{ fontWeight: '600', color: 'rgba(255,255,255,0.9)' }}>
                        Available
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mt: 0.5 }}>
                        Ready to assign
                      </Typography>
                    </CardContent>
                  </UltraModernCard>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <UltraModernCard sx={{ 
                    background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                    color: '#8b4513',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(255,255,255,0.2)',
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                    },
                    '&:hover::before': {
                      opacity: 1,
                    }
                  }}>
                    <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ 
                          background: 'rgba(139,69,19,0.2)', 
                          borderRadius: '12px', 
                          p: 1.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Assignment sx={{ fontSize: 28, color: '#8b4513' }} />
                        </Box>
                        <Typography variant="h3" sx={{ fontWeight: '800', color: '#8b4513' }}>
                          {stats.assigned}
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{ fontWeight: '600', color: '#8b4513' }}>
                        Assigned
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(139,69,19,0.7)', mt: 0.5 }}>
                        Currently in use
                      </Typography>
                    </CardContent>
                  </UltraModernCard>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <UltraModernCard sx={{ 
                    background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                    color: '#c53030',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'rgba(255,255,255,0.2)',
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                    },
                    '&:hover::before': {
                      opacity: 1,
                    }
                  }}>
                    <CardContent sx={{ p: 3, position: 'relative', zIndex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                        <Box sx={{ 
                          background: 'rgba(197,48,48,0.2)', 
                          borderRadius: '12px', 
                          p: 1.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <Warning sx={{ fontSize: 28, color: '#c53030' }} />
                        </Box>
                        <Typography variant="h3" sx={{ fontWeight: '800', color: '#c53030' }}>
                          {stats.maintenance}
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{ fontWeight: '600', color: '#c53030' }}>
                        Maintenance
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(197,48,48,0.7)', mt: 0.5 }}>
                        Needs attention
                      </Typography>
                    </CardContent>
                  </UltraModernCard>
                </Grid>
              </Grid>
            </Box>
            <UltraModernCard sx={{ mb: 6 }}>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <FloatingActionButton startIcon={<AddIcon />} onClick={() => setCurrentView('add')}>
                    Add Item
                  </FloatingActionButton>
                  <FloatingActionButton startIcon={<AssignIcon />} onClick={() => setCurrentView('assign')}>
                    Assign Item
                  </FloatingActionButton>
                  <FloatingActionButton startIcon={<ReceiveIcon />} onClick={() => setCurrentView('receive')}>
                    Receive Item
                  </FloatingActionButton>
                  <FloatingActionButton startIcon={<ReportsIcon />} onClick={() => setCurrentView('reports')}>
                    Reports
                  </FloatingActionButton>
                </Box>
              </CardContent>
            </UltraModernCard>
            <UltraModernCard>
              <CardContent sx={{ p: 6, textAlign: 'center' }}>
                <TrendingUp sx={{ fontSize: 80, color: '#8b5cf6', mb: 3, opacity: 0.7 }} />
                <Typography variant="h5" sx={{ color: '#1f2937', mb: 2, fontWeight: '700' }}>
                  Recent Activity
                </Typography>
                <Typography variant="body1" sx={{ color: '#6b7280' }}>
                  No recent activity to display.
                </Typography>
              </CardContent>
            </UltraModernCard>
          </Box>
        );
    }
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Box sx={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          width: 48,
          height: 48,
          borderRadius: '8px',
          background: '#2563eb',
          mb: 2,
        }}>
          <AutoAwesome sx={{ fontSize: 24, color: 'white' }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: '700', color: '#1f2937', mb: 1 }}>
          MIS Inventory
        </Typography>
        <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: '500' }}>
          Management System
        </Typography>
      </Box>
      <List sx={{ flex: 1, px: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <NavItem
              active={currentView === item.view ? 1 : 0}
              onClick={() => setCurrentView(item.view)}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 48 }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ 
                  fontWeight: currentView === item.view ? '700' : '500',
                  fontSize: '15px'
                }}
              />
              {currentView === item.view && (
                <Star sx={{ fontSize: 16, color: '#8b5cf6', ml: 1 }} />
              )}
            </NavItem>
          </ListItem>
        ))}
      </List>
      <Box sx={{ p: 3 }}>
        <Paper sx={{ 
          p: 3, 
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <Typography variant="h4" sx={{ color: '#2563eb', fontWeight: '800', mb: 1 }}>
            {stats.totalItems}
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', fontWeight: '600' }}>
            Total Items Managed
          </Typography>
        </Paper>
      </Box>
    </Box>
  );

  return (
    <ThemeProvider theme={whiteTheme}>
      <Box sx={{ 
        display: 'flex',
        minHeight: '100vh',
        background: '#f8f9fa',
      }}>
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <MuiAlert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
            {snackbar.message}
          </MuiAlert>
        </Snackbar>

        {/* Enhanced Add Dialog */}
        <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Add New Item</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <StyledTextField fullWidth label="Item Name *" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select value={newItem.category} label="Category" onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}>
                    <MenuItem value="Desktop">Desktop</MenuItem>
                    <MenuItem value="Laptop">Laptop</MenuItem>
                    <MenuItem value="Monitor">Monitor</MenuItem>
                    <MenuItem value="Network Equipment">Network Equipment</MenuItem>
                    <MenuItem value="Mobile Device">Mobile Device</MenuItem>
                    <MenuItem value="Accessories">Accessories</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <StyledTextField fullWidth label="Brand" value={newItem.brand} onChange={(e) => setNewItem({ ...newItem, brand: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={6}>
                <StyledTextField fullWidth label="Model" value={newItem.model} onChange={(e) => setNewItem({ ...newItem, model: e.target.value })} />
              </Grid>
              <Grid item xs={12}>
                <StyledTextField fullWidth label="Serial Number *" value={newItem.serialNumber} onChange={(e) => setNewItem({ ...newItem, serialNumber: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={6}>
                <StyledTextField fullWidth label="Hostname" value={newItem.hostname} onChange={(e) => setNewItem({ ...newItem, hostname: e.target.value })} />
              </Grid>
              <Grid item xs={12} md={6}>
                <StyledTextField fullWidth label="Location" value={newItem.location} onChange={(e) => setNewItem({ ...newItem, location: e.target.value })} />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAddDialog(false)} disabled={loading}>Cancel</Button>
            <FloatingActionButton onClick={handleAddItem} disabled={loading}>
              {loading ? 'Adding...' : 'Add Item'}
            </FloatingActionButton>
          </DialogActions>
        </Dialog>

        {/* Assign Dialog */}
        {openAssignDialog && (
          <Dialog open onClose={() => setOpenAssignDialog(null)} maxWidth="sm" fullWidth>
            <DialogTitle>Assign Item</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <StyledTextField 
                    fullWidth 
                    label="Assigned To" 
                    value={assignmentData.assignedTo} 
                    onChange={(e) => setAssignmentData({ ...assignmentData, assignedTo: e.target.value })} 
                  />
                </Grid>
                <Grid item xs={12}>
                  <StyledTextField 
                    fullWidth 
                    label="Department" 
                    value={assignmentData.department} 
                    onChange={(e) => setAssignmentData({ ...assignmentData, department: e.target.value })} 
                  />
                </Grid>
                <Grid item xs={12}>
                  <StyledTextField 
                    fullWidth 
                    label="Email" 
                    type="email"
                    value={assignmentData.email} 
                    onChange={(e) => setAssignmentData({ ...assignmentData, email: e.target.value })} 
                  />
                </Grid>
                <Grid item xs={12}>
                  <StyledTextField 
                    fullWidth 
                    label="Phone" 
                    value={assignmentData.phone} 
                    onChange={(e) => setAssignmentData({ ...assignmentData, phone: e.target.value })} 
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenAssignDialog(null)}>Cancel</Button>
              <FloatingActionButton onClick={() => handleAssign(openAssignDialog)}>Assign</FloatingActionButton>
            </DialogActions>
          </Dialog>
        )}

        {/* Receive Dialog */}
        {openReceiveDialog && (
          <Dialog open onClose={() => setOpenReceiveDialog(null)} maxWidth="sm" fullWidth>
            <DialogTitle>Receive Item</DialogTitle>
            <DialogContent>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Condition</InputLabel>
                    <Select
                      value={returnData.condition}
                      label="Condition"
                      onChange={(e) => setReturnData({ ...returnData, condition: e.target.value })}
                    >
                      <MenuItem value="good">Good</MenuItem>
                      <MenuItem value="fair">Fair</MenuItem>
                      <MenuItem value="damaged">Damaged</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <StyledTextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Notes"
                    value={returnData.notes}
                    onChange={(e) => setReturnData({ ...returnData, notes: e.target.value })}
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setOpenReceiveDialog(null)}>Cancel</Button>
              <FloatingActionButton onClick={() => handleReceive(openReceiveDialog)}>Receive</FloatingActionButton>
            </DialogActions>
          </Dialog>
        )}

        {/* Delete Confirmation */}
        {deleteConfirm && (
          <Dialog open onClose={() => setDeleteConfirm(null)}>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>
              <Typography>Are you sure you want to delete this item? This action cannot be undone.</Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
              <Button color="error" onClick={() => handleDeleteItem(deleteConfirm)}>Delete</Button>
            </DialogActions>
          </Dialog>
        )}

        {/* Disposal Confirmation */}
        {disposalConfirm && (
          <Dialog open onClose={() => setDisposalConfirm(null)}>
            <DialogTitle>Mark for Disposal</DialogTitle>
            <DialogContent>
              <Typography>Are you sure you want to mark this item for disposal?</Typography>
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Reason for Disposal"
                  value={disposalData.reason}
                  onChange={(e) => setDisposalData({ ...disposalData, reason: e.target.value })}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  label="Disposal Date"
                  type="date"
                  value={disposalData.disposalDate}
                  onChange={(e) => setDisposalData({ ...disposalData, disposalDate: e.target.value })}
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Additional Notes"
                  value={disposalData.notes}
                  onChange={(e) => setDisposalData({ ...disposalData, notes: e.target.value })}
                  margin="normal"
                />
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDisposalConfirm(null)}>Cancel</Button>
              <Button color="error" onClick={() => handleDisposal(disposalConfirm)}>
                Mark for Disposal
              </Button>
            </DialogActions>
          </Dialog>
        )}

        <ModernAppBar
          position="fixed"
          sx={{
            width: { md: `calc(100% - ${drawerWidth}px)` },
            ml: { md: `${drawerWidth}px` },
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: '700' }}>
              {currentView === 'dashboard' ? 'Dashboard' :
               currentView === 'exclusivityform' ? 'Exclusivity Form' :
               currentView === 'add' ? 'Add Item' :
               currentView === 'add' ? 'Add Item' :
               currentView === 'view' ? 'View Items' :
               currentView === 'assign' ? 'Assign' :
               currentView === 'receive' ? 'Receive' :
               currentView === 'reports' ? 'Reports' :
               currentView === 'disposal' ? 'Disposal' : 'Dashboard'}
            </Typography>
          </Toolbar>
        </ModernAppBar>

        <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
          <ModernDrawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{ display: { xs: 'block', md: 'none' } }}
          >
            {drawer}
          </ModernDrawer>
          <ModernDrawer
            variant="permanent"
            sx={{ display: { xs: 'none', md: 'block' } }}
            open
          >
            {drawer}
          </ModernDrawer>
        </Box>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            width: { md: `calc(100% - ${drawerWidth}px)` },
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
          }}
        >
          <Toolbar />
          <Box sx={{ 
            flex: 1,
            p: 4,
            maxWidth: '1400px',
            mx: 'auto',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {renderCurrentView()}
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Dashboard;