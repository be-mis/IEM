// src/components/NBFIListOfExclusionContainer.js
import React, { useMemo } from 'react';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

import { useNBFIBranches } from '../hooks/useNBFIBranches';
import useNBFIItems from '../hooks/useNBFIItems';
import NBFIListOfExclusion from './NBFIListOfExclusion';

export default function NBFIListOfExclusionContainer({ filters, quantities, onBranchesChange }) {
  // Fetch from NBFI hooks
  const { branches: rawBranches, loading: brLoading, error: brError } = useNBFIBranches(filters);
  const { items: rawItems, loading: itLoading, error: itError } = useNBFIItems(filters);

  // Map API → component shape
  // Start with empty excludedItemIds so users must manually add items (same as EPC behavior)
  const branches = useMemo(() => (rawBranches || []).map(b => ({
    id: b.id ?? b.branchCode,
    code: b.branchCode,
    name: b.branchName,
    excludedItemIds: [], // Always start empty - user must manually add items
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
        
        // Create the same key format as in NBFIListOfItems
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
    <NBFIListOfExclusion 
      sx={{overflow: 'hidden'}}
      branches={branches} 
      items={items} 
      onBranchesChange={onBranchesChange}
    />
  );
}
