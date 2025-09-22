// src/components/ItemDetailsModal.js
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Inventory2,
  Build,
  AttachMoney,
  Description
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

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
      borderColor: '#3b82f6',
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

const SectionHeader = ({ icon: Icon, children, sx }) => (
  <Typography
    variant="h6"
    sx={{
      display: 'flex',
      alignItems: 'center',
      color: '#374151',
      fontWeight: 600,
      mb: 3,
      mt: 4,
      gap: 1,
      fontSize: '1.1rem',
      ...sx,
    }}
  >
    <Icon sx={{ fontSize: 20, color: '#6b7280' }} />
    {children}
  </Typography>
);

const categories = [
  'Desktop',
  'Laptop',
  'Monitor',
  'Network Equipment',
  'Mobile Device',
  'Accessories',
  'Keyboard',
  'Mouse',
  'Headset',
  'Webcam',
  'Printer',
  'Scanner',
  'Other',
];

const statuses = [
  { value: 'available', label: 'Available' },
  { value: 'assigned', label: 'Assigned' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'retired', label: 'Retired' },
];

const conditions = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
  { value: 'damaged', label: 'Damaged' },
];

const ItemDetailsModal = ({ open, onClose, item, onSave, mode = 'view' }) => {
  const [isEditing, setIsEditing] = useState(mode === 'edit');
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setFormData({
        item_name: item.item_name || '',
        category: item.category || 'Desktop',
        brand: item.brand || '',
        model: item.model || '',
        serial_number: item.serial_number || '',
        status: item.status || 'available',
        hostname: item.hostname || '',
        operating_system: item.operating_system || '',
        processor: item.processor || '',
        ram: item.ram || '',
        storage: item.storage || '',
        purchase_date: item.purchase_date || '',
        deployment_date: item.deployment_date || '',
        warranty_period: item.warranty_period || '',
        location: item.location || '',
        condition_status: item.condition_status || item.condition || 'good',
        notes: item.notes || '',
        // Assignment fields
        assigned_to: item.assigned_to_name || item.assigned_to || '',
        department: item.department || '',
        email: item.email || item.assigned_email || '',
        phone: item.phone || item.assigned_phone || '',
        assignment_date: item.assignment_date || '',
      });
    }
  }, [item]);

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSave = async () => {
    if (onSave) {
      setLoading(true);
      try {
        await onSave(item.id, formData);
        setIsEditing(false);
      } catch (error) {
        console.error('Error saving item:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (item) {
      // Reset form data to original values
      setFormData({
        item_name: item.item_name || '',
        category: item.category || 'Desktop',
        brand: item.brand || '',
        model: item.model || '',
        serial_number: item.serial_number || '',
        status: item.status || 'available',
        hostname: item.hostname || '',
        operating_system: item.operating_system || '',
        processor: item.processor || '',
        ram: item.ram || '',
        storage: item.storage || '',
        purchase_date: item.purchase_date || '',
        deployment_date: item.deployment_date || '',
        warranty_period: item.warranty_period || '',
        location: item.location || '',
        condition_status: item.condition_status || item.condition || 'good',
        notes: item.notes || '',
        assigned_to: item.assigned_to_name || item.assigned_to || '',
        department: item.department || '',
        email: item.email || item.assigned_email || '',
        phone: item.phone || item.assigned_phone || '',
        assignment_date: item.assignment_date || '',
      });
    }
    setIsEditing(false);
  };

  if (!item) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ 
        fontWeight: '600', 
        fontSize: '1.5rem',
        color: '#1e293b',
        borderBottom: '1px solid #e5e7eb',
        pb: 2,
        textAlign: 'center'
      }}>
        {isEditing ? 'Edit Item' : `Item Details - ${item.item_name}`}
      </DialogTitle>
      
      <DialogContent sx={{ p: 4 }}>
        <Box component="form">
          {/* Basic Information */}
          <SectionHeader icon={Inventory2} sx={{ mt: 0 }}>
            Basic Information
          </SectionHeader>
          <Grid container spacing={3} sx={{ mb: 2 }}>
            <Grid item xs={12} md={3}>
              <StyledTextField
                fullWidth
                label="Item Name *"
                value={formData.item_name || ''}
                onChange={handleChange('item_name')}
                InputProps={{ readOnly: !isEditing }}
                variant={isEditing ? 'outlined' : 'standard'}
                required
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Category *</InputLabel>
                <Select
                  value={formData.category || 'Desktop'}
                  label="Category *"
                  onChange={handleChange('category')}
                  disabled={!isEditing}
                  sx={{
                    background: isEditing ? '#ffffff' : 'transparent',
                    borderRadius: '8px',
                  }}
                >
                  {categories.map(cat => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <StyledTextField
                fullWidth
                label="Brand"
                value={formData.brand || ''}
                onChange={handleChange('brand')}
                InputProps={{ readOnly: !isEditing }}
                variant={isEditing ? 'outlined' : 'standard'}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <StyledTextField
                fullWidth
                label="Model"
                value={formData.model || ''}
                onChange={handleChange('model')}
                InputProps={{ readOnly: !isEditing }}
                variant={isEditing ? 'outlined' : 'standard'}
              />
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mb: 2 }}>
            <Grid item xs={12} md={4}>
              <StyledTextField
                fullWidth
                label="Serial Number *"
                value={formData.serial_number || ''}
                onChange={handleChange('serial_number')}
                InputProps={{ 
                  readOnly: !isEditing,
                  style: { fontFamily: 'monospace' }
                }}
                variant={isEditing ? 'outlined' : 'standard'}
                required
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status || 'available'}
                  label="Status"
                  onChange={handleChange('status')}
                  disabled={!isEditing}
                  sx={{
                    background: isEditing ? '#ffffff' : 'transparent',
                    borderRadius: '8px',
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
            <Grid item xs={12} md={4}>
              <StyledTextField
                fullWidth
                label="Location"
                value={formData.location || ''}
                onChange={handleChange('location')}
                InputProps={{ readOnly: !isEditing }}
                variant={isEditing ? 'outlined' : 'standard'}
              />
            </Grid>
          </Grid>

          {/* Technical Specifications */}
          <SectionHeader icon={Build}>
            Technical Specifications
          </SectionHeader>
          <Grid container spacing={3} sx={{ mb: 2 }}>
            <Grid item xs={12} md={6}>
              <StyledTextField
                fullWidth
                label="Hostname"
                value={formData.hostname || ''}
                onChange={handleChange('hostname')}
                InputProps={{ readOnly: !isEditing }}
                variant={isEditing ? 'outlined' : 'standard'}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <StyledTextField
                fullWidth
                label="Operating System"
                value={formData.operating_system || ''}
                onChange={handleChange('operating_system')}
                InputProps={{ readOnly: !isEditing }}
                variant={isEditing ? 'outlined' : 'standard'}
              />
            </Grid>
          </Grid>

          <Grid container spacing={3} sx={{ mb: 2 }}>
            <Grid item xs={12} md={4}>
              <StyledTextField
                fullWidth
                label="Processor"
                value={formData.processor || ''}
                onChange={handleChange('processor')}
                InputProps={{ readOnly: !isEditing }}
                variant={isEditing ? 'outlined' : 'standard'}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <StyledTextField
                fullWidth
                label="RAM"
                value={formData.ram || ''}
                onChange={handleChange('ram')}
                InputProps={{ readOnly: !isEditing }}
                variant={isEditing ? 'outlined' : 'standard'}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <StyledTextField
                fullWidth
                label="Storage"
                value={formData.storage || ''}
                onChange={handleChange('storage')}
                InputProps={{ readOnly: !isEditing }}
                variant={isEditing ? 'outlined' : 'standard'}
              />
            </Grid>
          </Grid>

          {/* Dates & Location */}
          <SectionHeader icon={AttachMoney}>
            Dates & Warranty
          </SectionHeader>
          <Grid container spacing={3} sx={{ mb: 2 }}>
            <Grid item xs={12} md={3}>
              <StyledTextField
                fullWidth
                label="Purchase Date"
                type="date"
                value={formData.purchase_date || ''}
                onChange={handleChange('purchase_date')}
                InputProps={{ readOnly: !isEditing }}
                InputLabelProps={{ shrink: true }}
                variant={isEditing ? 'outlined' : 'standard'}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <StyledTextField
                fullWidth
                label="Deployment Date"
                type="date"
                value={formData.deployment_date || ''}
                onChange={handleChange('deployment_date')}
                InputProps={{ readOnly: !isEditing }}
                InputLabelProps={{ shrink: true }}
                variant={isEditing ? 'outlined' : 'standard'}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <StyledTextField
                fullWidth
                label="Warranty Period"
                value={formData.warranty_period || ''}
                onChange={handleChange('warranty_period')}
                InputProps={{ readOnly: !isEditing }}
                variant={isEditing ? 'outlined' : 'standard'}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Condition</InputLabel>
                <Select
                  value={formData.condition_status || 'good'}
                  label="Condition"
                  onChange={handleChange('condition_status')}
                  disabled={!isEditing}
                  sx={{
                    background: isEditing ? '#ffffff' : 'transparent',
                    borderRadius: '8px',
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

          {/* Assignment Information - Only show if item has assignment data */}
          {(formData.assigned_to || isEditing) && (
            <>
              <SectionHeader icon={Description}>
                Assignment Information
              </SectionHeader>
              <Grid container spacing={3} sx={{ mb: 2 }}>
                <Grid item xs={12} md={6}>
                  <StyledTextField
                    fullWidth
                    label="Assigned To"
                    value={formData.assigned_to || ''}
                    onChange={handleChange('assigned_to')}
                    InputProps={{ readOnly: !isEditing }}
                    variant={isEditing ? 'outlined' : 'standard'}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <StyledTextField
                    fullWidth
                    label="Department"
                    value={formData.department || ''}
                    onChange={handleChange('department')}
                    InputProps={{ readOnly: !isEditing }}
                    variant={isEditing ? 'outlined' : 'standard'}
                  />
                </Grid>
              </Grid>
              <Grid container spacing={3} sx={{ mb: 2 }}>
                <Grid item xs={12} md={6}>
                  <StyledTextField
                    fullWidth
                    label="Email"
                    value={formData.email || ''}
                    onChange={handleChange('email')}
                    InputProps={{ readOnly: !isEditing }}
                    variant={isEditing ? 'outlined' : 'standard'}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <StyledTextField
                    fullWidth
                    label="Phone"
                    value={formData.phone || ''}
                    onChange={handleChange('phone')}
                    InputProps={{ readOnly: !isEditing }}
                    variant={isEditing ? 'outlined' : 'standard'}
                  />
                </Grid>
              </Grid>
            </>
          )}

          {/* Additional Information */}
          <SectionHeader icon={Description}>
            Additional Information
          </SectionHeader>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12}>
              <StyledTextField
                fullWidth
                multiline
                rows={4}
                label="Notes"
                value={formData.notes || ''}
                onChange={handleChange('notes')}
                InputProps={{ readOnly: !isEditing }}
                variant={isEditing ? 'outlined' : 'standard'}
                placeholder="Any additional notes or comments..."
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ 
        p: 3, 
        borderTop: '1px solid #e5e7eb',
        justifyContent: 'space-between'
      }}>
        <Button onClick={onClose} sx={{ color: '#6b7280', textTransform: 'uppercase' }}>
          CLOSE
        </Button>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {isEditing ? (
            <>
              <Button 
                onClick={handleCancel}
                sx={{ color: '#6b7280', textTransform: 'uppercase' }}
                disabled={loading}
              >
                CANCEL
              </Button>
              <Button 
                variant="contained" 
                onClick={handleSave}
                disabled={loading}
                sx={{ 
                  background: '#10b981', 
                  textTransform: 'uppercase',
                  '&:hover': {
                    background: '#059669'
                  }
                }}
              >
                {loading ? 'SAVING...' : 'SAVE CHANGES'}
              </Button>
            </>
          ) : (
            <Button 
              variant="contained" 
              onClick={handleEdit}
              sx={{ 
                background: '#3b82f6', 
                textTransform: 'uppercase',
                '&:hover': {
                  background: '#2563eb'
                }
              }}
            >
              EDIT ITEM
            </Button>
          )}
        </Box>
      </DialogActions>
    </Dialog>
  );
};
export default ItemDetailsModal;