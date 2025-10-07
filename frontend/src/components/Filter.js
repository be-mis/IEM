// src/components/Filter.js
import React, { useMemo, useState, useEffect } from 'react';
import {
  Box,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';

// ⬇️ Import your hooks that already fetch the lists
// change the path to wherever your file is (e.g., '../hooks/useFilter')
import { useChains, useCategories, useStoreClasses } from '../hooks/useFilter';

// Fixed transaction options
const TRANSACTION_OPTIONS = ['Repeat Order', 'New Item'];

export default function Filter({ onChange }) {
  // selections
  const [chain, setChain] = useState('');
  const [category, setCategory] = useState('');
  const [storeClass, setStoreClass] = useState('');
  const [transaction, setTransaction] = useState('');

  // fetched lists (each hook fetches on mount)
  const { categories,  loading: catLoading, error: catError } = useCategories();
  const { chains,      loading: chLoading,  error: chError }  = useChains();
  const { storeClasses, loading: scLoading, error: scError }  = useStoreClasses();

  const loading = chLoading || catLoading || scLoading;
  const error   = chError || catError || scError;

  // Normalize to { value, label } for rendering (with defensive fallbacks)
  const chainOptions = useMemo(() => {
    const arr = Array.isArray(chains) ? chains : [];
    return arr
      .map(c => {
        const label = (c?.chainName ?? c?.chainCode ?? '').toString().trim();
        const value = (c?.chainCode ?? c?.chainName ?? '').toString().trim();
        if (!label) return null;
        return { value, label };
      })
      .filter(Boolean)
      .sort((a, b) => (a.label || '').localeCompare(b.label || '', undefined, { sensitivity: 'base' }));
  }, [chains]);

  const categoryOptions = useMemo(() => {
    const arr = Array.isArray(categories) ? categories : [];
    return arr
      .map(c => {
        const label = (c?.category ?? c?.catCode).toString().trim();
        const value = (c?.catCode ?? c?.category ?? '').toString().trim();
        if (!label) return null;
        return { value, label };
      })
      .filter(Boolean)
      .sort((a, b) => (a.label || '').localeCompare(b.label || '', undefined, { sensitivity: 'base' }));
  }, [categories]);

  const storeClassOptions = useMemo(() => {
    const arr = Array.isArray(storeClasses) ? storeClasses : [];
    return arr
      .map(sc => {
        const label = (sc?.storeClassification ?? sc?.storeClassCode).toString().trim();
        const value = (sc?.storeClassCode ?? sc?.storeClassification ?? '').toString().trim();
        if (!label) return null;
        return { value, label };
      })
      .filter(Boolean)
      .sort((a, b) => (a.label || '').localeCompare(b.label || '', undefined, { sensitivity: 'base' }));
  }, [storeClasses]);


  // Let parent know when something changes (optional)
  useEffect(() => {
    if (typeof onChange === 'function') {
      onChange({ chain, category, storeClass, transaction });
    }
  }, [chain, category, storeClass, transaction, onChange]);

  // Handlers
  const handleChainChange = (e) => {
    setChain(e.target.value);
    setCategory('');
    setStoreClass('');
    setTransaction('');
  };
  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setStoreClass('');
    setTransaction('');
  };
  const handleStoreClassChange = (e) => {
    setStoreClass(e.target.value);
    setTransaction('');
  };
  const handleTransactionChange = (e) => setTransaction(e.target.value);

  return (
    <Box component="form" autoComplete="off" sx={{ '& > :not(style)': { width: '100%' } }}>
      <Grid container spacing={3}>
        {/* Chain */}
        <Grid item xs={12} md={3}>
          <FormControl size="small" fullWidth>
            <InputLabel id="filter-chain">Chain</InputLabel>
            <Select
              labelId="filter-chain"
              value={chain}
              label="Chain"
              onChange={handleChainChange}
              disabled={loading || !!error || chainOptions.length === 0}
            >
              {loading && <MenuItem disabled>Loading…</MenuItem>}
              {!loading && error && <MenuItem disabled>{String(error)}</MenuItem>}
              {!loading && !error && chainOptions.map(o => (
                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Category */}
        <Grid item xs={12} md={3}>
          <FormControl size="small" fullWidth>
            <InputLabel id="filter-category">Category</InputLabel>
            <Select
              labelId="filter-category"
              value={category}
              label="Category"
              onChange={handleCategoryChange}
              disabled={loading || !!error || categoryOptions.length === 0 || !chain}
            >
              {loading && <MenuItem disabled>Loading…</MenuItem>}
              {!loading && error && <MenuItem disabled>{String(error)}</MenuItem>}
              {!loading && !error && categoryOptions.map(o => (
                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Store Classification */}
        <Grid item xs={12} md={3}>
          <FormControl size="small" fullWidth>
            <InputLabel id="filter-store-class">Store Classification</InputLabel>
            <Select
              labelId="filter-store-class"
              value={storeClass}
              label="Store Classification"
              onChange={handleStoreClassChange}
              disabled={loading || !!error || storeClassOptions.length === 0 || !category}
            >
              {loading && <MenuItem disabled>Loading…</MenuItem>}
              {!loading && error && <MenuItem disabled>{String(error)}</MenuItem>}
              {!loading && !error && storeClassOptions.map(o => (
                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Transaction (constant) */}
        <Grid item xs={12} md={3}>
          <FormControl size="small" fullWidth>
            <InputLabel id="filter-transaction">Transaction Type</InputLabel>
            <Select
              labelId="filter-transaction"
              value={transaction}
              label="Transaction Type"
              onChange={handleTransactionChange}
              disabled={!storeClass}
            >
              {TRANSACTION_OPTIONS.map(tx => (
                <MenuItem key={tx} value={tx}>{tx}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );
}
