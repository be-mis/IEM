// frontend/src/hooks/useNBFIBranches.js
import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE || 'http://localhost:5000/api',
  timeout: 10000,
});

// Tiny helper to build a query string safely
function toQuery(params) {
  const search = new URLSearchParams();
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && String(v).trim() !== '') {
      search.set(k, v);
    }
  });
  const s = search.toString();
  return s ? `?${s}` : '';
}

/**
 * useNBFIBranches({ chain, category, storeClass })
 * Fetches NBFI stores/branches data
 */
export function useNBFIBranches(filters) {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  // Only fetch when required filters are present
  const shouldFetch = Boolean(
    (filters?.chain || '').trim() && 
    (filters?.storeClass || '').trim() &&
    (filters?.category || '').trim()
  );

  // Only include non-empty filters in the URL
  const query = useMemo(() => toQuery({
    chain: filters?.chain,
    category: filters?.category,
    storeClass: filters?.storeClass,
  }), [filters?.chain, filters?.category, filters?.storeClass]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
        if (!shouldFetch) {
          setBranches([]);
          setLoading(false);
          setError(null);
          return;
        }
      try {
        setLoading(true); 
        setError(null);
        const res = await api.get(`/filters/nbfi/stores${query}`);
        if (cancelled) return;

        console.log('=== NBFI STORES API RESPONSE ===');
        console.log('First store:', res.data?.items?.[0]);
        console.log('All stores:', res.data?.items);

        setBranches(Array.isArray(res.data?.items) ? res.data.items : []);

      } catch (e) {
        if (cancelled) return;
        setError(e.response?.data?.error || e.message || 'Failed to fetch NBFI branches');
        setBranches([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [query, shouldFetch]);

  return { branches, loading, error };
}
