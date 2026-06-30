import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, CircularProgress, Chip, InputAdornment,
  Stack, TablePagination, Grid, Fade, FormControl, InputLabel, Select, MenuItem, Button
} from '@mui/material';
import { ArrowDownToLine, Search, Package, TrendingUp, CheckCircle2, Activity } from 'lucide-react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../store/store';

const statusColors: Record<string, string> = {
  PREINWARD: '#FFAB00',
  QUALITY: '#00B8D9',
  DOCKYARD: '#8E33FF',
  SLOTTED: '#00A76F',
  REJECTED: '#FF5630',
};

export default function InboundReports() {
  const [data, setData] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
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
        sort_by: 'created_at',
        sort_order: 'desc',
      });
      if (status) params.append('status', status);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const res = await fetch(`${API}/api/reports/inbound?${params}`, {
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

  useEffect(() => { fetchReports(); }, [token, page, rowsPerPage]);
  useEffect(() => { setPage(0); fetchReports(); }, [status, startDate, endDate]);

  const statCards = [
    { label: 'Total Inbound', value: summary?.all_total ?? '—', icon: <ArrowDownToLine size={24} color="#00A76F" />, bg: 'rgba(0, 167, 111, 0.16)' },
    { label: 'Total Crates', value: summary?.total_crates ?? '—', icon: <Package size={24} color="#00B8D9" />, bg: 'rgba(0, 184, 217, 0.16)' },
    { label: 'Total Weight (kg)', value: summary?.total_weight_kg ?? '—', icon: <TrendingUp size={24} color="#FFAB00" />, bg: 'rgba(255, 171, 0, 0.16)' },
    { label: 'Slotted', value: summary?.status_counts?.SLOTTED ?? '—', icon: <CheckCircle2 size={24} color="#22C55E" />, bg: 'rgba(34, 197, 94, 0.16)' },
  ];

  return (
    <Fade in timeout={500}>
      <Box sx={{ maxWidth: 1440, mx: 'auto', pt: 2, pb: 4 }}>
        <Box sx={{ mb: 5, display: 'flex', alignItems: 'center' }}>
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(0, 167, 111, 0.16)', mr: 2, display: 'flex' }}>
            <Activity size={24} color="#00A76F" />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>Inbound Ledger Audits</Typography>
            <Typography variant="body2" color="text.secondary">Transaction in reports with status breakdown and filters</Typography>
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
                <Box sx={{ p: 1.5, bgcolor: card.bg, borderRadius: 2, display: 'flex' }}>{card.icon}</Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Status breakdown bar */}
        {summary?.status_counts && (
          <Paper sx={{ mb: 3, p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>Status Distribution</Typography>
            <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 1 }}>
              {Object.entries(summary.status_counts).map(([s, count]: [string, any]) => (
                <Chip
                  key={s}
                  label={`${s.replace(/_/g, ' ')}: ${count}`}
                  sx={{
                    bgcolor: `${statusColors[s] || '#919EAB'}16`,
                    color: statusColors[s] || '#919EAB',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                  }}
                />
              ))}
            </Stack>
          </Paper>
        )}

        {/* Filters */}
        <Paper sx={{ mb: 3, p: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Status</InputLabel>
              <Select value={status} label="Status" onChange={(e) => setStatus(e.target.value)}>
                <MenuItem value="">All Statuses</MenuItem>
                {Object.keys(statusColors).map((s) => <MenuItem key={s} value={s}>{s.replace(/_/g, ' ')}</MenuItem>)}
              </Select>
            </FormControl>
            <TextField size="small" label="From" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }} />
            <TextField size="small" label="To" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }} />
            {(status || startDate || endDate) && (
              <Button size="small" color="error" onClick={() => { setStatus(''); setStartDate(''); setEndDate(''); }}>Clear</Button>
            )}
          </Box>
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
                      <TableCell>ID</TableCell>
                      <TableCell>Grower</TableCell>
                      <TableCell>Vehicle</TableCell>
                      <TableCell>Item</TableCell>
                      <TableCell align="right">Crates</TableCell>
                      <TableCell align="right">Weight (kg)</TableCell>
                      <TableCell>Chamber</TableCell>
                      <TableCell>Grade</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.map((row: any) => (
                      <TableRow key={row.id} hover>
                        <TableCell><Typography variant="subtitle2" sx={{ fontWeight: 600 }}>#{row.id}</Typography></TableCell>
                        <TableCell>{row.grower_name}</TableCell>
                        <TableCell>{row.vehicle_number || '—'}</TableCell>
                        <TableCell>{row.item_type}</TableCell>
                        <TableCell align="right">
                          <Typography sx={{ fontFamily: '"JetBrains Mono", monospace' }}>{row.crates_count}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography sx={{ fontFamily: '"JetBrains Mono", monospace' }}>{row.total_weight_kg}</Typography>
                        </TableCell>
                        <TableCell>{row.chamber_name || '—'}</TableCell>
                        <TableCell>
                          {row.quality_grade ? (
                            <Chip label={row.quality_grade} size="small" variant="outlined" />
                          ) : '—'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={row.status.replace(/_/g, ' ')}
                            size="small"
                            sx={{
                              bgcolor: `${statusColors[row.status] || '#919EAB'}20`,
                              color: statusColors[row.status] || '#919EAB',
                              fontWeight: 700,
                              fontSize: '0.7rem',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {row.created_at ? new Date(row.created_at).toLocaleDateString() : '—'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                    {data.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                          <Package size={40} color="#919EAB" />
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>No inbound transactions found</Typography>
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
