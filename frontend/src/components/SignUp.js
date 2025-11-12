import React, { useState, useEffect } from 'react';
import {
  Box, Paper, TextField, Button, Typography, Link, Alert,
  InputAdornment, IconButton, Container, CircularProgress,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import {
  Visibility, VisibilityOff, LockOutlined, PersonOutline,
  EmailOutlined, CheckCircleOutline
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE || 'http://localhost:5000/api';

export default function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'employee',
    businessUnit: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Auto-set Business Unit based on email domain
  useEffect(() => {
    if (formData.email) {
      const emailLower = formData.email.toLowerCase();
      
      if (emailLower.endsWith('@barbizonfashion.com')) {
        setFormData(prev => ({ ...prev, businessUnit: 'NBFI' }));
      } else if (emailLower.endsWith('@everydayproductscorp.com') || emailLower.endsWith('@everydayproductscorp.net')) {
        setFormData(prev => ({ ...prev, businessUnit: 'EPC' }));
      }
    }
  }, [formData.email]);

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    setError(''); // Clear error when user starts typing
  };

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword || !formData.businessUnit) {
      setError('All fields are required');
      return false;
    }

    // Username validation
    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters long');
      return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Password validation
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    // Password match validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setError('');

      const response = await axios.post(`${API_BASE_URL}/auth/register`, {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        businessUnit: formData.businessUnit
      });

      setSuccess(true);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (err) {
      console.error('Registration error:', err);
      setError(
        err.response?.data?.message || 
        'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(prev => !prev);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={12}
          sx={{
            p: 4,
            borderRadius: 3,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)'
          }}
        >
          {/* Logo/Header */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto',
                mb: 2,
                boxShadow: '0 4px 20px rgba(102, 126, 234, 0.4)'
              }}
            >
              <PersonOutline sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
              Create Account
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Join the IEM System today
            </Typography>
          </Box>

          {/* Success Alert */}
          {success && (
            <Alert 
              severity="success" 
              sx={{ mb: 3 }}
              icon={<CheckCircleOutline />}
            >
              Account created successfully! Redirecting to login...
            </Alert>
          )}

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Sign Up Form */}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              fullWidth
              label="Username"
              variant="outlined"
              value={formData.username}
              onChange={handleChange('username')}
              disabled={loading || success}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutline color="action" />
                  </InputAdornment>
                ),
              }}
              autoComplete="username"
              autoFocus
            />

            <TextField
              fullWidth
              label="Email Address"
              variant="outlined"
              type="email"
              value={formData.email}
              onChange={handleChange('email')}
              disabled={loading || success}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlined color="action" />
                  </InputAdornment>
                ),
              }}
              autoComplete="email"
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Business Unit</InputLabel>
              <Select
                value={formData.businessUnit}
                onChange={handleChange('businessUnit')}
                label="Business Unit"
                disabled={loading || success}
              >
                <MenuItem value="">
                  <em>Select Business Unit</em>
                </MenuItem>
                <MenuItem value="NBFI">NBFI (Barbizon Fashion)</MenuItem>
                <MenuItem value="EPC">EPC (Everyday Products Corp)</MenuItem>
              </Select>
              {formData.businessUnit && formData.email && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 1.5 }}>
                  {formData.email.toLowerCase().endsWith('@barbizonfashion.com') && '✓ Auto-detected from email domain'}
                  {(formData.email.toLowerCase().endsWith('@everydayproductscorp.com') || formData.email.toLowerCase().endsWith('@everydayproductscorp.net')) && '✓ Auto-detected from email domain'}
                </Typography>
              )}
            </FormControl>

            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              variant="outlined"
              value={formData.password}
              onChange={handleChange('password')}
              disabled={loading || success}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                      disabled={loading || success}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              autoComplete="new-password"
              helperText="Must be at least 6 characters"
            />

            <TextField
              fullWidth
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              variant="outlined"
              value={formData.confirmPassword}
              onChange={handleChange('confirmPassword')}
              disabled={loading || success}
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleToggleConfirmPasswordVisibility}
                      edge="end"
                      disabled={loading || success}
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              autoComplete="new-password"
            />

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={formData.role}
                onChange={handleChange('role')}
                label="Role"
                disabled={loading || success}
              >
                <MenuItem value="employee">Employee</MenuItem>
                <MenuItem value="manager">Manager</MenuItem>
              </Select>
            </FormControl>

            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loading || success}
              sx={{
                py: 1.5,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #5568d3 0%, #653a8b 100%)',
                },
                mb: 2
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Create Account'
              )}
            </Button>

            {/* Login Link */}
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Already have an account?{' '}
                <Link
                  component="button"
                  type="button"
                  variant="body2"
                  onClick={() => navigate('/login')}
                  sx={{
                    textDecoration: 'none',
                    fontWeight: 'bold',
                    color: '#667eea',
                    '&:hover': {
                      textDecoration: 'underline'
                    }
                  }}
                  disabled={loading || success}
                >
                  Sign In
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Footer */}
        <Typography
          variant="body2"
          color="white"
          align="center"
          sx={{ mt: 4, opacity: 0.9 }}
        >
          © 2025 IEM System. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}
