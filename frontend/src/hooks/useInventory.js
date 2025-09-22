// frontend/src/hooks/useInventory.js
import { useState, useEffect } from 'react';
import axios from 'axios';

// Set up axios base URL - Updated for network access
const API_BASE_URL = 'http://192.168.0.138:5000/api';
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log(`Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    console.error('API Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

// Custom hook for inventory items
export const useInventoryItems = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all items
  const fetchItems = async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching items with filters:', filters);
      
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.category) params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page);
      if (filters.limit) params.append('limit', filters.limit);
      
      const response = await api.get(`/inventory/items?${params.toString()}`);
      console.log('Fetched items:', response.data);
      setItems(response.data.items || response.data || []);
    } catch (err) {
      console.error('Error fetching items:', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch items');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  

  // Add new item
  const addItem = async (itemData) => {
    try {
      setError(null);
      console.log('Adding item with data:', itemData);
      
      // Ensure required fields are present
      if (!itemData.item_name || !itemData.serial_number) {
        throw new Error('Item name and serial number are required');
      }

      // Clean and format data for backend
      const cleanedData = {
        item_name: itemData.item_name.trim(),
        serial_number: itemData.serial_number.trim(),
        brand: itemData.brand?.trim() || null,
        model: itemData.model?.trim() || null,
        category: itemData.category || 'Other',
        hostname: itemData.hostname?.trim() || null,
        operating_system: itemData.operating_system?.trim() || null,
        processor: itemData.processor?.trim() || null,
        ram: itemData.ram?.trim() || null,
        storage: itemData.storage?.trim() || null,
        purchase_date: itemData.purchase_date || null,
        warranty_period: itemData.warranty_period?.trim() || null,
        deployment_date: itemData.deployment_date || null,
        location: itemData.location?.trim() || null,
        status: itemData.status || 'available',
        condition_status: itemData.condition_status || 'good',
        quantity: itemData.quantity || 1,
        notes: itemData.notes?.trim() || null,
      };

      const response = await api.post('/inventory/items', cleanedData);
      console.log('Item added successfully:', response.data);
      
      // Refresh items after adding
      await fetchItems();
      
      return response.data;
    } catch (err) {
      console.error('Error adding item:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to add item';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Update item
  const updateItem = async (id, updateData) => {
    try {
      setError(null);
      console.log('Updating item:', id, updateData);
      
      const response = await api.put(`/inventory/items/${id}`, updateData);
      console.log('Item updated successfully:', response.data);
      
      // Update local state
      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, ...response.data } : item
      ));
      
      return response.data;
    } catch (err) {
      console.error('Error updating item:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to update item';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Delete item
  const deleteItem = async (id) => {
    try {
      setError(null);
      console.log('Deleting item:', id);
      
      await api.delete(`/inventory/items/${id}`);
      console.log('Item deleted successfully');
      
      // Remove from local state
      setItems(prev => prev.filter(item => item.id !== id));
      
      return true;
    } catch (err) {
      console.error('Error deleting item:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to delete item';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Check out item (assign item)
  const checkOutItem = async (id, assignmentData) => {
    try {
      setError(null);
      console.log('Checking out item:', id, assignmentData);
      
      // Validate required assignment data
      const assignedToName = assignmentData.assigned_to_name || assignmentData.assignedTo;
      if (!assignedToName) {
        throw new Error('Assigned to name is required');
      }

      const payload = {
        assigned_to_name: assignedToName,
        department: assignmentData.department || null,
        email: assignmentData.email || null,
        phone: assignmentData.phone || null,
        assignment_date: assignmentData.assignment_date || new Date().toISOString(),
      };

      const response = await api.post(`/inventory/items/${id}/checkout`, payload);
      console.log('Item checked out successfully:', response.data);
      
      // Update local state
      setItems(prev => prev.map(item => 
        item.id === id ? { 
          ...item, 
          status: 'assigned',
          assigned_to: assignedToName,
          department: assignmentData.department || null,
          assigned_email: assignmentData.email || null,
          assigned_phone: assignmentData.phone || null,
          assignment_date: payload.assignment_date
        } : item
      ));
      
      return response.data;
    } catch (err) {
      console.error('Error checking out item:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to assign item';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Check in item (return item)
  const checkInItem = async (id, returnData) => {
    try {
      setError(null);
      console.log('Checking in item:', id, returnData);
      
      const payload = {
        return_condition: returnData.condition || 'good',
        return_notes: returnData.notes || null,
      };

      const response = await api.post(`/inventory/items/${id}/checkin`, payload);
      console.log('Item checked in successfully:', response.data);
      
      // Update local state
      setItems(prev => prev.map(item => 
        item.id === id ? { 
          ...item, 
          status: 'available',
          assigned_to: null,
          department: null,
          assigned_email: null,
          assigned_phone: null,
          assignment_date: null
        } : item
      ));
      
      return response.data;
    } catch (err) {
      console.error('Error checking in item:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to check in item';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Get single item
  const getItem = async (id) => {
    try {
      setError(null);
      console.log('Fetching single item:', id);
      
      const response = await api.get(`/inventory/items/${id}`);
      console.log('Fetched single item:', response.data);
      
      return response.data;
    } catch (err) {
      console.error('Error fetching item:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to fetch item';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Test connection to backend
  const testConnection = async () => {
    try {
      console.log('Testing backend connection...');
      const response = await api.get('/inventory/stats');
      console.log('Backend connection successful:', response.data);
      return true;
    } catch (err) {
      console.error('Backend connection failed:', err);
      return false;
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    const initializeData = async () => {
      console.log('Initializing inventory data...');
      const isConnected = await testConnection();
      
      if (isConnected) {
        await fetchItems();
      } else {
        setError('Unable to connect to backend server. Please check if the server is running on http://192.168.0.138:5000');
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  return {
    items,
    loading,
    error,
    fetchItems,
    addItem,
    updateItem,
    deleteItem,
    checkOutItem,
    checkInItem,
    getItem,
    testConnection,
    refetch: fetchItems,
  };
};

// Custom hook for dashboard statistics
export const useDashboardStats = () => {
  const [stats, setStats] = useState({
    totalItems: 0,
    available: 0,
    assigned: 0,
    maintenance: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching dashboard stats...');
      
      const response = await api.get('/inventory/stats');
      console.log('Fetched stats:', response.data);
      
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch statistics');
      
      // Set default stats on error
      setStats({
        totalItems: 0,
        available: 0,
        assigned: 0,
        maintenance: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
};

// Custom hook for categories
export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching categories...');
      
      const response = await api.get('/inventory/categories');
      console.log('Fetched categories:', response.data);
      
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch categories');
      
      // Set default categories on error
      setCategories([
        { id: 1, name: 'Desktop' },
        { id: 2, name: 'Laptop' },
        { id: 3, name: 'Monitor' },
        { id: 4, name: 'Network Equipment' },
        { id: 5, name: 'Mobile Device' },
        { id: 6, name: 'Accessories' },
        { id: 7, name: 'Other' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories,
  };
};