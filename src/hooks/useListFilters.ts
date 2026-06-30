import { useCallback, useMemo, useState } from 'react';

export type SortOrder = 'asc' | 'desc';

export interface ListFiltersConfig {
  defaultStatus?: string;
  defaultSortField?: string;
  defaultSortOrder?: SortOrder;
}

export function useListFilters(config: ListFiltersConfig = {}) {
  const {
    defaultStatus = '',
    defaultSortField = 'created_at',
    defaultSortOrder = 'desc',
  } = config;

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState(defaultStatus);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortField, setSortField] = useState(defaultSortField);
  const [sortOrder, setSortOrder] = useState<SortOrder>(defaultSortOrder);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const appendToParams = useCallback(
    (params: URLSearchParams) => {
      params.set('skip', (page * rowsPerPage).toString());
      params.set('limit', rowsPerPage.toString());
      params.set('sort_by', sortField);
      params.set('sort_order', sortOrder);
      if (searchQuery) params.set('search', searchQuery);
      if (statusFilter) params.set('status', statusFilter);
      if (startDate) params.set('start_date', startDate);
      if (endDate) params.set('end_date', endDate);
    },
    [page, rowsPerPage, sortField, sortOrder, searchQuery, statusFilter, startDate, endDate]
  );

  const hasActiveFilters = Boolean(
    searchQuery ||
    (statusFilter && statusFilter !== defaultStatus) ||
    startDate || endDate ||
    sortField !== defaultSortField || sortOrder !== defaultSortOrder
  );

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setStatusFilter(defaultStatus);
    setStartDate('');
    setEndDate('');
    setSortField(defaultSortField);
    setSortOrder(defaultSortOrder);
    setPage(0);
  }, [defaultStatus, defaultSortField, defaultSortOrder]);

  const resetPageOnFilterChange = useCallback(() => setPage(0), []);

  const filterKey = useMemo(
    () => JSON.stringify({ searchQuery, statusFilter, startDate, endDate, sortField, sortOrder }),
    [searchQuery, statusFilter, startDate, endDate, sortField, sortOrder]
  );

  return {
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
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    appendToParams,
    hasActiveFilters,
    clearFilters,
    resetPageOnFilterChange,
    filterKey,
    defaultStatus,
    defaultSortField,
    defaultSortOrder,
  };
}

export type ListFiltersState = ReturnType<typeof useListFilters>;
