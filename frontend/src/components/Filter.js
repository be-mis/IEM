// src/components/Filter.js
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Box, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useChains, useCategories, useStoreClasses } from '../hooks/useFilter';

const TRANSACTION_OPTIONS = ['Repeat Order', 'New Item'];

export default function Filter({ onChange, asForm = false, hideTransaction = false }) {
  const [chain, setChain] = useState('');
  const [category, setCategory] = useState('');
  const [storeClass, setStoreClass] = useState('');
  const [transaction, setTransaction] = useState('');

  const { categories, loading: catLoading, error: catError } = useCategories();
  const { chains, loading: chLoading, error: chError } = useChains();
  const { storeClasses, loading: scLoading, error: scError } = useStoreClasses();

  const loading = chLoading || catLoading || scLoading;
  const error = chError || catError || scError;

  const chainOptions = useMemo(() => {
    const arr = Array.isArray(chains) ? chains : [];
    return arr
      .map((c) => {
        const label = (c?.chainName ?? c?.chainCode ?? '').toString().trim();
        const value = (c?.chainCode ?? c?.chainName ?? '').toString().trim();
        if (!label) return null;
        return { value, label };
      })
      .filter(Boolean)
      .sort((a, b) =>
        (a.label || '').localeCompare(a.label ? b.label : '', undefined, { sensitivity: 'base' })
      );
  }, [chains]);

  const categoryOptions = useMemo(() => {
    const arr = Array.isArray(categories) ? categories : [];
    return arr
      .map((c) => {
        const label = (c?.category ?? c?.catCode ?? '').toString().trim();
        if (!label) return null;
        // value must be lowercase category name (e.g., 'lamps', 'decors', ...)
        const value = label.toLowerCase();
        return { value, label };
      })
      .filter(Boolean)
      .sort((a, b) => (a.label || '').localeCompare(b.label || '', undefined, { sensitivity: 'base' }));
  }, [categories]);

  const storeClassOptions = useMemo(() => {
    const arr = Array.isArray(storeClasses) ? storeClasses : [];
    return arr
      .map((sc) => {
        const label = (sc?.storeClassification ?? sc?.storeClassCode ?? '').toString().trim(); // ✅ safe default
        const value = (sc?.storeClassCode ?? sc?.storeClassification ?? '').toString().trim();
        if (!label) return null;
        return { value, label };
      })
      .filter(Boolean)
      .sort((a, b) =>
        (a.label || '').localeCompare(b.label || '', undefined, { sensitivity: 'base' })
      );
  }, [storeClasses]);

  // Notify parent
  useEffect(() => {
    if (typeof onChange === 'function') {
      onChange({ chain, category, storeClass, transaction });
    }
  }, [chain, category, storeClass, transaction, onChange]);

  // ✅ Auto-clear invalid selections if options change underneath
  useEffect(() => {
    if (chain && !chainOptions.some((o) => o.value === chain)) {
      setChain('');
      setCategory('');
      setStoreClass('');
      setTransaction('');
    }
  }, [chain, chainOptions]);

  useEffect(() => {
    if (category && !categoryOptions.some((o) => o.value === category)) {
      setCategory('');
      setStoreClass('');
      setTransaction('');
    }
  }, [category, categoryOptions]);

  useEffect(() => {
    if (storeClass && !storeClassOptions.some((o) => o.value === storeClass)) {
      setStoreClass('');
      setTransaction('');
    }
  }, [storeClass, storeClassOptions]);

  const handleChainChange = useCallback((e) => {
    setChain(e.target.value);
    setCategory('');
    setStoreClass('');
    setTransaction('');
  }, []);

  const handleCategoryChange = useCallback((e) => {
    setCategory(e.target.value);
    setStoreClass('');
    setTransaction('');
  }, []);

  const handleStoreClassChange = useCallback((e) => {
    setStoreClass(e.target.value);
    setTransaction('');
  }, []);

  const handleTransactionChange = useCallback(
    (e) => {
      const nextTx = e.target.value;
      setTransaction(nextTx);

      const labelFor = (options, value) =>
        options.find((o) => o.value === value)?.label ?? value ?? '';

      const chainLabel = labelFor(chainOptions, chain) || '(none)';
      const categoryLabel = labelFor(categoryOptions, category) || '(none)';
      const storeClassLabel = labelFor(storeClassOptions, storeClass) || '(none)';

      // console.log(
      //   '[FILTER SELECTION]',
      //   '\n  Chain:            ',
      //   chain,
      //   '→',
      //   chainLabel,
      //   '\n  Category:         ',
      //   category,
      //   '→',
      //   categoryLabel,
      //   '\n  Store Classification:',
      //   storeClass,
      //   '→',
      //   storeClassLabel,
      //   '\n  Transaction:      ',
      //   nextTx
      // );
    },
    [chain, category, storeClass, chainOptions, categoryOptions, storeClassOptions]
  );

  // Small helper for placeholders
  const PlaceholderItem = ({ text }) => (
    <MenuItem value="" disabled>
      {text}
    </MenuItem>
  );

  const WrapperTag = asForm ? 'form' : 'div';

  return (
    <Box component="div" autoComplete="off" sx={{ '& > :not(style)': { width: '100%' } }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={hideTransaction ? 4 : 3}>
          <FormControl size="small" fullWidth>
            <InputLabel id="filter-chain">Chain</InputLabel>
            <Select
              labelId="filter-chain"
              value={chain}
              label="Chain"
              onChange={handleChainChange}
              disabled={loading || !!error || chainOptions.length === 0}
              renderValue={(v) => (v ? chainOptions.find((o) => o.value === v)?.label : '— Select Chain —')}
            >
              <PlaceholderItem text="— Select Chain —" />
              {loading && <MenuItem disabled>Loading…</MenuItem>}
              {!loading && error && <MenuItem disabled>{String(error)}</MenuItem>}
              {!loading &&
                !error &&
                chainOptions.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={hideTransaction ? 4 : 3}>
          <FormControl size="small" fullWidth>
            <InputLabel id="filter-category">Category</InputLabel>
            <Select
              labelId="filter-category"
              value={category}
              label="Category"
              onChange={handleCategoryChange}
              disabled={loading || !!error || categoryOptions.length === 0 || !chain}
              renderValue={(v) =>
                v ? categoryOptions.find((o) => o.value === v)?.label : '— Select Category —'
              }
            >
              <PlaceholderItem text="— Select Category —" />
              {loading && <MenuItem disabled>Loading…</MenuItem>}
              {!loading && error && <MenuItem disabled>{String(error)}</MenuItem>}
              {!loading &&
                !error &&
                categoryOptions.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={hideTransaction ? 4 : 3}>
          <FormControl size="small" fullWidth>
            <InputLabel id="filter-store-class">Store Classification</InputLabel>
            <Select
              labelId="filter-store-class"
              value={storeClass}
              label="Store Classification"
              onChange={handleStoreClassChange}
              disabled={loading || !!error || storeClassOptions.length === 0 || !category}
              renderValue={(v) =>
                v ? storeClassOptions.find((o) => o.value === v)?.label : '— Select Store Class —'
              }
            >
              <PlaceholderItem text="— Select Store Class —" />
              {loading && <MenuItem disabled>Loading…</MenuItem>}
              {!loading && error && <MenuItem disabled>{String(error)}</MenuItem>}
              {!loading &&
                !error &&
                storeClassOptions.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </Grid>

        {!hideTransaction && (
          <Grid item xs={12} md={3}>
            <FormControl size="small" fullWidth>
              <InputLabel id="filter-transaction">Transaction Type</InputLabel>
              <Select
                labelId="filter-transaction"
                value={transaction}
                label="Transaction Type"
                onChange={handleTransactionChange}
                disabled={!storeClass}
                renderValue={(v) => (v ? v : '— Select Transaction —')}
              >
                <PlaceholderItem text="— Select Transaction —" />
                {TRANSACTION_OPTIONS.map((tx) => (
                  <MenuItem key={tx} value={tx}>
                    {tx}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
