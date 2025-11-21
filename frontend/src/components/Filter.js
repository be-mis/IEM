// src/components/Filter.js
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Box, Grid, FormControl, InputLabel, Select, MenuItem, Typography } from '@mui/material';
import { useChains, useCategories, useStoreClasses } from '../hooks/useFilter';
import { useNBFIChains, useNBFIBrands, useNBFIStoreClasses } from '../hooks/useNBFIFilter';

const TRANSACTION_OPTIONS = ['Repeat Order', 'New Item'];

export default function Filter({ onChange, asForm = false, hideTransaction = false, categoryLabel = 'Category', isNBFI = false }) {
  const [chain, setChain] = useState('');
  const [brand, setBrand] = useState('');
  const [storeClass, setStoreClass] = useState('');
  const [transaction, setTransaction] = useState('');

  // Call all hooks unconditionally (React rules)
  const epcCategories = useCategories();
  const epcChains = useChains();
  const epcStoreClasses = useStoreClasses();
  const nbfiBrands = useNBFIBrands();
  const nbfiChains = useNBFIChains();
  const nbfiStoreClasses = useNBFIStoreClasses();
  // Normalize EPC vs NBFI list data (EPC hook returns { categories }, NBFI returns { brands })
  const { categories: epcCategoriesList, loading: epcCategoriesLoading, error: epcCategoriesError } = epcCategories;
  const { brands: nbfiBrandsList, loading: nbfiBrandsLoading, error: nbfiBrandsError } = nbfiBrands;
  // `listItems` is the generic array used to build options: for EPC it's categories, for NBFI it's brands
  const listItems = isNBFI ? (Array.isArray(nbfiBrandsList) ? nbfiBrandsList : []) : (Array.isArray(epcCategoriesList) ? epcCategoriesList : []);
  const brandLoading = isNBFI ? nbfiBrandsLoading : epcCategoriesLoading;
  const brandError = isNBFI ? nbfiBrandsError : epcCategoriesError;
  const { chains, loading: chLoading, error: chError } = isNBFI ? nbfiChains : epcChains;
  const { storeClasses, loading: scLoading, error: scError } = isNBFI ? nbfiStoreClasses : epcStoreClasses;

  const loading = chLoading || brandLoading || scLoading;
  const error = chError || brandError || scError;










  // Debug logging
  useEffect(() => {
    if (isNBFI) {
      console.log('NBFI Filter Data:', {
        chains: chains,
        brands: nbfiBrandsList,
        storeClasses: storeClasses,
        loading: { chLoading, brandLoading, scLoading },
        errors: { chError, brandError, scError }
      });
    }
  }, [isNBFI, chains, nbfiBrandsList, storeClasses, chLoading, brandLoading, scLoading, chError, brandError, scError]);

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
    if (isNBFI) return [];
    const arr = listItems;
    return arr
      .map((c) => {
        let label = (c?.catCode ?? c?.category ?? '').toString().trim();
        if (!label) label = 'Unknown';
        const value = label.toLowerCase();
        return { value, label };
      })
      .filter(Boolean);
  }, [listItems, isNBFI]);


  const brandOptions = useMemo(() => {
    if (!isNBFI) return [];
    const arr = listItems;
    return arr
      .map((b) => {
        const label = (b?.brand ?? b?.brandCode ?? '').toString().trim();
        if (!label) return null;
        const value = b?.brandCode ?? label;
        return { value, label };
      })
      .filter(Boolean)
      .sort((a, b) => (a.label || '').localeCompare(b.label || '', undefined, { sensitivity: 'base' }));
  }, [listItems, isNBFI]);

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
      if (isNBFI) {
        // Keep backward-compatible property `category` populated with brand
        // so consumers that expect `category` (e.g., useNBFIItems) continue to work.
        // Debug: log emitted payload for easier tracing in browser devtools
        console.log('Filter -> onChange (NBFI emit):', { chain, brand, category: brand, storeClass, transaction });
        onChange({ chain, brand, category: brand, storeClass, transaction });
      } else {
        // Debug: log emitted payload for EPC flows as well
        console.log('Filter -> onChange (EPC emit):', { chain, category, storeClass, transaction });
        onChange({ chain, category, storeClass, transaction });
      }
    }
  }, [chain, brand, storeClass, transaction, onChange, isNBFI]);

  // ✅ Auto-clear invalid selections if options change underneath
  useEffect(() => {
    if (chain && !chainOptions.some((o) => o.value === chain)) {
      setChain('');
      setBrand('');
      setStoreClass('');
      setTransaction('');
    }
  }, [chain, chainOptions]);

  // For EPC, keep category state in sync (legacy)
  const [category, setCategory] = useState('');
  useEffect(() => {
    if (!isNBFI) {
      // If the selected category no longer exists in the category options,
      // clear dependent selections. Previously this checked `brandOptions`
      // which caused the category to be cleared immediately; use
      // `categoryOptions` instead.
      if (category && !categoryOptions.some((o) => o.value === category)) {
        setCategory('');
        setStoreClass('');
        setTransaction('');
      }
    }
  }, [category, categoryOptions, isNBFI]);

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
    if (isNBFI) {
      setBrand('');
    } else {
      setCategory('');
    }
    setStoreClass('');
    setTransaction('');
  }, [isNBFI]);

  const handleBrandChange = useCallback((e) => {
    setBrand(e.target.value);
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
          <FormControl size="small" fullWidth disabled={loading || !!error || chainOptions.length === 0}>
            <InputLabel id="filter-chain">Chain</InputLabel>
            <Select
              labelId="filter-chain"
              value={chain}
              label="Chain"
              onChange={handleChainChange}
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
            <Box sx={{ minHeight: 20 }}>
              {/* Loading indicator removed as per request */}
            </Box>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={hideTransaction ? 4 : 3}>
          <FormControl size="small" fullWidth disabled={loading || !!error || (isNBFI ? brandOptions.length === 0 : epcCategories.categories.length === 0)}>
            <InputLabel id="filter-brand">{categoryLabel}</InputLabel>
            <Select
              labelId="filter-brand"
              value={isNBFI ? brand : category}
              label={categoryLabel}
              onChange={isNBFI ? handleBrandChange : (e) => setCategory(e.target.value)}
              renderValue={(v) =>
                v
                  ? (isNBFI
                      ? brandOptions.find((o) => o.value === v)?.label
                      : categoryOptions.find((o) => o.value === v)?.label)
                  : `— Select ${categoryLabel} —`
              }
            >
              <PlaceholderItem text={`— Select ${categoryLabel} —`} />
              {loading && <MenuItem disabled>Loading…</MenuItem>}
              {!loading && error && <MenuItem disabled>{String(error)}</MenuItem>}
              {!loading &&
                !error &&
                (isNBFI
                  ? brandOptions.map((o) => (
                      <MenuItem key={o.value} value={o.value}>
                        {o.label}
                      </MenuItem>
                    ))
                  : categoryOptions.map((o) => (
                      <MenuItem key={o.value} value={o.value}>
                        {o.label}
                      </MenuItem>
                    )))}
            </Select>
            <Box sx={{ minHeight: 20 }}>
              {/* Loading indicator removed as per request */}
            </Box>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={hideTransaction ? 4 : 3}>
          <FormControl size="small" fullWidth disabled={loading || !!error || storeClassOptions.length === 0 || (isNBFI ? !brand : !category)}>
            <InputLabel id="filter-store-class">Store Classification</InputLabel>
            <Select
              labelId="filter-store-class"
              value={storeClass}
              label="Store Classification"
              onChange={handleStoreClassChange}
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
            <Box sx={{ minHeight: 20 }}>
              {/* Loading indicator removed as per request */}
            </Box>
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
