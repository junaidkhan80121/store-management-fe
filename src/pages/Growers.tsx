import React, { useState, useEffect } from 'react';
import { 
  Typography, Box, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  MenuItem, Select, FormControl, InputLabel, Chip, InputAdornment, Stack, TablePagination, TableSortLabel
} from '@mui/material';
import { Plus, Search, Trash2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { type RootState } from '../store/store';
import { useAppToast } from '../hooks/useAppToast';
import { pageContainerSx, pageHeaderSx, pageTitleSx } from '../constants/responsive';
import FilterDateField from '../components/FilterDateField';

export default function Growers() {
  const [growers, setGrowers] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [newGrower, setNewGrower] = useState({ name: '', contact_number: '', email: '', address: '', group_id: '', lifecycle_status: 'ACTIVE' });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [lifecycleStatus, setLifecycleStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const token = useSelector((state: RootState) => state.auth.token);
  const { showToast, Toast } = useAppToast();

  const fetchGrowers = async () => {
    if (!token) return;
    try {
      const params = new URLSearchParams({
        skip: (page * rowsPerPage).toString(),
        limit: rowsPerPage.toString(),
        sort_by: sortField,
        sort_order: sortOrder
      });
      if (searchQuery) params.append('search', searchQuery);
      if (selectedGroupId) params.append('group_id', selectedGroupId);
      if (lifecycleStatus) params.append('lifecycle_status', lifecycleStatus);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/growers?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store'
      });
      if (response.ok) {
        const data = await response.json();
        setGrowers(data.items || []);
        setTotalCount(data.total || 0);
      }
    } catch (error) {
      console.error("Failed to fetch growers", error);
    }
  };

  const fetchGroups = async () => {
    if (!token) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/grower-groups?limit=1000`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setGroups(data.items || []);
      }
    } catch (error) {
      console.error("Failed to fetch groups", error);
    }
  };

  useEffect(() => {
    fetchGrowers();
  }, [token, page, rowsPerPage, sortField, sortOrder]);

  useEffect(() => {
    fetchGroups();
  }, [token]);

  const handleFilterChange = () => {
    setPage(0);
    fetchGrowers();
  };

  useEffect(() => {
    if (token) handleFilterChange();
  }, [searchQuery, selectedGroupId, lifecycleStatus, startDate, endDate]);

  const handleAddGrower = async () => {
    try {
      const payload = {
        ...newGrower,
        group_id: newGrower.group_id ? parseInt(newGrower.group_id) : null
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/growers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        setOpen(false);
        setNewGrower({ name: '', contact_number: '', email: '', address: '', group_id: '', lifecycle_status: 'ACTIVE' });
        fetchGrowers();
        showToast('Grower created successfully');
      } else {
        const err = await response.json().catch(() => ({}));
        showToast(err.detail || 'Failed to add grower', 'error');
      }
    } catch (error) {
      console.error(error);
      showToast('Failed to add grower', 'error');
    }
  };

  const getGroupName = (groupId: number | null) => {
    if (!groupId) return '-';
    const group = groups.find(g => g.id === groupId);
    return group ? group.name : 'Unknown';
  };

  const handleRequestSort = (property: string) => {
    const isAsc = sortField === property && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortField(property);
  };

  const handleDeleteGrower = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/growers/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || 'Failed to delete grower');
      }
      setDeleteTarget(null);
      fetchGrowers();
      showToast(`Grower "${deleteTarget.name}" deleted`);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Failed to delete grower', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box sx={pageContainerSx}>
      <Box sx={pageHeaderSx}>
        <Typography sx={pageTitleSx}>Individual Growers</Typography>
        <Button 
          variant="contained" 
          startIcon={<Plus size={20} />}
          onClick={() => setOpen(true)}
        >
          New Grower
        </Button>
      </Box>

      <Paper sx={{ mb: 3, p: 2 }}>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField 
              size="small" 
              placeholder="Search growers..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search size={18} /></InputAdornment> } }}
              sx={{ minWidth: 200, flexGrow: 1 }}
            />
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Group</InputLabel>
              <Select value={selectedGroupId} label="Group" onChange={(e) => setSelectedGroupId(e.target.value)}>
                <MenuItem value="">All Groups</MenuItem>
                {groups.map(g => <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>)}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Lifecycle</InputLabel>
              <Select value={lifecycleStatus} label="Lifecycle" onChange={(e) => setLifecycleStatus(e.target.value)}>
                <MenuItem value="">All</MenuItem>
                <MenuItem value="ACTIVE">Active</MenuItem>
                <MenuItem value="INACTIVE">Inactive</MenuItem>
                <MenuItem value="SUSPENDED">Suspended</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
              </Select>
            </FormControl>
            <FilterDateField label="Start Date" value={startDate} onChange={setStartDate} />
            <FilterDateField label="End Date" value={endDate} onChange={setEndDate} />
          </Box>
          
          {(searchQuery || selectedGroupId || lifecycleStatus || startDate || endDate) && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>Active Filters:</Typography>
              {searchQuery && <Chip size="small" label={`Search: ${searchQuery}`} onDelete={() => setSearchQuery('')} />}
              {lifecycleStatus && <Chip size="small" label={`Status: ${lifecycleStatus}`} onDelete={() => setLifecycleStatus('')} />}
              {selectedGroupId && <Chip size="small" label={`Group: ${getGroupName(parseInt(selectedGroupId))}`} onDelete={() => setSelectedGroupId('')} />}
              {startDate && <Chip size="small" label={`From: ${startDate}`} onDelete={() => setStartDate('')} />}
              {endDate && <Chip size="small" label={`To: ${endDate}`} onDelete={() => setEndDate('')} />}
              <Button size="small" color="error" onClick={() => {
                setSearchQuery(''); setSelectedGroupId(''); setLifecycleStatus(''); setStartDate(''); setEndDate('');
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
                  <TableSortLabel active={sortField === 'name'} direction={sortField === 'name' ? sortOrder : 'asc'} onClick={() => handleRequestSort('name')}>
                    Name
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel active={sortField === 'group_id'} direction={sortField === 'group_id' ? sortOrder : 'asc'} onClick={() => handleRequestSort('group_id')}>
                    Grower Group
                  </TableSortLabel>
                </TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Lifecycle</TableCell>
                <TableCell>Address</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {growers.map((grower) => (
                <TableRow key={grower.id} hover>
                  <TableCell>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{grower.name}</Typography>
                    <Typography variant="body2" color="text.secondary">ID: {grower.id}</Typography>
                  </TableCell>
                  <TableCell>{getGroupName(grower.group_id)}</TableCell>
                  <TableCell>{grower.contact_number || '-'}</TableCell>
                  <TableCell>{grower.email || '-'}</TableCell>
                  <TableCell>
                    <Chip label={grower.lifecycle_status || 'ACTIVE'} size="small"
                      color={grower.lifecycle_status === 'ACTIVE' ? 'success' : grower.lifecycle_status === 'SUSPENDED' ? 'error' : 'default'} />
                  </TableCell>
                  <TableCell>{grower.address || '-'}</TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      startIcon={<Trash2 size={14} />}
                      onClick={() => setDeleteTarget({ id: grower.id, name: grower.name })}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {growers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      {totalCount === 0 && !searchQuery && !selectedGroupId && !startDate && !endDate ? 'No growers found.' : 'No growers match your filters.'}
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

      {/* Add Grower Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Grower</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Full Name"
            fullWidth
            variant="outlined"
            value={newGrower.name}
            onChange={(e) => setNewGrower({...newGrower, name: e.target.value})}
            sx={{ mb: 2, mt: 1 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Grower Group</InputLabel>
            <Select
              value={newGrower.group_id}
              label="Grower Group"
              onChange={(e) => setNewGrower({...newGrower, group_id: e.target.value})}
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {groups.map((group) => (
                <MenuItem key={group.id} value={group.id}>{group.name}</MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Lifecycle Status</InputLabel>
            <Select value={newGrower.lifecycle_status} label="Lifecycle Status"
              onChange={(e) => setNewGrower({...newGrower, lifecycle_status: e.target.value})}>
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="INACTIVE">Inactive</MenuItem>
              <MenuItem value="SUSPENDED">Suspended</MenuItem>
              <MenuItem value="PENDING">Pending</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Contact Number"
            fullWidth
            variant="outlined"
            value={newGrower.contact_number}
            onChange={(e) => setNewGrower({...newGrower, contact_number: e.target.value})}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            variant="outlined"
            value={newGrower.email}
            onChange={(e) => setNewGrower({...newGrower, email: e.target.value})}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Address"
            fullWidth
            multiline
            rows={2}
            variant="outlined"
            value={newGrower.address}
            onChange={(e) => setNewGrower({...newGrower, address: e.target.value})}
            sx={{ mb: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleAddGrower} variant="contained" disabled={!newGrower.name}>Create Grower</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!deleteTarget} onClose={() => !deleting && setDeleteTarget(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete Grower</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Growers linked to inbound transactions may fail to delete until those records are removed.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setDeleteTarget(null)} color="inherit" disabled={deleting}>Cancel</Button>
          <Button onClick={handleDeleteGrower} variant="contained" color="error" disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Toast />
    </Box>
  );
}
