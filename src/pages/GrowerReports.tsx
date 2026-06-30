import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, CircularProgress, Chip, InputAdornment,
  Stack, TablePagination, Grid, Fade, FormControl, InputLabel, Select, MenuItem, Button
} from '@mui/material';
import { Users, Search, Package, TrendingUp, FileText } from 'lucide-react';
import { useSelector } from 'react-redux';
import { type RootState } from '../store/store';
import { pageContainerSx, pageHeaderSx, pageTitleSx } from '../constants/responsive';

export default function GrowerReports() {
  const [data, setData] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [lifecycleStatus, setLifecycleStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  const token = useSelector((state: RootState) => state.auth.token);
  const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const fetchReports = async () => {
    try {
      const params = new URLSearchParams({
        skip: (page * rowsPerPage).toString(),
        limit: rowsPerPage.toString(),
        sort_by: 'total_crates',
        sort_order: 'desc',
      });
      if (searchQuery) params.append('search', searchQuery);
      if (selectedGroupId) params.append('group_id', selectedGroupId);
      if (lifecycleStatus) params.append('lifecycle_status', lifecycleStatus);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const res = await fetch(`${API}/api/reports/growers?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const result = await res.json();
        setData(result.items || []);
        setTotalCount(result.total || 0);
        setSummary(result.summary || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await fetch(`${API}/api/grower-groups?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const result = await res.json();
        setGroups(result.items || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchReports(); }, [token, page, rowsPerPage]);
  useEffect(() => { fetchGroups(); }, [token]);
  useEffect(() => { setPage(0); fetchReports(); }, [searchQuery, selectedGroupId, lifecycleStatus, startDate, endDate]);

  const statCards = [
    { label: 'Total Growers', value: summary?.total_growers ?? '—', icon: <Users size={24} color="#00A76F" />, bg: 'rgba(0, 167, 111, 0.16)' },
    { label: 'Total Groups', value: summary?.total_groups ?? '—', icon: <FileText size={24} color="#8E33FF" />, bg: 'rgba(142, 51, 255, 0.16)' },
    { label: 'Total Crates', value: summary?.total_crates ?? '—', icon: <Package size={24} color="#00B8D9" />, bg: 'rgba(0, 184, 217, 0.16)' },
    { label: 'Total Weight (kg)', value: summary?.total_weight_kg ?? '—', icon: <TrendingUp size={24} color="#FFAB00" />, bg: 'rgba(255, 171, 0, 0.16)' },
  ];

  return (
    <Fade in timeout={500}>
      <Box sx={pageContainerSx}>
        <Box sx={{ mb: 5, display: 'flex', alignItems: 'center' }}>
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(0, 167, 111, 0.16)', mr: 2, display: 'flex' }}>
            <Users size={24} color="#00A76F" />
          </Box>
          <Box>
            <Typography sx={pageTitleSx}>Grower Reports</Typography>
            <Typography variant="body2" color="text.secondary">Contractual metrics and grower performance analytics</Typography>
          </Box>
        </Box>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statCards.map((card) => (
            <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={card.label}>
              <Paper sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>{card.label}</Typography>
                  <Typography variant="h3" color="text.primary" sx={{ fontWeight: 600, fontFamily: '"JetBrains Mono", monospace' }}>
                    {card.value}
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, bgcolor: card.bg, borderRadius: 2, display: 'flex' }}>
                  {card.icon}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Filters */}
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
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Group</InputLabel>
                <Select value={selectedGroupId} label="Group" onChange={(e) => setSelectedGroupId(e.target.value)}>
                  <MenuItem value="">All Groups</MenuItem>
                  {groups.map((g: any) => <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>)}
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
              <TextField size="small" label="From" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }} />
              <TextField size="small" label="To" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                slotProps={{ inputLabel: { shrink: true } }} />
            </Box>
            {(searchQuery || selectedGroupId || lifecycleStatus || startDate || endDate) && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>Active Filters:</Typography>
                {searchQuery && <Chip size="small" label={`Search: ${searchQuery}`} onDelete={() => setSearchQuery('')} />}
                {selectedGroupId && <Chip size="small" label={`Group filter`} onDelete={() => setSelectedGroupId('')} />}
                {startDate && <Chip size="small" label={`From: ${startDate}`} onDelete={() => setStartDate('')} />}
                {endDate && <Chip size="small" label={`To: ${endDate}`} onDelete={() => setEndDate('')} />}
                {lifecycleStatus && <Chip size="small" label={`Lifecycle: ${lifecycleStatus}`} onDelete={() => setLifecycleStatus('')} />}
                <Button size="small" color="error" onClick={() => { setSearchQuery(''); setSelectedGroupId(''); setLifecycleStatus(''); setStartDate(''); setEndDate(''); }}>Clear All</Button>
              </Box>
            )}
          </Stack>
        </Paper>

        {/* Data Table */}
        <Paper sx={{ overflow: 'hidden' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress /></Box>
          ) : (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Grower</TableCell>
                      <TableCell>Group</TableCell>
                      <TableCell>Lifecycle</TableCell>
                      <TableCell>Contact</TableCell>
                      <TableCell align="right">Transactions</TableCell>
                      <TableCell align="right">Total Crates</TableCell>
                      <TableCell align="right">Total Weight (kg)</TableCell>
                      <TableCell>Status Breakdown</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.map((row: any) => (
                      <TableRow key={row.id} hover>
                        <TableCell>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{row.name}</Typography>
                          <Typography variant="body2" color="text.secondary">ID: {row.id}</Typography>
                        </TableCell>
                        <TableCell>{row.group_name || '—'}</TableCell>
                        <TableCell><Chip label={row.lifecycle_status || 'ACTIVE'} size="small" /></TableCell>
                        <TableCell>{row.contact_number || '—'}</TableCell>
                        <TableCell align="right">
                          <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 600 }}>{row.total_transactions}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 600 }}>{row.total_crates}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography sx={{ fontFamily: '"JetBrains Mono", monospace', fontWeight: 600 }}>{row.total_weight_kg}</Typography>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                            {row.status_breakdown && Object.entries(row.status_breakdown).map(([status, count]: [string, any]) =>
                              count > 0 ? (
                                <Chip key={status} label={`${status.slice(0, 3)}: ${count}`} size="small"
                                  sx={{ fontSize: '0.65rem', height: 20, fontWeight: 600 }} variant="outlined" />
                              ) : null
                            )}
                            {(!row.status_breakdown || Object.values(row.status_breakdown).every((v: any) => v === 0)) && (
                              <Typography variant="caption" color="text.secondary">No activity</Typography>
                            )}
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                    {data.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                          <Users size={40} color="#919EAB" />
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>No grower data found</Typography>
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
                onPageChange={(_, p) => setPage(p)}
                onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
              />
            </>
          )}
        </Paper>
      </Box>
    </Fade>
  );
}
