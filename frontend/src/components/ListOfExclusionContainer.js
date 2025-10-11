// src/components/ListOfExclusionContainer.js
import React, { useMemo } from 'react';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

import { useBranches } from '../hooks/useBranches';
import useItems from '../hooks/useItems';
import ListOfExclusion from './ListOfExclusion';

export default function ListOfExclusionContainer({ filters, quantities, onBranchesChange }) {
  // Fetch from your existing hooks
  const { branches: rawBranches, loading: brLoading, error: brError } = useBranches(filters);
  const { items: rawItems, loading: itLoading, error: itError } = useItems(filters);

  // Map API → component shape
  const branches = useMemo(() => (rawBranches || []).map(b => ({
    id: b.id ?? b.branchCode,
    code: b.branchCode,
    name: b.branchName,
    excludedItemIds: Array.isArray(b.excludedItemIds) ? b.excludedItemIds : [],
  })), [rawBranches]);

  // Filter items to only include those with quantity > 0
  const items = useMemo(() => {
    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      return [];
    }

    // If quantities object doesn't exist or is empty, return empty array
    if (!quantities || typeof quantities !== 'object' || Object.keys(quantities).length === 0) {
      return [];
    }

    // Map and filter items
    const filteredItems = rawItems
      .map(i => {
        const itemCode = i.itemCode || '';
        const itemDescription = i.itemDescription || i.description || '';
        
        // Create the same key format as in ListOfItems
        const key = `${itemCode}|${itemDescription}`;
        const qty = quantities[key];
        
        return {
          id: itemCode,
          code: itemCode,
          name: itemDescription,
          key: key,
          quantity: qty
        };
      })
      .filter(item => {
        // Only include if quantity exists, is not empty, and is greater than 0
        const qty = item.quantity;
        return qty !== undefined && 
               qty !== null && 
               qty !== '' && 
               Number(qty) > 0;
      })
      .map(({ key, quantity, ...item }) => item); // Remove temporary fields

    return filteredItems;
  }, [rawItems, quantities]);

  if (brError || itError) {
    return <Alert severity="error">{String(brError || itError)}</Alert>;
  }

  if (brLoading || itLoading) {
    return (
      <Box sx={{ p: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
        <CircularProgress size={18} /> Loading branches & items…
      </Box>
    );
  }

  return (
    <ListOfExclusion 
      branches={branches} 
      items={items} 
      onBranchesChange={onBranchesChange}
    />
  );
}