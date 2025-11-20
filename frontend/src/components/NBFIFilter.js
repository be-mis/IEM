import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Box, Grid, FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material';
import { useNBFIChains, useNBFIBrands, useNBFIStoreClasses } from '../hooks/useNBFIFilter';

export default function NBFIFilter({ onChange, asForm = false, hideTransaction = false, categoryLabel = 'Brand' }) {
  const [chain, setChain] = useState('');
  const [brand, setBrand] = useState('');
  const [storeClass, setStoreClass] = useState('');
  const [transaction, setTransaction] = useState('');

  const nbfiBrands = useNBFIBrands();
  const nbfiChains = useNBFIChains();
  const nbfiStoreClasses = useNBFIStoreClasses();
  const { brands: nbfiBrandsList, loading: nbfiBrandsLoading, error: nbfiBrandsError } = nbfiBrands;
  const { chains, loading: chLoading, error: chError } = nbfiChains;
  const { storeClasses, loading: scLoading, error: scError } = nbfiStoreClasses;

  const loading = chLoading || nbfiBrandsLoading || scLoading;
  const error = chError || nbfiBrandsError || scError;

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
      .sort((a, b) => (a.label || '').localeCompare(b.label || '', undefined, { sensitivity: 'base' }));
  }, [chains]);

  const brandOptions = useMemo(() => {
    const arr = Array.isArray(nbfiBrandsList) ? nbfiBrandsList : [];
    return arr
      .map((b) => {
        const label = (b?.brand ?? b?.brandCode ?? '').toString().trim();
        if (!label) return null;
        const value = b?.brandCode ?? label;
        return { value, label };
      })
      .filter(Boolean)
      .sort((a, b) => (a.label || '').localeCompare(b.label || '', undefined, { sensitivity: 'base' }));
  }, [nbfiBrandsList]);

  const storeClassOptions = useMemo(() => {
    const arr = Array.isArray(storeClasses) ? storeClasses : [];
    return arr
      .map((sc) => {
        const label = (sc?.storeClassification ?? sc?.storeClassCode ?? '').toString().trim();
        const value = (sc?.storeClassCode ?? sc?.storeClassification ?? '').toString().trim();
        if (!label) return null;
        return { value, label };
      })
      .filter(Boolean)
      .sort((a, b) => (a.label || '').localeCompare(b.label || '', undefined, { sensitivity: 'base' }));
  }, [storeClasses]);

  // Notify parent
  useEffect(() => {
    if (typeof onChange === 'function') {
      onChange({ chain, brand, category: brand, storeClass, transaction });
    }
  }, [chain, brand, storeClass, transaction, onChange]);

  // Auto-clear invalid selections if options change underneath
  useEffect(() => {
    if (chain && !chainOptions.some((o) => o.value === chain)) {
      setChain('');
      setBrand('');
      setStoreClass('');
      setTransaction('');
    }
  }, [chain, chainOptions]);

  useEffect(() => {
    if (brand && !brandOptions.some((o) => o.value === brand)) {
      setBrand('');
      setStoreClass('');
      setTransaction('');
    }
  }, [brand, brandOptions]);

  useEffect(() => {
    if (storeClass && !storeClassOptions.some((o) => o.value === storeClass)) {
      setStoreClass('');
      setTransaction('');
    }
  }, [storeClass, storeClassOptions]);

  const handleChainChange = useCallback((e) => {
    setChain(e.target.value);
    setBrand(''); // Always clear brand when chain changes
    setStoreClass('');
    setTransaction('');
  }, []);

  const handleBrandChange = useCallback((e) => {
    setBrand(e.target.value);
    setStoreClass('');
    setTransaction('');
  }, []);

  const handleStoreClassChange = useCallback((e) => {
    setStoreClass(e.target.value);
    setTransaction('');
  }, []);

  const WrapperTag = asForm ? 'form' : 'div';

  return (
    <Box component="div" autoComplete="off" sx={{ '& > :not(style)': { width: '100%' } }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={hideTransaction ? 4 : 3}>
          <FormControl size="small" fullWidth disabled={loading || !!error || chainOptions.length === 0}>
            <InputLabel id="filter-chain">Chain</InputLabel>
            <Select
              labelId="filter-chain"
              value={chain}
              label="Chain"
              onChange={handleChainChange}
              renderValue={(v) => (v ? chainOptions.find((o) => o.value === v)?.label : '— Select Chain —')}
            >
              <MenuItem value=""><em>— Select Chain —</em></MenuItem>
              {chainOptions.map((o) => (
                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={hideTransaction ? 4 : 3}>
          <FormControl size="small" fullWidth disabled={loading || !!error || brandOptions.length === 0 || !chain}>
            <InputLabel id="filter-brand">{categoryLabel}</InputLabel>
            <Select
              labelId="filter-brand"
              value={brand}
              label={categoryLabel}
              onChange={handleBrandChange}
              renderValue={(v) => (v ? brandOptions.find((o) => o.value === v)?.label : `— Select ${categoryLabel} —`)}
            >
              <MenuItem value=""><em>{`— Select ${categoryLabel} —`}</em></MenuItem>
              {brandOptions.map((o) => (
                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={hideTransaction ? 4 : 3}>
          <FormControl size="small" fullWidth disabled={loading || !!error || storeClassOptions.length === 0 || !brand}>
            <InputLabel id="filter-store-class">Store Classification</InputLabel>
            <Select
              labelId="filter-store-class"
              value={storeClass}
              label="Store Classification"
              onChange={handleStoreClassChange}
              renderValue={(v) => (v ? storeClassOptions.find((o) => o.value === v)?.label : '— Select Store Classification —')}
            >
              <MenuItem value=""><em>— Select Store Classification —</em></MenuItem>
              {storeClassOptions.map((o) => (
                <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );
}
