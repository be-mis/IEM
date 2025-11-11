import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TablePagination, TextField, InputAdornment, IconButton,
  Button, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, Chip, Typography,
  Alert, Snackbar, CircularProgress, Tooltip, Grid, Switch, FormControlLabel
} from '@mui/material';
import {
  Search as SearchIcon, Clear as ClearIcon, Add as AddIcon,
  Edit as EditIcon, Delete as DeleteIcon, Visibility, VisibilityOff,
  PersonAdd as PersonAddIcon, Block as BlockIcon, CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = process.env.REACT_APP_API_BASE || 'http://localhost:5000/api';

export default function UserMaintenance() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  
  // Dialog states
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteConfirmDialog, setDeleteConfirmDialog] = useState(null);
  
  // Form states
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'employee',
    is_active: true
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  
  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/auth/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setUsers(response.data.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users
  const filteredUsers = React.useMemo(() => {
    const searchLower = search.toLowerCase().trim();
    if (!searchLower) return users;

    return users.filter(user =>
      user.username?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.role?.toLowerCase().includes(searchLower)
    );
  }, [users, search]);

  // Paginate
  const paginatedUsers = React.useMemo(() => {
    return filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [filteredUsers, page, rowsPerPage]);

  // Handle pagination
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Open add dialog
  const handleOpenAddDialog = () => {
    setDialogMode('add');
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'employee',
      is_active: true
    });
    setSelectedUser(null);
    setOpenDialog(true);
  };

  // Open edit dialog
  const handleOpenEditDialog = (user) => {
    setDialogMode('edit');
    setFormData({
      username: user.username,
      email: user.email,
      password: '', // Don't populate password for edit
      role: user.role,
      is_active: user.is_active
    });
    setSelectedUser(user);
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'employee',
      is_active: true
    });
    setSelectedUser(null);
    setShowPassword(false);
  };

  // Handle form change
  const handleFormChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'is_active' ? event.target.checked : event.target.value
    }));
  };

  // Submit form (add or edit)
  const handleSubmit = async () => {
    try {
      setFormLoading(true);
      const token = localStorage.getItem('token');

      if (dialogMode === 'add') {
        // Add new user
        if (!formData.username || !formData.email || !formData.password) {
          setSnackbar({
            open: true,
            message: 'Please fill in all required fields',
            severity: 'error'
          });
          return;
        }

        await axios.post(`${API_BASE_URL}/auth/users`, formData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setSnackbar({
          open: true,
          message: 'User created successfully',
          severity: 'success'
        });
      } else {
        // Update existing user
        const updateData = {
          email: formData.email,
          role: formData.role,
          is_active: formData.is_active
        };
        
        // Only include password if provided
        if (formData.password) {
          updateData.password = formData.password;
        }

        await axios.put(`${API_BASE_URL}/auth/users/${selectedUser.id}`, updateData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setSnackbar({
          open: true,
          message: 'User updated successfully',
          severity: 'success'
        });
      }

      handleCloseDialog();
      fetchUsers();
    } catch (err) {
      console.error('Error saving user:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to save user',
        severity: 'error'
      });
    } finally {
      setFormLoading(false);
    }
  };

  // Delete user
  const handleDeleteUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(`${API_BASE_URL}/auth/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setSnackbar({
        open: true,
        message: 'User deleted successfully',
        severity: 'success'
      });

      setDeleteConfirmDialog(null);
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to delete user',
        severity: 'error'
      });
    }
  };

  // Toggle user active status
  const handleToggleActive = async (user) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.put(`${API_BASE_URL}/auth/users/${user.id}`, {
        is_active: !user.is_active
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setSnackbar({
        open: true,
        message: `User ${!user.is_active ? 'activated' : 'deactivated'} successfully`,
        severity: 'success'
      });

      fetchUsers();
    } catch (err) {
      console.error('Error toggling user status:', err);
      setSnackbar({
        open: true,
        message: err.response?.data?.message || 'Failed to update user status',
        severity: 'error'
      });
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'manager':
        return 'warning';
      case 'employee':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        User Management
      </Typography>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Search and Add Button */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              size="small"
              label="Search users"
              placeholder="Search by username, email, or role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: search ? (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setSearch('')} edge="end" size="small">
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleOpenAddDialog}
            >
              Add New User
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Users Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Username</strong></TableCell>
                  <TableCell><strong>Email</strong></TableCell>
                  <TableCell><strong>Role</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell><strong>Created At</strong></TableCell>
                  <TableCell align="center"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      {search ? `No users found matching "${search}"` : 'No users found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedUsers.map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.role}
                          size="small"
                          color={getRoleColor(user.role)}
                        />
                      </TableCell>
                      <TableCell>
                        {user.is_active ? (
                          <Chip
                            icon={<CheckCircleIcon />}
                            label="Active"
                            size="small"
                            color="success"
                          />
                        ) : (
                          <Chip
                            icon={<BlockIcon />}
                            label="Inactive"
                            size="small"
                            color="default"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title={user.id === currentUser?.id && user.role === 'admin' ? 'Cannot edit your own admin account' : 'Edit User'}>
                          <span>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleOpenEditDialog(user)}
                              disabled={user.id === currentUser?.id && user.role === 'admin'}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title={user.id === currentUser?.id ? 'Cannot deactivate yourself' : (user.is_active ? 'Deactivate' : 'Activate')}>
                          <span>
                            <IconButton
                              size="small"
                              color={user.is_active ? 'warning' : 'success'}
                              onClick={() => handleToggleActive(user)}
                              disabled={user.id === currentUser?.id}
                            >
                              {user.is_active ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                            </IconButton>
                          </span>
                        </Tooltip>
                        <Tooltip title={user.id === currentUser?.id ? 'Cannot delete yourself' : 'Delete User'}>
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => setDeleteConfirmDialog(user)}
                              disabled={user.id === currentUser?.id}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            rowsPerPageOptions={[10, 25, 50]}
            component="div"
            count={filteredUsers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}

      {/* Add/Edit User Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {dialogMode === 'add' ? 'Add New User' : 'Edit User'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Username"
                  value={formData.username}
                  onChange={handleFormChange('username')}
                  disabled={dialogMode === 'edit'}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleFormChange('email')}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={dialogMode === 'add' ? 'Password' : 'New Password (leave blank to keep current)'}
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleFormChange('password')}
                  required={dialogMode === 'add'}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={formData.role}
                    label="Role"
                    onChange={handleFormChange('role')}
                  >
                    <MenuItem value="employee">Employee</MenuItem>
                    <MenuItem value="manager">Manager</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.is_active}
                      onChange={handleFormChange('is_active')}
                      color="primary"
                    />
                  }
                  label="Active User"
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={formLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="primary"
            disabled={formLoading}
          >
            {formLoading ? <CircularProgress size={24} /> : dialogMode === 'add' ? 'Add User' : 'Update User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirmDialog}
        onClose={() => setDeleteConfirmDialog(null)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete user <strong>{deleteConfirmDialog?.username}</strong>?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmDialog(null)}>Cancel</Button>
          <Button
            onClick={() => handleDeleteUser(deleteConfirmDialog.id)}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
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
