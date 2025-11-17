import React, { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// MUI Core Components
import { Box, Drawer, AppBar, Toolbar, List, Typography, IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText, Card, CardContent, Grid, Button,
  useTheme, useMediaQuery, Chip, Paper, TextField, Select, FormControl, InputLabel, CircularProgress, Alert, Snackbar, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, MenuItem, Tooltip,
  Accordion, AccordionSummary, AccordionDetails} from '@mui/material';

  // MUI Icons
import {
  Dashboard as DashboardIcon, Add as AddIcon, ViewList as ViewListIcon, CheckCircle as ReceiveIcon, Inventory2Outlined, StoreMallDirectoryOutlined,
  Assignment as AssignIcon, Assessment as ReportsIcon, Menu as MenuIcon, Inventory2, Build, AttachMoney, ExpandLessOutlined, 
  Description, TrendingUp, Warning, CheckCircleOutline, Star, AutoAwesome, TuneOutlined, AssignmentTurnedIn as Assignment, Delete,
  Visibility as VisibilityIcon, Edit as EditIcon, Save as SaveIcon, Cancel as CancelIcon, DeleteForever as DeleteForeverIcon, DescriptionOutlined, History as HistoryIcon, Logout as LogoutIcon, People as PeopleIcon } from '@mui/icons-material';

import { styled, createTheme, ThemeProvider } from '@mui/material/styles';
import MuiAlert from '@mui/material/Alert';

// Custom Hooks
// import { useInventoryItems, useDashboardStats } from '../hooks/useInventory';
import { useCategories, useChains, useStoreClasses } from '../hooks/useFilter';

import ExclusivityForm from '../components/ExclusivityForm';
import NBFIExclusivityForm from '../components/NBFIExclusivityForm';
import ItemMaintenance from '../components/ItemMaintenance';
import StoreMaintenance from '../components/StoreMaintenance';
import AuditLogs from '../components/AuditLogs';
import UserMaintenance from '../components/UserMaintenance';


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

// Dashboard Component
const Dashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  
  // TEMPORARY DEBUG - Remove after testing
  // useEffect(() => {
  //   console.log('=== DASHBOARD DEBUG ===');
  //   console.log('User from context:', user);
  //   console.log('User from localStorage:', localStorage.getItem('user'));
  //   console.log('Parsed user:', JSON.parse(localStorage.getItem('user') || '{}'));
  // }, [user]);
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentView, setCurrentView] = useState('exclusivityform');
  const [openDetailsDialog, setOpenDetailsDialog] = useState(null);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false); // Added loading state

  // Sync currentView with URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('exclusivity-form')) {
      setCurrentView('exclusivityform');
    } else if (path.includes('item-maintenance')) {
      setCurrentView('itemmaintenance');
    } else if (path.includes('store-maintenance')) {
      setCurrentView('storemaintenance');
    } else if (path.includes('user-management')) {
      setCurrentView('usermanagement');
    } else if (path.includes('audit-logs')) {
      setCurrentView('auditlogs');
    } else {
      // Default to exclusivity form
      setCurrentView('exclusivityform');
    }
  }, [location.pathname, user]);

  // Redirect non-EPC users away from EPC-only pages (excluding exclusivity form which is for all)
  useEffect(() => {
    const hasEpcAccess = user?.role === 'admin' || user?.businessUnit === 'EPC';
    const epcOnlyViews = ['itemmaintenance', 'storemaintenance'];
    
    if (!hasEpcAccess && epcOnlyViews.includes(currentView)) {
      // Redirect to exclusivity form for non-EPC users
      navigate('/exclusivity-form');
    }
  }, [currentView, user, navigate]);

  // Hooks
  // const { items, loading: itemsLoading, error, addItem, deleteItem, updateItem, checkOutItem, checkInItem } = useInventoryItems();
  // const { stats } = useDashboardStats();
  const { categories, loading: catLoading,  error: catError } = useCategories();
  const { chains,     loading: chLoading,   error: chError }  = useChains();
  const { storeClasses, loading: scLoading, error: scError }   = useStoreClasses();
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

  useEffect(() => {
  // if (!catLoading) //console.log('CATEGORIES:', categories);
  }, [catLoading, categories]);

  useEffect(() => {
  // if (!chLoading) //console.log('CHAINS:', chains);
  }, [chLoading, chains]);

  useEffect(() => {
    // if (!scLoading) //console.log('STORE CLASSES:', storeClasses);
  }, [scLoading, storeClasses]);
  

  // Update menuItems to include Disposal
  const allMenuItems = [
    { text: 'Exclusivity Form', icon: <DescriptionOutlined />, view: 'exclusivityform', path: '/exclusivity-form' },
    { text: 'Item Maintenance', icon: <Inventory2Outlined />, view: 'itemmaintenance', path: '/item-maintenance', epcOnly: true },
    { text: 'Store Maintenance', icon: <StoreMallDirectoryOutlined />, view: 'storemaintenance', path: '/store-maintenance', epcOnly: true },
    { text: 'User Management', icon: <PeopleIcon />, view: 'usermanagement', adminOnly: true, path: '/user-management' },
    { text: 'Audit Logs', icon: <HistoryIcon />, view: 'auditlogs', adminOnly: true, path: '/audit-logs' },
    // { text: 'View Items', icon: <ViewListIcon />, view: 'view' },
    // { text: 'Assign', icon: <AssignIcon />, view: 'assign' },
    // { text: 'Receive', icon: <ReceiveIcon />, view: 'receive' },
    // { text: 'Reports', icon: <ReportsIcon />, view: 'reports' },
    // { text: 'Disposal', icon: <DeleteForeverIcon />, view: 'disposal' },
  ];

  // Filter menu items based on user role and business unit
  const menuItems = allMenuItems.filter(item => {
    // TEMPORARY DEBUG
    // console.log('--- Filtering:', item.text);
    // console.log('    adminOnly:', item.adminOnly, ', epcOnly:', item.epcOnly, ', nbfiOnly:', item.nbfiOnly);
    // console.log('    user.role:', user?.role, ', user.businessUnit:', user?.businessUnit);
    
    // If item is admin only, check if user is admin
    if (item.adminOnly) {
      const result = user?.role === 'admin';
      // console.log('    Admin check result:', result);
      return result;
    }
    // If item is EPC only, check if user is admin OR has EPC business unit
    if (item.epcOnly) {
      const result = user?.role === 'admin' || user?.businessUnit === 'EPC';
      // console.log('    EPC check result:', result, '(admin:', user?.role === 'admin', 'isEPC:', user?.businessUnit === 'EPC', ')');
      return result;
    }
    // If item is NBFI only, check if user is admin OR has NBFI business unit
    if (item.nbfiOnly) {
      const result = user?.role === 'admin' || user?.businessUnit === 'NBFI';
      // console.log('    NBFI check result:', result, '(admin:', user?.role === 'admin', 'isNBFI:', user?.businessUnit === 'NBFI', ')');
      return result;
    }
    // console.log('    Default: true');
    return true;
  });

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
      setNewItem({
        name: '', brand: '', model: '', serialNumber: '', category: 'Desktop',
        hostname: '', operatingSystem: '', processor: '', ram: '', storage: '',
        purchaseDate: '', warrantyPeriod: '', deploymentDate: '', location: '', notes: ''
      });
      setOpenAddDialog(false);
      setCurrentView('dashboard');
      showSnackbar('Item added successfully!', 'success');
    } catch (err) {
      // //console.error('Add item error:', err);
      showSnackbar('Failed to add item: ' + (err.response?.data?.error || err.message), 'error');
    } finally {
      setLoading(false);
    }
  };

  // Enhanced field update handler
  const handleFieldUpdate = async (itemId, field, value) => {
    try {
      showSnackbar('Item updated successfully!', 'success');
    } catch (err) {
      showSnackbar('Failed to update item: ' + err.message, 'error');
    }
  };

  const handleDeleteItem = async (id) => {
    try {
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
      setOpenAssignDialog(null);
      setAssignmentData({ assignedTo: '', department: '', email: '', phone: '' });
      showSnackbar('Item assigned successfully!');
    } catch (err) {
      showSnackbar('Failed to assign item: ' + err.message, 'error');
    }
  };

  const handleReceive = async (id) => {
    try {
      setOpenReceiveDialog(null);
      setReturnData({ condition: 'good', notes: '' });
      showSnackbar('Item received back successfully!');
    } catch (err) {
      showSnackbar('Failed to receive item: ' + err.message, 'error');
    }
  };

  const renderCurrentView = () => {
    // Helper function to check if user has access to EPC-only pages
    const hasEpcAccess = user?.role === 'admin' || user?.businessUnit === 'EPC';

    switch (currentView) {
      case 'itemmaintenance':
        if (!hasEpcAccess) {
          return (
            <MuiAlert severity="warning">
              You don't have permission to access Item Maintenance. EPC business unit access required.
            </MuiAlert>
          );
        }
        return <ItemMaintenance />;
      
      case 'storemaintenance':
        if (!hasEpcAccess) {
          return (
            <MuiAlert severity="warning">
              You don't have permission to access Store Maintenance. EPC business unit access required.
            </MuiAlert>
          );
        }
        return <StoreMaintenance />;
      
      case 'usermanagement':
        if (user?.role !== 'admin') {
          return (
            <MuiAlert severity="warning">
              You don't have permission to access User Management. Admin access required.
            </MuiAlert>
          );
        }
        return <UserMaintenance />;
      
      case 'auditlogs':
        if (user?.role !== 'admin') {
          return (
            <MuiAlert severity="warning">
              You don't have permission to access Audit Logs. Admin access required.
            </MuiAlert>
          );
        }
        return <AuditLogs />;
      
      case 'exclusivityform':
      default:
        // Conditional rendering based on business unit
        if (user?.businessUnit === 'NBFI' && user?.role !== 'admin') {
          // NBFI users see NBFI Exclusivity Form
          return <NBFIExclusivityForm />;
        } else {
          // EPC users and admins see EPC Exclusivity Form
          return <ExclusivityForm />;
        }
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
          IEM
        </Typography>
        <Typography variant="body2" sx={{ color: '#6b7280', fontWeight: '500' }}>
          Item Exclusivity Module
        </Typography>
      </Box>
      <List sx={{ flex: 1, px: 2 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <NavItem
              active={currentView === item.view ? 1 : 0}
              onClick={() => navigate(item.path)}
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
            autoHideDuration={3000}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
          >
            <MuiAlert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
              {snackbar.message}
            </MuiAlert>
          </Snackbar>
  
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
                {currentView === 'exclusivityform' && user?.businessUnit === 'NBFI' && user?.role !== 'admin' ? 'NBFI Exclusivity Form' :
                 currentView === 'exclusivityform' ? 'Exclusivity Form' :
                 currentView === 'itemmaintenance' ? 'Item Maintenance' :
                 currentView === 'storemaintenance' ? 'Store Maintenance' :
                 currentView === 'usermanagement' ? 'User Management' :
                 currentView === 'auditlogs' ? 'Audit Logs' : 'Exclusivity Form'}
              </Typography>
              
              {/* User Info and Logout */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {user?.username || 'User'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {user?.role || 'Employee'}
                  </Typography>
                </Box>
                <Tooltip title="Logout">
                  <IconButton
                    color="inherit"
                    onClick={() => {
                      logout();
                      navigate('/login');
                    }}
                    sx={{
                      '&:hover': {
                        background: '#fee2e2',
                        color: '#dc2626'
                      }
                    }}
                  >
                    <LogoutIcon />
                  </IconButton>
                </Tooltip>
              </Box>
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
            key={currentView}
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
              <UltraModernCard>
                <CardContent sx={{ p: 4 }}>
                  {renderCurrentView()}
                </CardContent>
              </UltraModernCard>
            </Box>
          </Box>
        </Box>
      </ThemeProvider>
    );
};

export default Dashboard;