// src/components/ListOfExclusionContainer.js
import React, { useMemo } from 'react';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

import { useBranches } from '../hooks/useBranches';
import useItems from '../hooks/useItems';
import ListOfExclusion from './ListOfExclusion';

export default function ListOfExclusionContainer({ filters }) {
  // Fetch from your existing hooks
  const { branches: rawBranches, loading: brLoading, error: brError } = useBranches(filters);
  const { items: rawItems,     loading: itLoading, error: itError } = useItems(filters);

  // Map API → component shape
  const branches = useMemo(() => (rawBranches || []).map(b => ({
    id: b.id ?? b.branchCode,        // fallback to code if no numeric id
    code: b.branchCode,
    name: b.branchName,
    excludedItemIds: Array.isArray(b.excludedItemIds) ? b.excludedItemIds : [], // default
  })), [rawBranches]);

  const items = useMemo(() => (rawItems || []).map(i => ({
    id: i.itemCode,
    code: i.itemCode,
    name: i.itemDescription,
  })), [rawItems]);

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

  return <ListOfExclusion branches={branches} items={items} />;
}
