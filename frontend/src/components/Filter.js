import React, { useState } from 'react';
import {
  Box, Grid, FormControl, InputLabel, Select, MenuItem
} from '@mui/material';

export default function Filter() {
  // Independent states
  const [chain, setChain] = useState('');
  const [category, setCategory] = useState('');
  const [storeClass, setStoreClass] = useState('');
  const [transaction, setTransaction] = useState('');

  // --- Mock data: in real app, replace with fetched / dynamic options ---
  const chainOptions = ['VARIOUS CHAIN', 'SM HOMEWORLD', 'OUR HOME'];

  const categoryOptions = {
    'VARIOUS CHAIN': ['CLOCKS', 'DECOR', 'FRAMES', 'LAMPS', 'STATIONERY'],
    'SM HOMEWORLD': ['KITCHEN', 'BEDDING', 'FURNITURE'],
    'OUR HOME': ['DECOR', 'LIGHTING', 'TABLEWARE'],
  };

  const storeClassOptions = {
    CLOCKS: ['A STORES', 'B STORES', 'C STORES'],
    DECOR: ['A STORES', 'B STORES'],
    FRAMES: ['B STORES', 'C STORES'],
    LAMPS: ['A STORES', 'C STORES'],
    STATIONERY: ['C STORES'],
    KITCHEN: ['A STORES', 'B STORES'],
    BEDDING: ['A STORES'],
    FURNITURE: ['A STORES', 'B STORES'],
    LIGHTING: ['A STORES', 'B STORES'],
    TABLEWARE: ['A STORES', 'C STORES'],
  };

  const transactionOptions = {
    'A STORES': ['SALE', 'RETURN', 'TRANSFER'],
    'B STORES': ['SALE', 'RETURN'],
    'C STORES': ['SALE'],
  };

  // --- Handlers ---
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

  const handleTransactionChange = (e) => {
    setTransaction(e.target.value);
  };

  // --- Dynamic filtered options ---
  const availableCategories = chain ? categoryOptions[chain] || [] : [];
  const availableStoreClasses = category ? storeClassOptions[category] || [] : [];
  const availableTransactions = storeClass ? transactionOptions[storeClass] || [] : [];

  return (
    <Box component="form" noValidate autoComplete="off" sx={{ '& > :not(style)': { width: '100%' } }}>
      <Grid container spacing={3}>
        {/* Chain */}
        <Grid item xs={12} md={3}>
          <FormControl size="small" fullWidth required>
            <InputLabel id="filter-chain">Chain</InputLabel>
            <Select
              labelId="filter-chain"
              value={chain}
              label="Chain"
              onChange={handleChainChange}
            >
              {chainOptions.map((c) => (
                <MenuItem key={c} value={c}>{c}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Category */}
        <Grid item xs={12} md={3}>
          <FormControl size="small" fullWidth required disabled={!chain}>
            <InputLabel id="filter-category">Category</InputLabel>
            <Select
              labelId="filter-category"
              value={category}
              label="Category"
              onChange={handleCategoryChange}
            >
              {availableCategories.map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Store Classification */}
        <Grid item xs={12} md={3}>
          <FormControl size="small" fullWidth required disabled={!category}>
            <InputLabel id="filter-store-class">Store Classification</InputLabel>
            <Select
              labelId="filter-store-class"
              value={storeClass}
              label="Store Classification"
              onChange={handleStoreClassChange}
            >
              {availableStoreClasses.map((sc) => (
                <MenuItem key={sc} value={sc}>{sc}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Transaction */}
        <Grid item xs={12} md={3}>
          <FormControl size="small" fullWidth required disabled={!storeClass}>
            <InputLabel id="filter-transaction">Transaction Type</InputLabel>
            <Select
              labelId="filter-transaction"
              value={transaction}
              label="Transaction Type"
              onChange={handleTransactionChange}
            >
              {availableTransactions.map((tx) => (
                <MenuItem key={tx} value={tx}>{tx}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
    </Box>
  );
}
