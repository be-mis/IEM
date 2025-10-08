import { useState, useEffect, useCallback, useRef } from 'react';
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

  const cancelRef = useRef(null);
  const mountedRef = useRef(true);
  const debounceRef = useRef(null);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (cancelRef.current) {
        try { cancelRef.current(); } catch (e) {}
      }
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const fetchItems = useCallback(
    async (opts = {}) => {
      const { force = false } = opts;
      if ((!chain || !storeClass || !category) && !force) {
        setItems([]);
        setError(null);
        setLoading(false);
        return;
      }

      if (cancelRef.current) {
        try { cancelRef.current(); } catch (e) {}
        cancelRef.current = null;
      }

      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          chain: String(chain || '').trim(),
          storeClass: String(storeClass || '').trim(),
          category: String(category || '').trim()
        });
        const url = `/filters/items?${params.toString()}`;

        const source = axios.CancelToken ? axios.CancelToken.source() : null;
        if (source) cancelRef.current = () => source.cancel('canceled');

        const res = await api.get(url, source ? { cancelToken: source.token } : {});
        if (!mountedRef.current) return;
        const dataItems = (res?.data?.items) || [];
        console.log(`Fetched Items from URL "${url}":`, dataItems);
        // The returned data from filters.js is stored in the 'items' state variable here.
        setItems(Array.isArray(dataItems) ? dataItems : []); 
      } catch (err) {
        if (!mountedRef.current) return;
        if (axios.isCancel && axios.isCancel(err)) {
          // canceled
        } else {
          setError(err?.response?.data?.error || err.message || 'Failed to fetch items');
          setItems([]);
        }
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    },
    [chain, storeClass, category]
  );


  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchItems();
      debounceRef.current = null;
    }, typeof debounceMs === 'number' && debounceMs > 0 ? debounceMs : 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchItems]);

  const refresh = useCallback(() => fetchItems({ force: true }), [fetchItems]);
  
  return { items, loading, error, refresh };
}