// frontend/src/hooks/useNBFIFilter.js
import { useState, useEffect } from 'react';
import axios from 'axios';

// Set up axios base URL
const API_BASE_URL = process.env.REACT_APP_API_BASE || 'http://localhost:3001/api';
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    // console.log(`Making ${config.method?.toUpperCase()} request to: ${config.url}`);
    return config;
  },
  (error) => {
    // console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    // console.log(`Response from ${response.config.url}:`, response.status);
    return response;
  },
  (error) => {
    // console.error('API Response Error:', {
    //   url: error.config?.url,
    //   status: error.response?.status,
    //   data: error.response?.data,
    //   message: error.message
    // });
    return Promise.reject(error);
  }
);

// Custom hook for NBFI brands
export const useNBFIBrands = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/filters/nbfi/brands');
      setBrands(response.data.items || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch NBFI brands');
      setBrands([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBrands(); }, []);

  return { brands, loading, error, refetch: fetchBrands };
};

// Custom hook for NBFI chains
export const useNBFIChains = () => {
  const [chains, setChains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchChains = async () => {
    try {
      setLoading(true); 
      setError(null);
      const res = await api.get('/filters/nbfi/chains');
      setChains(res.data.items || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch NBFI chains');
      setChains([]);
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchChains(); }, []);
  return { chains, loading, error, refetch: fetchChains };
};

// Custom hook for NBFI store classes
export const useNBFIStoreClasses = () => {
  const [storeClasses, setStoreClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStoreClasses = async () => {
    try {
      setLoading(true); 
      setError(null);
      const res = await api.get('/filters/nbfi/store-classes');
      setStoreClasses(res.data.items || []);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch NBFI store classes');
      setStoreClasses([]);
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchStoreClasses(); }, []);
  return { storeClasses, loading, error, refetch: fetchStoreClasses };
};
