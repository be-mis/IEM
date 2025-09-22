import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  Snackbar,
  Paper,
  Divider,
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  Add as AddIcon,
  Inventory2,
  Build,
  AttachMoney,
  Description,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import { useInventoryItems } from '../hooks/useInventory';

import ListOfBranch from '../components/ListOfBranch'

// Styled Components
const ModernContainer = styled(Box)(({ theme }) => ({
  background: '#f8fafc',
  minHeight: '100vh',
  padding: theme.spacing(4),
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  background: '#ffffff',
  borderRadius: '12px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
  border: '1px solid #e2e8f0',
  overflow: 'hidden',
  padding: theme.spacing(4),
}));

const SectionHeader = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  fontSize: '1rem',
  color: '#1e293b',
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    background: '#f8fafc',
    borderRadius: '8px',
    borderColor: '#cbd5e1',
    '&:hover fieldset': {
      borderColor: '#94a3b8',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#3b82f6',
    },
    '& .MuiOutlinedInput-input': {
      padding: '10px 12px',
    },
  },
  '& .MuiInputLabel-root': {
    fontWeight: 500,
    color: '#64748b',
  },
  '& .MuiFormHelperText-root': {
    marginLeft: 0,
  },
}));

const ActionButton = styled(Button)(({ variant }) => ({
  borderRadius: '8px',
  padding: '10px 20px',
  fontWeight: 600,
  textTransform: 'none',
  ...(variant === 'contained' ? {
    background: '#3b82f6',
    '&:hover': {
      background: '#2563eb',
    },
    '&:disabled': {
      background: '#d1d5db',
    },
  } : {
    borderColor: '#cbd5e1',
    color: '#64748b',
    '&:hover': {
      borderColor: '#3b82f6',
      color: '#3b82f6',
    },
    '&:disabled': {
      borderColor: '#d1d5db',
      color: '#9ca3af',
    },
  }),
}));

// Constants
const categories = [
  'Desktop',
  'Laptop',
  'Monitor',
  'Network Equipment',
  'Mobile Device',
  'Accessories',
  'Other',
];

const statuses = [
  { value: 'available', label: 'Available' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'retired', label: 'Retired' },
];

const conditions = [
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
];

