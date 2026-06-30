import React, { useState, useEffect } from 'react';
import { 
  Typography, Box, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Chip, InputAdornment, Stack, TablePagination, TableSortLabel
} from '@mui/material';
import { Plus, Search, X } from 'lucide-react';
import { useSelector } from 'react-redux';
import { type RootState } from '../store/store';
import { useAppToast } from '../hooks/useAppToast';
import { pageContainerSx, pageHeaderSx, pageTitleSx } from '../constants/responsive';
import FilterDateField from '../components/FilterDateField';

export default function GrowerGroups() {
  const [groups, setGroups] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '' });
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const token = useSelector((state: RootState) => state.auth.token);
  const { showToast, Toast } = useAppToast();

  const fetchGroups = async () => {
    if (!token) return;
    try {
      const params = new URLSearchParams({
        skip: (page * rowsPerPage).toString(),
        limit: rowsPerPage.toString(),
        sort_by: sortField,
        sort_order: sortOrder
      });
      if (searchQuery) params.append('search', searchQuery);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/grower-groups?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store'
      });
      if (response.ok) {
        const data = await response.json();
        setGroups(data.items || []);
        setTotalCount(data.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch grower groups", error);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, [token, page, rowsPerPage, sortField, sortOrder]);

  const handleFilterChange = () => {
    setPage(0);
    fetchGroups();
  };

  useEffect(() => {
    if (token) handleFilterChange();
  }, [searchQuery, startDate, endDate]);

  const handleAddGroup = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/grower-groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newGroup)
      });
      if (response.ok) {
        setOpen(false);
        setNewGroup({ name: '', description: '' });
        fetchGroups();
        showToast('Grower group created successfully');
      } else {
        const err = await response.json().catch(() => ({}));
        showToast(err.detail || 'Failed to add group (name might already exist)', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('Failed to add grower group', 'error');
    }
  };

  const handleRequestSort = (property: string) => {
    const isAsc = sortField === property && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortField(property);
  };

  return (
    <Box sx={pageContainerSx}>
      <Box sx={pageHeaderSx}>
        <Typography sx={pageTitleSx}>Grower Groups</Typography>
        <Button 
          variant="contained" 
          startIcon={<Plus size={20} />}
          onClick={() => setOpen(true)}
        >
          New Group
        </Button>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField 
              size="small" 
              placeholder="Search groups..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search size={18} /></InputAdornment> } }}
              sx={{ minWidth: 200, flexGrow: 1 }}
            />
            <FilterDateField label="Start Date" value={startDate} onChange={setStartDate} />
            <FilterDateField label="End Date" value={endDate} onChange={setEndDate} />
          </Box>
          
          {(searchQuery || startDate || endDate) && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>Active Filters:</Typography>
              {searchQuery && <Chip size="small" label={`Search: ${searchQuery}`} onDelete={() => setSearchQuery('')} />}
              {startDate && <Chip size="small" label={`From: ${startDate}`} onDelete={() => setStartDate('')} />}
              {endDate && <Chip size="small" label={`To: ${endDate}`} onDelete={() => setEndDate('')} />}
              <Button size="small" color="error" onClick={() => {
                setSearchQuery(''); setStartDate(''); setEndDate('');
              }}>Clear All</Button>
            </Box>
          )}
        </Stack>
      </Paper>

      <Paper sx={{ overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel active={sortField === 'id'} direction={sortField === 'id' ? sortOrder : 'asc'} onClick={() => handleRequestSort('id')}>
                    ID
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel active={sortField === 'name'} direction={sortField === 'name' ? sortOrder : 'asc'} onClick={() => handleRequestSort('name')}>
                    Group Name
                  </TableSortLabel>
                </TableCell>
                <TableCell>Description</TableCell>
                <TableCell>
                  <TableSortLabel active={sortField === 'created_at'} direction={sortField === 'created_at' ? sortOrder : 'asc'} onClick={() => handleRequestSort('created_at')}>
                    Created At
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {groups.map((group) => (
                <TableRow key={group.id} hover>
                  <TableCell>{group.id}</TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{group.name}</Typography>
                  </TableCell>
                  <TableCell color="text.secondary">{group.description || '-'}</TableCell>
                  <TableCell>{new Date(group.created_at).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
              {groups.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      {totalCount === 0 && !searchQuery && !startDate && !endDate ? 'No grower groups found.' : 'No grower groups match your filters.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* Add Group Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Grower Group</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Group Name (e.g., King Fruits Company)"
            fullWidth
            variant="outlined"
            value={newGroup.name}
            onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={newGroup.description}
            onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
            sx={{ mb: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleAddGroup} variant="contained" disabled={!newGroup.name}>Create Group</Button>
        </DialogActions>
      </Dialog>
      <Toast />
    </Box>
  );
}
