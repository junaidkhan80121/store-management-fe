import React from 'react';
import {
  Box, Button, Chip, FormControl, InputAdornment, InputLabel, MenuItem,
  Paper, Select, Stack, TextField, Typography,
} from '@mui/material';
import { Search } from 'lucide-react';
import type { ListFiltersState } from '../hooks/useListFilters';
import FilterDateField from './FilterDateField';

interface FilterOption {
  value: string;
  label: string;
}

interface ListFiltersBarProps {
  filters: ListFiltersState;
  searchPlaceholder?: string;
  statusOptions: FilterOption[];
  sortOptions: FilterOption[];
  showStatus?: boolean;
}

export default function ListFiltersBar({
  filters,
  searchPlaceholder = 'Search...',
  statusOptions,
  sortOptions,
  showStatus = true,
}: ListFiltersBarProps) {
  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    sortField,
    setSortField,
    sortOrder,
    setSortOrder,
    hasActiveFilters,
    clearFilters,
    resetPageOnFilterChange,
    defaultStatus,
    defaultSortField,
    defaultSortOrder,
  } = filters;

  const statusLabel = statusOptions.find((o) => o.value === statusFilter)?.label;
  const sortLabel = sortOptions.find((o) => o.value === sortField)?.label;

  const onFilterChange = (setter: (v: string) => void) => (value: string) => {
    setter(value);
    resetPageOnFilterChange();
  };

  return (
    <Paper sx={{ mb: 3, p: 2 }}>
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              resetPageOnFilterChange();
            }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={18} />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ minWidth: { xs: '100%', sm: 220 }, flexGrow: 1 }}
          />

          {showStatus && (
            <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 160 } }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => onFilterChange(setStatusFilter)(e.target.value as string)}
              >
                {statusOptions.map((opt) => (
                  <MenuItem key={opt.value || 'all'} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <FilterDateField
            label="Start Date"
            value={startDate}
            onChange={(v) => onFilterChange(setStartDate)(v)}
          />
          <FilterDateField
            label="End Date"
            value={endDate}
            onChange={(v) => onFilterChange(setEndDate)(v)}
          />

          <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 150 } }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortField}
              label="Sort By"
              onChange={(e) => onFilterChange(setSortField)(e.target.value as string)}
            >
              {sortOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 120 } }}>
            <InputLabel>Order</InputLabel>
            <Select
              value={sortOrder}
              label="Order"
              onChange={(e) => onFilterChange(setSortOrder)(e.target.value as 'asc' | 'desc')}
            >
              <MenuItem value="desc">Newest</MenuItem>
              <MenuItem value="asc">Oldest</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {hasActiveFilters && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mr: 0.5 }}>
              Active Filters:
            </Typography>
            {searchQuery && (
              <Chip size="small" label={`Search: ${searchQuery}`} onDelete={() => setSearchQuery('')} />
            )}
            {statusFilter && statusFilter !== defaultStatus && (
              <Chip
                size="small"
                label={`Status: ${statusLabel || statusFilter}`}
                onDelete={() => setStatusFilter(defaultStatus)}
              />
            )}
            {statusFilter && !defaultStatus && (
              <Chip
                size="small"
                label={`Status: ${statusLabel || statusFilter}`}
                onDelete={() => setStatusFilter('')}
              />
            )}
            {startDate && (
              <Chip size="small" label={`From: ${startDate}`} onDelete={() => setStartDate('')} />
            )}
            {endDate && (
              <Chip size="small" label={`To: ${endDate}`} onDelete={() => setEndDate('')} />
            )}
            {(sortField !== defaultSortField || sortOrder !== defaultSortOrder) && (
              <Chip
                size="small"
                label={`Sort: ${sortLabel} (${sortOrder === 'desc' ? 'Newest' : 'Oldest'})`}
                onDelete={() => {
                  setSortField(defaultSortField);
                  setSortOrder(defaultSortOrder);
                }}
              />
            )}
            <Button size="small" color="error" onClick={clearFilters}>
              Clear All
            </Button>
          </Box>
        )}
      </Stack>
    </Paper>
  );
}