// Main Component
const AddItem = () => {
  const navigate = useNavigate();
  const { addItem } = useInventoryItems();

  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    model: '',
    serialNumber: '',
    category: 'Desktop',
    hostname: '',
    operatingSystem: '',
    processor: '',
    ram: '',
    storage: '',
    status: 'available',
    condition: 'good',
    purchaseDate: '',
    warrantyPeriod: '',
    deploymentDate: '',
    location: '',
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Item name is required';
    if (!formData.serialNumber.trim()) newErrors.serialNumber = 'Serial number is required';
    if (!formData.category) newErrors.category = 'Category is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const itemData = {
        item_name: formData.name.trim(),
        serial_number: formData.serialNumber.trim(),
        brand: formData.brand?.trim() || null,
        model: formData.model?.trim() || null,
        category: formData.category,
        hostname: formData.hostname?.trim() || null,
        operating_system: formData.operatingSystem?.trim() || null,
        processor: formData.processor?.trim() || null,
        ram: formData.ram?.trim() || null,
        storage: formData.storage?.trim() || null,
        purchase_date: formData.purchaseDate || null,
        warranty_period: formData.warrantyPeriod?.trim() || null,
        deployment_date: formData.deploymentDate || null,
        location: formData.location?.trim() || null,
        status: formData.status,
        condition_status: formData.condition,
        quantity: 1,
        notes: formData.notes?.trim() || null,
      };

      await addItem(itemData);

      setSnackbar({ open: true, message: 'Item added successfully!', severity: 'success' });
      setFormData({
        name: '',
        brand: '',
        model: '',
        serialNumber: '',
        category: 'Desktop',
        hostname: '',
        operatingSystem: '',
        processor: '',
        ram: '',
        storage: '',
        status: 'available',
        condition: 'good',
        purchaseDate: '',
        warrantyPeriod: '',
        deploymentDate: '',
        location: '',
        notes: '',
      });

      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (error) {
      setSnackbar({ open: true, message: 'Error adding item: ' + (error.message || 'Please try again'), severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => navigate('/dashboard');
  const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

  return (
    <Dashboard>
      <ModernContainer>
        <StyledPaper>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{ display: 'inline-flex', p: 2, bg: '#3b82f6', borderRadius: '12px', mb: 2 }}>
              <AddIcon sx={{ fontSize: 32, color: 'white' }} />
            </Box>
            <Typography variant="h4" fontWeight={700} color="#1e293b">
              Add New Items
            </Typography>
            <Typography variant="body1" color="#64748b">
              Enter the details for the new inventory item
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit}>
             {/* Basic Information */}
            <SectionHeader>
              <Inventory2 /> Basic Informations
            </SectionHeader>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <StyledTextField
                  fullWidth
                  label="Item Name *"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name}
                  placeholder="e.g., keyboard, mouse, monitor"
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth error={!!errors.category}>
                  <InputLabel>Category *</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    label="Category *"
                    onChange={handleChange}
                    required
                    sx={{
                      background: '#f8fafc',
                      borderRadius: '8px',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#cbd5e1',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#94a3b8',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#3b82f6',
                      },
                    }}
                  >
                    {categories.map(cat => (
                      <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <StyledTextField
                  fullWidth
                  label="Brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="e.g., A4TECH, Dell, HP"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <StyledTextField
                  fullWidth
                  label="Model"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="e.g., BK4500, XPS13"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <StyledTextField
                  fullWidth
                  label="Serial Number *"
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleChange}
                  error={!!errors.serialNumber}
                  helperText={errors.serialNumber}
                  placeholder="e.g., PEJFV15AFF600"
                  required
                  sx={{
                    '& .MuiOutlinedInput-input': {
                      fontFamily: 'monospace',
                      fontSize: '0.9rem',
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    label="Status"
                    onChange={handleChange}
                    sx={{
                      background: '#f8fafc',
                      borderRadius: '8px',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#cbd5e1',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#94a3b8',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#3b82f6',
                      },
                    }}
                  >
                    {statuses.map(status => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Condition</InputLabel>
                  <Select
                    name="condition"
                    value={formData.condition}
                    label="Condition"
                    onChange={handleChange}
                    sx={{
                      background: '#f8fafc',
                      borderRadius: '8px',
                      '& .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#cbd5e1',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#94a3b8',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#3b82f6',
                      },
                    }}
                  >
                    {conditions.map(condition => (
                      <MenuItem key={condition.value} value={condition.value}>
                        {condition.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Technical Specifications */}
            <SectionHeader>
              <Build /> Technical Specifications
            </SectionHeader>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={6}>
                <StyledTextField
                  fullWidth
                  label="Hostname"
                  name="hostname"
                  value={formData.hostname}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <StyledTextField
                  fullWidth
                  label="Operating System"
                  name="operatingSystem"
                  value={formData.operatingSystem}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <StyledTextField
                  fullWidth
                  label="Processor"
                  name="processor"
                  value={formData.processor}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <StyledTextField
                  fullWidth
                  label="RAM"
                  name="ram"
                  value={formData.ram}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <StyledTextField
                  fullWidth
                  label="Storage"
                  name="storage"
                  value={formData.storage}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>

            {/* Dates & Location */}
            <SectionHeader>
              <AttachMoney /> Dates & Location
            </SectionHeader>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={3}>
                <StyledTextField
                  fullWidth
                  label="Purchase Date"
                  name="purchaseDate"
                  type="date"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <StyledTextField
                  fullWidth
                  label="Deployment Date"
                  name="deploymentDate"
                  type="date"
                  value={formData.deploymentDate}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <StyledTextField
                  fullWidth
                  label="Warranty Period"
                  name="warrantyPeriod"
                  value={formData.warrantyPeriod}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <StyledTextField
                  fullWidth
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>

            {/* Notes */}
            <SectionHeader>
              <Description /> Additional Information
            </SectionHeader>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12}>
                {/* <StyledTextFields
                  fullWidth
                  label="Notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  multiline
                  rows={3}
                  placeholder="Any additional notes or comments..."
                /> */}
              </Grid>
            </Grid>

            {/* Buttons */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, pt: 2, borderTop: '1px solid #e2e8f0' }}>
              <ActionButton variant="outlined" onClick={handleCancel} disabled={loading}>
                Cancel
              </ActionButton>
              <ActionButton type="submit" variant="contained" disabled={loading} startIcon={loading ? null : <SaveIcon />}>
                {loading ? 'Adding...' : 'Add Item'}
              </ActionButton>
            </Box>
          </Box>
        </StyledPaper>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </ModernContainer>
    </Dashboard>
  );
};

export default AddItem;