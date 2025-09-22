import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Chip,
  IconButton,
  Button,
  InputAdornment,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Paper,
  Alert,
  CircularProgress,
  Avatar,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
  Assignment as AssignIcon,
  Visibility as VisibilityIcon,
  Laptop,
  Monitor,
  Phone,
  Router,
  Keyboard,
  Storage,
  FilterList,
  Refresh,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import { useInventoryItems } from '../hooks/useInventory';
import ItemDetailsModal from './ItemDetailsModal';

// Styled Components
const ModernContainer = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
  minHeight: '100vh',
  padding: theme.spacing(3),
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  background: '#ffffff',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  border: '1px solid #e2e8f0',
  overflow: 'hidden',
}));

const FilterCard = styled(Paper)(({ theme }) => ({
  background: '#ffffff',
  borderRadius: '12px',
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  boxShadow: '0 2px 12px rgba(0, 0, 0, 0.05)',
  border: '1px solid #e2e8f0',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    background: '#f8fafc',
    borderRadius: '8px',
    '& fieldset': {
      borderColor: '#cbd5e1',
    },
    '&:hover fieldset': {
      borderColor: '#94a3b8',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#3b82f6',
    },
  },
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  background: '#f8fafc',
  borderRadius: '8px',
  '& fieldset': {
    borderColor: '#cbd5e1',
  },
  '&:hover fieldset': {
    borderColor: '#94a3b8',
  },
  '&.Mui-focused fieldset': {
    borderColor: '#3b82f6',
  },
}));

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: '8px',
  padding: '10px 20px',
  textTransform: 'none',
  fontWeight: '600',
  boxShadow: 'none',
  '&.MuiButton-contained': {
    background: '#3b82f6',
    '&:hover': {
      background: '#2563eb',
      boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
    },
  },
  '&.MuiButton-outlined': {
    borderColor: '#cbd5e1',
    color: '#64748b',
    '&:hover': {
      borderColor: '#3b82f6',
      color: '#3b82f6',
      background: 'rgba(59, 130, 246, 0.05)',
    },
  },
}));

const StatusChip = styled(Chip)(({ status }) => {
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return { bg: '#dcfce7', color: '#166534', border: '#bbf7d0' };
      case 'assigned':
        return { bg: '#fef3c7', color: '#92400e', border: '#fde68a' };
      case 'maintenance':
        return { bg: '#fee2e2', color: '#991b1b', border: '#fecaca' };
      case 'retired':
        return { bg: '#f1f5f9', color: '#475569', border: '#e2e8f0' };
      default:
        return { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0' };
    }
  };

  const colors = getStatusColor(status);
  return {
    background: colors.bg,
    color: colors.color,
    border: `1px solid ${colors.border}`,
    fontWeight: '600',
    fontSize: '0.75rem',
  };
});

const categoryIcons = {
  'Desktop': Laptop,
  'Laptop': Laptop,
  'Monitor': Monitor,
  'Network Equipment': Router,
  'Mobile Device': Phone,
  'Accessories': Keyboard,
  'Other': Storage,
};

