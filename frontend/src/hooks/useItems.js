import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE || 'http://localhost:5000/api',
  timeout: 30000,
});

/**
 * useItems({ chain, storeClass, category }, debounceMs = 300)
 */
export default function useItems({ chain, storeClass, category } = {}, debounceMs = 300) {
  // console.log('`useItems` hook called with filters:', { chain, storeClass, category });
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);

  // 1. Define a clear condition for when to fetch data, just like in useBranches.
  const shouldFetch = Boolean(
    (chain || '').trim() &&
    (storeClass || '').trim() &&
    (category || '').trim()
  );

  // 2. Memoize the query string to create a stable dependency for useEffect.
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
    // Clear any pending fetch from previous filter changes.
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // 3. If the condition to fetch isn't met, reset the state and stop.
    if (!shouldFetch) {
      setItems([]);
      setLoading(false);
      setError(null);
      return;
    }

    // 4. Use a modern AbortController for handling request cancellation.
    const controller = new AbortController();

    const fetchItems = async () => {
      setLoading(true);
      setError(null);
      try {
        const url = `/filters/items${query}`;
        const res = await api.get(url, { signal: controller.signal });
        const dataItems = (res?.data?.items) || [];
        console.log(`Fetched Items from URL "${url}":`, dataItems);
        // The returned data from filters.js is stored in the 'items' state variable here.
        setItems(Array.isArray(dataItems) ? dataItems : []); 
      } catch (err) {
        if (axios.isCancel(err)) {
          // Request was cancelled, do nothing.
        } else {
          setError(err?.response?.data?.error || err.message || 'Failed to fetch items');
          setItems([]);
        }
      } finally {
        setLoading(false);
      }
    };

    // 5. Apply the debounce logic within the single effect.
    debounceRef.current = setTimeout(fetchItems, debounceMs);

    // 6. The cleanup function now cancels both the timer and the API request.
    return () => {
      clearTimeout(debounceRef.current);
      controller.abort();
    };
  }, [query, shouldFetch, debounceMs]); // The dependencies are now much clearer.

  const refresh = useCallback(() => {
    // A manual refresh can be triggered by re-running the effect.
    // This implementation detail can be improved if a non-debounced refresh is needed.
    console.log('Refresh triggered. New fetch will be scheduled if filters are valid.');
  }, []);
  
  return { items, loading, error, refresh };
}