import React, { useState, useEffect } from 'react';
import { 
  Typography, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, LinearProgress, Box, Chip,
  Stack, Button, InputAdornment, TextField, Dialog, DialogTitle, DialogContent, DialogActions,
  Menu, MenuItem, FormControl, InputLabel, Select, TablePagination, TableSortLabel
} from '@mui/material';
import { Search, Plus, Edit2 } from 'lucide-react';
import { useSelector } from 'react-redux';
import { type RootState } from '../store/store';
import ChamberVisualizer from '../components/ChamberVisualizer';
import FloorPlanView from '../components/FloorPlanView';
import { useAppToast } from '../hooks/useAppToast';
import { pageContainerSx, pageHeaderSx, pageTitleSx } from '../constants/responsive';
import FilterDateField from '../components/FilterDateField';

export default function Capacity() {
  const [chambers, setChambers] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingChamber, setEditingChamber] = useState<any>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | number | null>(null);
  const [newChamber, setNewChamber] = useState({ name: '', total_capacity: '', status: 'Active', capacity_type: 'Weight (kg)', temperature_c: '-2', zone: '', row_count: '10', column_count: '10', level_count: '3' });
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [sortField, setSortField] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  const token = useSelector((state: RootState) => state.auth.token);
  const { showToast, Toast } = useAppToast();

  const fetchChambers = async () => {
    if (!token) return;
    try {
      const params = new URLSearchParams({
        skip: (page * rowsPerPage).toString(),
        limit: rowsPerPage.toString(),
        sort_by: sortField,
        sort_order: sortOrder
      });
      if (searchQuery) params.append('search', searchQuery);
      if (statusFilter && statusFilter !== 'All') params.append('status', statusFilter);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/chambers?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store'
      });
      if (response.ok) {
        const data = await response.json();
        setChambers(data.items || []);
        setTotalCount(data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch chambers', error);
    }
  };

  useEffect(() => {
    fetchChambers();
  }, [token, page, rowsPerPage, sortField, sortOrder]);

  const handleFilterChange = () => {
    setPage(0);
    fetchChambers();
  };

  // We can also trigger fetch on filter change
  useEffect(() => {
    if (token) {
      handleFilterChange();
    }
  }, [searchQuery, statusFilter, startDate, endDate]);

  const handleAdd = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/chambers`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newChamber.name,
          total_capacity: parseInt(newChamber.total_capacity) || 0,
          used_capacity: 0,
          status: newChamber.status,
          capacity_type: newChamber.capacity_type,
          temperature_c: parseFloat(newChamber.temperature_c) || -2,
          zone: newChamber.zone || null,
          row_count: parseInt(newChamber.row_count) || 10,
          column_count: parseInt(newChamber.column_count) || 10,
          level_count: parseInt(newChamber.level_count) || 3,
        })
      });
      if (!response.ok) throw new Error('Failed to create chamber');
      setOpen(false);
      setNewChamber({ name: '', total_capacity: '', status: 'Active', capacity_type: 'Weight (kg)', temperature_c: '-2', zone: '', row_count: '10', column_count: '10', level_count: '3' });
      showToast('Chamber created successfully');
      fetchChambers();
    } catch (error) {
      console.error(error);
      showToast('Failed to create chamber', 'error');
    }
  };

  const handleEditSave = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/chambers/${editingChamber.id}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          used_capacity: parseInt(editingChamber.used_capacity) || 0,
          status: editingChamber.status,
          temperature_c: parseFloat(editingChamber.temperature_c) || -2,
          current_temperature_c: editingChamber.current_temperature_c !== '' && editingChamber.current_temperature_c != null
            ? parseFloat(editingChamber.current_temperature_c)
            : null,
          zone: editingChamber.zone || null,
        })
      });
      if (!response.ok) throw new Error('Failed to update chamber');
      setEditOpen(false);
      setEditingChamber(null);
      showToast('Chamber updated successfully');
      fetchChambers();
    } catch (error) {
      console.error(error);
      showToast('Failed to update chamber', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      const id = deleteConfirmId;
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/chambers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error('Failed to delete chamber');
      }
      setDeleteConfirmId(null);
      setEditOpen(false);
      setEditingChamber(null);
      showToast('Chamber deleted successfully');
      fetchChambers();
    } catch (error) {
      console.error(error);
      showToast('Failed to delete chamber', 'error');
    }
  };

  const handleRequestSort = (property: string) => {
    const isAsc = sortField === property && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortField(property);
  };

  return (
    <Box sx={pageContainerSx}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 5, width: '100%' }}>
        <Typography variant="h4" sx={{ fontWeight: '700', flexGrow: 1 }}>
          Chamber Capacity
        </Typography>
        <Button variant="contained" startIcon={<Plus size={20} />} onClick={() => setOpen(true)}>New Chamber</Button>
      </Box>

      <Paper sx={{ mb: 3, p: 2, elevation: 0 }}>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField 
              size="small" 
              placeholder="Search chambers..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search size={18} /></InputAdornment> } }}
              sx={{ minWidth: 200, flexGrow: 1 }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value as string)}>
                <MenuItem value="All">All Statuses</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Warning">Warning</MenuItem>
                <MenuItem value="Maintenance">Maintenance</MenuItem>
              </Select>
            </FormControl>
            <FilterDateField label="Start Date" value={startDate} onChange={setStartDate} />
            <FilterDateField label="End Date" value={endDate} onChange={setEndDate} />
          </Box>
          
          {(searchQuery || statusFilter !== 'All' || startDate || endDate) && (
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>Active Filters:</Typography>
              {searchQuery && <Chip size="small" label={`Search: ${searchQuery}`} onDelete={() => setSearchQuery('')} />}
              {statusFilter !== 'All' && <Chip size="small" label={`Status: ${statusFilter}`} onDelete={() => setStatusFilter('All')} />}
              {startDate && <Chip size="small" label={`From: ${startDate}`} onDelete={() => setStartDate('')} />}
              {endDate && <Chip size="small" label={`To: ${endDate}`} onDelete={() => setEndDate('')} />}
              <Button size="small" color="error" onClick={() => {
                setSearchQuery(''); setStatusFilter('All'); setStartDate(''); setEndDate('');
              }}>Clear All</Button>
            </Box>
          )}
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ overflow: 'hidden' }}>
        <TableContainer>
          <Table sx={{ minWidth: 650 }} aria-label="capacity table">
            <TableHead sx={{ bgcolor: 'background.default' }}>
              <TableRow>
                <TableCell>
                  <TableSortLabel active={sortField === 'id'} direction={sortField === 'id' ? sortOrder : 'asc'} onClick={() => handleRequestSort('id')}>
                    <Typography variant="overline" sx={{ fontWeight: '700' }}>Chamber ID</Typography>
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel active={sortField === 'name'} direction={sortField === 'name' ? sortOrder : 'asc'} onClick={() => handleRequestSort('name')}>
                    <Typography variant="overline" sx={{ fontWeight: '700' }}>Name</Typography>
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel active={sortField === 'status'} direction={sortField === 'status' ? sortOrder : 'asc'} onClick={() => handleRequestSort('status')}>
                    <Typography variant="overline" sx={{ fontWeight: '700' }}>Status</Typography>
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <Typography variant="overline" sx={{ fontWeight: '700' }}>Target Temp</Typography>
                </TableCell>
                <TableCell sx={{ minWidth: 250 }}>
                  <TableSortLabel active={sortField === 'used_capacity'} direction={sortField === 'used_capacity' ? sortOrder : 'asc'} onClick={() => handleRequestSort('used_capacity')}>
                    <Typography variant="overline" sx={{ fontWeight: '700' }}>Capacity Usage</Typography>
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel active={sortField === 'total_capacity'} direction={sortField === 'total_capacity' ? sortOrder : 'asc'} onClick={() => handleRequestSort('total_capacity')}>
                    <Typography variant="overline" sx={{ fontWeight: '700' }}>Total Capacity</Typography>
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right"><Typography variant="overline" sx={{ fontWeight: '700' }}>Actions</Typography></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {chambers.map((row) => {
                const usagePercent = row.total_capacity > 0 ? (row.used_capacity / row.total_capacity) * 100 : 0;
                let progressColor: 'primary' | 'success' | 'warning' | 'error' = 'primary';
                
                if (usagePercent > 90) progressColor = 'error';
                else if (usagePercent > 75) progressColor = 'warning';

                let chipColor = '#e0f2f1';
                let chipTextColor = '#006064';
                if (row.status === 'Warning') {
                  chipColor = '#fff3e0';
                  chipTextColor = '#e65100';
                } else if (row.status === 'Maintenance') {
                  chipColor = '#ffdad6';
                  chipTextColor = '#93000a';
                }

                return (
                  <TableRow key={row.id} hover>
                    <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace' }}>CH-{row.id}</TableCell>
                    <TableCell sx={{ fontWeight: '500' }}>{row.name}</TableCell>
                    <TableCell>
                      <Chip label={row.status} size="small" sx={{ bgcolor: chipColor, color: chipTextColor, fontWeight: 'bold' }} />
                    </TableCell>
                    <TableCell sx={{ fontFamily: '"JetBrains Mono", monospace' }}>
                      {row.temperature_c != null ? `${row.temperature_c}°C` : '—'}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ flexGrow: 1 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={usagePercent} 
                            color={progressColor}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ fontFamily: '"JetBrains Mono", monospace', minWidth: 40 }}>
                          {`${Math.round(usagePercent)}%`}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right" sx={{ fontFamily: '"JetBrains Mono", monospace' }}>
                      {row.total_capacity} {row.capacity_type || 'kg'}
                    </TableCell>
                    <TableCell align="right">
                      <Button 
                        size="small" 
                        variant="outlined" 
                        startIcon={<Edit2 size={14} />} 
                        onClick={() => {
                          setEditingChamber({...row});
                          setEditOpen(true);
                        }}
                        sx={{ borderRadius: 2 }}
                      >
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              {chambers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    {totalCount === 0 && !searchQuery && statusFilter === 'All' && !startDate && !endDate ? 'No chambers found. Click "New Chamber" to create one.' : 'No chambers match your search or filter.'}
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

      <Box sx={{ mt: 4 }}>
        <FloorPlanView />
      </Box>

      {/* Add Chamber Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Add New Chamber</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1, minWidth: 300 }}>
            <TextField 
              label="Chamber Name" 
              fullWidth 
              value={newChamber.name}
              onChange={e => setNewChamber({...newChamber, name: e.target.value})}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField 
                label="Total Capacity" 
                type="number"
                fullWidth 
                value={newChamber.total_capacity}
                onChange={e => setNewChamber({...newChamber, total_capacity: e.target.value})}
              />
              <TextField
                select
                label="Unit"
                value={newChamber.capacity_type}
                onChange={e => setNewChamber({...newChamber, capacity_type: e.target.value as string})}
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="Weight (kg)">Weight (kg)</MenuItem>
                <MenuItem value="Crates">Crates</MenuItem>
                <MenuItem value="Pallets">Pallets</MenuItem>
                <MenuItem value="Quantity">Quantity</MenuItem>
              </TextField>
            </Box>
            <TextField 
              label="Status" 
              fullWidth 
              value={newChamber.status}
              onChange={e => setNewChamber({...newChamber, status: e.target.value})}
              helperText="Active, Warning, or Maintenance"
              sx={{ mb: 2 }}
            />
            <TextField label="Zone" fullWidth value={newChamber.zone} onChange={e => setNewChamber({...newChamber, zone: e.target.value})} sx={{ mb: 2 }} />
            <TextField label="Target Temperature (°C)" type="number" fullWidth value={newChamber.temperature_c} onChange={e => setNewChamber({...newChamber, temperature_c: e.target.value})} sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="Rows" type="number" fullWidth value={newChamber.row_count} onChange={e => setNewChamber({...newChamber, row_count: e.target.value})} />
              <TextField label="Columns" type="number" fullWidth value={newChamber.column_count} onChange={e => setNewChamber({...newChamber, column_count: e.target.value})} />
              <TextField label="Levels" type="number" fullWidth value={newChamber.level_count} onChange={e => setNewChamber({...newChamber, level_count: e.target.value})} />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAdd}>Add</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Chamber / Visualizer Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="md" fullWidth>
        {editingChamber && (
          <>
            <DialogTitle>Manage Chamber: {editingChamber.name}</DialogTitle>
            <DialogContent>
              <Box sx={{ mt: 1, display: 'grid', gridTemplateColumns: { xs: '1fr', md: '300px 1fr' }, gap: 4 }}>
                
                {/* Form Side */}
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>Capacity Control</Typography>
                    <TextField 
                      label={`Used Capacity (${editingChamber.capacity_type})`}
                      type="number"
                      fullWidth 
                      value={editingChamber.used_capacity}
                      onChange={e => setEditingChamber({...editingChamber, used_capacity: e.target.value})}
                      helperText={`Max: ${editingChamber.total_capacity} ${editingChamber.capacity_type}`}
                    />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>Status</Typography>
                    <TextField
                      select
                      fullWidth
                      value={editingChamber.status}
                      onChange={e => setEditingChamber({...editingChamber, status: e.target.value})}
                    >
                      <MenuItem value="Active">Active</MenuItem>
                      <MenuItem value="Warning">Warning</MenuItem>
                      <MenuItem value="Maintenance">Maintenance</MenuItem>
                    </TextField>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>Temperature</Typography>
                    <TextField
                      label="Target Temperature (°C)"
                      type="number"
                      fullWidth
                      value={editingChamber.temperature_c ?? -2}
                      onChange={e => setEditingChamber({...editingChamber, temperature_c: e.target.value})}
                      sx={{ mb: 2 }}
                      slotProps={{ htmlInput: { step: '0.1' } }}
                    />
                    <TextField
                      label="Current Temperature (°C)"
                      type="number"
                      fullWidth
                      value={editingChamber.current_temperature_c ?? ''}
                      onChange={e => setEditingChamber({...editingChamber, current_temperature_c: e.target.value})}
                      helperText="Live reading shown on Dashboard & floor plan"
                      slotProps={{ htmlInput: { step: '0.1' } }}
                    />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>Zone</Typography>
                    <TextField
                      fullWidth
                      label="Floor plan zone"
                      value={editingChamber.zone || ''}
                      onChange={e => setEditingChamber({...editingChamber, zone: e.target.value})}
                    />
                  </Box>
                </Stack>

                {/* Visualizer Side */}
                <Box>
                  <ChamberVisualizer 
                    totalCapacity={Number(editingChamber.total_capacity)} 
                    usedCapacity={Number(editingChamber.used_capacity) || 0} 
                    capacityType={editingChamber.capacity_type || 'kg'}
                    onChangeCapacity={(newVal) => setEditingChamber({...editingChamber, used_capacity: newVal})}
                  />
                </Box>

              </Box>
            </DialogContent>
            <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 3, pt: 2 }}>
              <Button color="error" onClick={() => setDeleteConfirmId(editingChamber.id)}>Delete Chamber</Button>
              <Box>
                <Button onClick={() => setEditOpen(false)} sx={{ mr: 1 }}>Cancel</Button>
                <Button variant="contained" onClick={handleEditSave}>Save Changes</Button>
              </Box>
            </DialogActions>
          </>
        )}
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onClose={() => setDeleteConfirmId(null)} maxWidth="xs" fullWidth>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this chamber? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setDeleteConfirmId(null)} color="inherit">Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error">Delete</Button>
        </DialogActions>
      </Dialog>
      <Toast />
    </Box>
  );
}