const ViewItems = () => {
  const navigate = useNavigate();
  
  const { items, loading, error, deleteItem, updateItem } = useInventoryItems();
  
  const [filteredItems, setFilteredItems] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const handleSaveItem = async (itemId, updatedData) => {
    try {
      await updateItem(itemId, updatedData);
      console.log('Item updated successfully');
    } catch (error) {
      console.error('Error updating item:', error);
      throw error;
    }
  };

  useEffect(() => {
    let filtered = items || [];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(item =>
        item.item_name?.toLowerCase().includes(search) ||
        item.brand?.toLowerCase().includes(search) ||
        item.serial_number?.toLowerCase().includes(search) ||
        item.model?.toLowerCase().includes(search) ||
        item.hostname?.toLowerCase().includes(search) ||
        item.location?.toLowerCase().includes(search)
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    if (departmentFilter !== 'all') {
      filtered = filtered.filter(item => item.department === departmentFilter);
    }

    setFilteredItems(filtered);
    setPage(0);
  }, [items, searchTerm, statusFilter, categoryFilter, departmentFilter]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuClick = (event, item) => {
    setAnchorEl(event.currentTarget);
    setSelectedItem(item);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedItem(null);
  };

  const handleEdit = () => {
    console.log('Edit item:', selectedItem);
    handleMenuClose();
  };

  const handleDelete = (item) => {
  setSelectedItem(item);
  setDeleteDialogOpen(true);
};

const confirmDelete = async () => {
  try {
    // Instead of deleteItem, update the item status to 'retired'
    const disposalData = {
      status: 'retired',
      disposal_reason: 'Marked for disposal from inventory view',
      disposal_date: new Date().toISOString(),
      disposed_by: 'System', // or current user
    };
    
    await updateItem(selectedItem.id, disposalData);
    setDeleteDialogOpen(false);
    setSelectedItem(null);
    
    // Optional: Show success message
    console.log('Item moved to disposal successfully');
  } catch (error) {
    console.error('Error moving item to disposal:', error);
  }
};

  const handleViewDetails = () => {
    setDetailsDialogOpen(true);
    handleMenuClose();
  };

  const handleAssign = () => {
    navigate('/assign');
    handleMenuClose();
  };

  const getCategoryIcon = (category) => {
    const IconComponent = categoryIcons[category] || Storage;
    return <IconComponent sx={{ fontSize: 18 }} />;
  };

  const categories = ['all', 'Desktop', 'Laptop', 'Monitor', 'Network Equipment', 'Mobile Device', 'Accessories', 'Other'];
  const departments = ['all', 'IT', 'HR', 'Finance', 'Marketing', 'Sales', 'Operations'];

  if (loading) {
    return (
      <Dashboard>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
      </Dashboard>
    );
  }

  if (error) {
    return (
      <Dashboard>
        <Box sx={{ p: 3 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Dashboard>
    );
  }

  return (
    <Dashboard>
      <ModernContainer>
        <Box sx={{ maxWidth: '1400px', mx: 'auto', width: '100%' }}>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'flex-start', 
              mb: 3,
              flexWrap: { xs: 'wrap', md: 'nowrap' },
              gap: 2
            }}>
              <Box sx={{ flex: 1, minWidth: { xs: '100%', md: 'auto' } }}>
                <Typography variant="h4" sx={{ 
                  fontWeight: '800', 
                  color: '#1e293b', 
                  mb: 1,
                  background: 'linear-gradient(135deg, #1e293b 0%, #3b82f6 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  Inventory Management
                </Typography>
                <Typography variant="body1" sx={{ color: '#64748b', mb: 2 }}>
                  Comprehensive view and management of all inventory items
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      background: '#10b981' 
                    }} />
                    <Typography variant="body2" sx={{ color: '#64748b', fontWeight: '500' }}>
                      {items?.filter(item => item.status === 'available').length || 0} Available
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      background: '#f59e0b' 
                    }} />
                    <Typography variant="body2" sx={{ color: '#64748b', fontWeight: '500' }}>
                      {items?.filter(item => item.status === 'assigned').length || 0} Assigned
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ 
                      width: 8, 
                      height: 8, 
                      borderRadius: '50%', 
                      background: '#ef4444' 
                    }} />
                    <Typography variant="body2" sx={{ color: '#64748b', fontWeight: '500' }}>
                      {items?.filter(item => item.status === 'maintenance').length || 0} Maintenance
                    </Typography>
                  </Box>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <ActionButton
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={() => window.location.reload()}
                  sx={{ minWidth: 'auto', px: 2 }}
                >
                  Refresh
                </ActionButton>
                <ActionButton
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/add-item')}
                  sx={{ 
                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    boxShadow: '0 4px 14px 0 rgba(59, 130, 246, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
                      boxShadow: '0 6px 20px 0 rgba(59, 130, 246, 0.4)',
                    }
                  }}
                >
                  Add New Item
                </ActionButton>
              </Box>
            </Box>
          </Box>

          <FilterCard>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4}>
                <StyledTextField
                  fullWidth
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon sx={{ color: '#64748b' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <StyledSelect
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="available">Available</MenuItem>
                    <MenuItem value="assigned">Assigned</MenuItem>
                    <MenuItem value="maintenance">Maintenance</MenuItem>
                    <MenuItem value="retired">Retired</MenuItem>
                  </StyledSelect>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <StyledSelect
                    value={categoryFilter}
                    label="Category"
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category === 'all' ? 'All Categories' : category}
                      </MenuItem>
                    ))}
                  </StyledSelect>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Department</InputLabel>
                  <StyledSelect
                    value={departmentFilter}
                    label="Department"
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                  >
                    {departments.map((dept) => (
                      <MenuItem key={dept} value={dept}>
                        {dept === 'all' ? 'All Departments' : dept}
                      </MenuItem>
                    ))}
                  </StyledSelect>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={2}>
                <Box sx={{ 
                  textAlign: 'center',
                  p: 2,
                  borderRadius: '8px',
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                }}>
                  <Typography variant="h6" sx={{ fontWeight: '700', color: '#1e293b' }}>
                    {filteredItems.length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748b' }}>
                    Items Found
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </FilterCard>

          <StyledPaper>
            <TableContainer>
              <Table>
                <TableHead sx={{ background: '#f8fafc' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: '600', color: '#374151' }}>Item</TableCell>
                    <TableCell sx={{ fontWeight: '600', color: '#374151' }}>Category</TableCell>
                    <TableCell sx={{ fontWeight: '600', color: '#374151' }}>Serial Number</TableCell>
                    <TableCell sx={{ fontWeight: '600', color: '#374151' }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: '600', color: '#374151' }}>Assigned To</TableCell>
                    <TableCell sx={{ fontWeight: '600', color: '#374151' }}>Location</TableCell>
                    <TableCell sx={{ fontWeight: '600', color: '#374151' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} sx={{ textAlign: 'center', py: 6 }}>
                        <Box>
                          <Storage sx={{ fontSize: 48, color: '#cbd5e1', mb: 2 }} />
                          <Typography variant="h6" sx={{ color: '#64748b', mb: 1 }}>
                            No items found
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                            Try adjusting your filters or add new items to get started
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredItems
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((item) => (
                        <TableRow key={item.id} hover sx={{ '&:hover': { background: '#f8fafc' } }}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar sx={{ 
                                mr: 2, 
                                background: '#3b82f6',
                                width: 36,
                                height: 36
                              }}>
                                {getCategoryIcon(item.category)}
                              </Avatar>
                              <Box>
                                <Typography variant="body1" sx={{ fontWeight: '600', color: '#1e293b' }}>
                                  {item.item_name}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#64748b' }}>
                                  {item.brand} {item.model}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box sx={{ color: '#64748b' }}>
                                {getCategoryIcon(item.category)}
                              </Box>
                              <Typography sx={{ color: '#374151' }}>{item.category || 'Other'}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ 
                              fontFamily: 'monospace',
                              background: '#f1f5f9',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              display: 'inline-block',
                              color: '#374151'
                            }}>
                              {item.serial_number}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <StatusChip
                              label={item.status?.toUpperCase() || 'UNKNOWN'}
                              status={item.status}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ color: '#374151' }}>
                              {item.assigned_to || 'Not assigned'}
                            </Typography>
                            {item.department && (
                              <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.75rem' }}>
                                {item.department}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography sx={{ color: '#374151' }}>
                              {item.location || 'Not specified'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Tooltip title="More actions">
                              <IconButton
                                onClick={(e) => handleMenuClick(e, item)}
                                size="small"
                                sx={{
                                  '&:hover': {
                                    background: 'rgba(59, 130, 246, 0.1)',
                                  }
                                }}
                              >
                                <MoreVertIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={filteredItems.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              sx={{
                borderTop: '1px solid #e2e8f0',
                background: '#fafbfc',
              }}
            />
          </StyledPaper>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            PaperProps={{
              sx: {
                borderRadius: '8px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e2e8f0',
              }
            }}
          >
            <MenuItem onClick={handleViewDetails} sx={{ gap: 2 }}>
              <VisibilityIcon fontSize="small" sx={{ color: '#3b82f6' }} />
              View Details
            </MenuItem>
            <MenuItem onClick={handleEdit} sx={{ gap: 2 }}>
              <EditIcon fontSize="small" sx={{ color: '#10b981' }} />
              Edit Item
            </MenuItem>
            <MenuItem onClick={handleAssign} sx={{ gap: 2 }}>
              <AssignIcon fontSize="small" sx={{ color: '#f59e0b' }} />
              Assign Item
            </MenuItem>
            <MenuItem onClick={handleDelete} sx={{ gap: 2, color: '#ef4444' }}>
              <DeleteIcon fontSize="small" />
              Delete Item
            </MenuItem>
          </Menu>

          <Dialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
            PaperProps={{
              sx: {
                borderRadius: '12px',
              }
            }}
          >
            <DialogTitle sx={{ fontWeight: '600' }}>Confirm Delete</DialogTitle>
            <DialogContent>
              <Typography>
                Are you sure you want to delete "{selectedItem?.item_name}"? This action cannot be undone.
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 3, gap: 1 }}>
              <ActionButton
                variant="outlined"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </ActionButton>
              <ActionButton 
                variant="contained" 
                onClick={confirmDelete}
                sx={{
                  background: '#ef4444',
                  '&:hover': {
                    background: '#dc2626',
                  }
                }}
              >
                Delete
              </ActionButton>
            </DialogActions>
          </Dialog>

          <ItemDetailsModal
            open={detailsDialogOpen}
            onClose={() => setDetailsDialogOpen(false)}
            item={selectedItem}
            onSave={handleSaveItem}
            mode="view"
          />
        </Box>
      </ModernContainer>
    </Dashboard>
  );
};

export default ViewItems;