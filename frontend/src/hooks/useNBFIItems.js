import { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE || 'http://localhost:5000/api',
  timeout: 30000,
});

/**
 * useNBFIItems({ chain, storeClass, category }, debounceMs = 300)
 * Fetches NBFI items data
 */
export default function useNBFIItems({ chain, storeClass, category } = {}, debounceMs = 300) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);

  // Define when to fetch data
  const shouldFetch = Boolean(
    (chain || '').trim() &&
    (storeClass || '').trim() &&
    (category || '').trim()
  );

  // Memoize the query string
  const query = useMemo(() => {
    if (!shouldFetch) return '';
    const params = new URLSearchParams({
      chain: String(chain || '').trim(),
      storeClass: String(storeClass || '').trim(),
      category: String(category || '').trim(),
    });
    return `?${params.toString()}`;
  }, [chain, storeClass, category, shouldFetch]);

  useEffect(() => {
    // Clear any pending fetch from previous filter changes
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // If the condition to fetch isn't met, reset the state and stop
    if (!shouldFetch) {
      setItems([]);
      setLoading(false);
      setError(null);
      return;
    }

    // Use AbortController for handling request cancellation
    const controller = new AbortController();

    const fetchItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `/filters/nbfi/items${query}`;
        const res = await api.get(url, { signal: controller.signal });
        const dataItems = (res?.data?.items) || [];
        console.log(`Fetched NBFI Items from URL "${url}":`, dataItems);
        setItems(Array.isArray(dataItems) ? dataItems : []); 
      } catch (err) {
        if (axios.isCancel(err)) {
          // Request was cancelled, do nothing
        } else {
          setError(err?.response?.data?.error || err.message || 'Failed to fetch NBFI items');
          setItems([]);
        }
      } finally {
        setLoading(false);
      }
    };

    // Apply the debounce logic
    debounceRef.current = setTimeout(fetchItems, debounceMs);

    // Cleanup function cancels both the timer and the API request
    return () => {
      clearTimeout(debounceRef.current);
      controller.abort();
    };
  }, [query, shouldFetch, debounceMs]);

  return { items, loading, error };
}
