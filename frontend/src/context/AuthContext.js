import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE || 'http://localhost:5000/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Auto-logout after 20 minutes of inactivity
  useEffect(() => {
    let inactivityTimer;
    const INACTIVITY_TIMEOUT = 20 * 60 * 1000; // 20 minutes in milliseconds

    const resetInactivityTimer = () => {
      // Clear existing timer
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }

      // Only set timer if user is logged in
      if (user && token) {
        inactivityTimer = setTimeout(() => {
          console.log('User logged out due to inactivity (30 minutes)');
          logout();
          // Optionally show a message to the user
          alert('You have been logged out due to inactivity.');
          window.location.href = '/login';
        }, INACTIVITY_TIMEOUT);
      }
    };

    // Events that indicate user activity
    const activityEvents = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click', 'mousemove'];

    // Attach event listeners to reset timer on user activity
    const handleActivity = () => {
      resetInactivityTimer();
    };

    if (user && token) {
      activityEvents.forEach(event => {
        window.addEventListener(event, handleActivity);
      });

      // Initialize timer
      resetInactivityTimer();
    }

    // Cleanup function
    return () => {
      if (inactivityTimer) {
        clearTimeout(inactivityTimer);
      }
      activityEvents.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [user, token]);

  useEffect(() => {
    // Check if user is already logged in
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      
      // Parse user and normalize business_unit to businessUnit
      const parsedUser = JSON.parse(storedUser);
      
      // Handle legacy data: convert business_unit to businessUnit if needed
      if (parsedUser.business_unit && !parsedUser.businessUnit) {
        parsedUser.businessUnit = parsedUser.business_unit;
        delete parsedUser.business_unit;
        // Update localStorage with normalized data
        localStorage.setItem('user', JSON.stringify(parsedUser));
      }
      
      setUser(parsedUser);
      
      // Set default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password
      });

      console.log('=== AUTH CONTEXT LOGIN DEBUG ===');
      console.log('Full response:', response.data);
      console.log('User data received:', response.data.user);

      const { token: newToken, user: userData } = response.data;

      // Store in localStorage
      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      console.log('Stored in localStorage:', localStorage.getItem('user'));

      // Set state
      setToken(newToken);
      setUser(userData);

      // Set default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed'
      };
    }
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Clear state
    setToken(null);
    setUser(null);

    // Remove authorization header
    delete axios.defaults.headers.common['Authorization'];
  };

  const isAuthenticated = () => {
    return !!token && !!user;
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
