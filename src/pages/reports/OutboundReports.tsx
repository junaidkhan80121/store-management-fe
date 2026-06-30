import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, CircularProgress, Chip, InputAdornment,
  Stack, TablePagination, Grid, Fade, FormControl, InputLabel, Select, MenuItem, Button, Tabs, Tab
} from '@mui/material';
import { ArrowUpFromLine, Search, Package, TrendingUp, CheckCircle2, Activity, Truck } from 'lucide-react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../store/store';
import { pageContainerSx, pageHeaderSx, pageTitleSx } from '../../constants/responsive';
import FilterDateField from '../../components/FilterDateField';

const statusColors: Record<string, string> = {
  DEMAND_DRAFT: '#FFAB00',
  STORE_OUT: '#00B8D9',
  PACKING_DRAFT: '#8E33FF',
  PACKING: '#3366FF',
  DISPATCHED: '#22C55E',
  FINAL_OUTWARD: '#00A76F',
};

export default function OutboundReports() {
  const [data, setData] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState('');
  const [reportType, setReportType] = useState('ledger');
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
        report_type: reportType,
      });
      if (searchQuery) params.append('search', searchQuery);
      if (status) params.append('status', status);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const res = await fetch(`${API}/api/reports/outbound?${params}`, {
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
  useEffect(() => { setPage(0); fetchReports(); }, [searchQuery, status, reportType, startDate, endDate]);

  const reportTabs = [
    { value: 'ledger', label: 'Settlement Ledger' },
    { value: 'valuation', label: 'Stock Valuation' },
    { value: 'packing-draft', label: 'Packing Draft Ledgers' },
    { value: 'packing-inventory', label: 'Live Packing Inventory' },
    { value: 'manifest', label: 'Shipping Manifests' },
  ];

  const statCards = [
    { label: 'Total Outbound', value: summary?.all_total ?? '—', icon: <ArrowUpFromLine size={24} color="#00A76F" />, bg: 'rgba(0, 167, 111, 0.16)' },
    { label: 'Total Crates Out', value: summary?.total_crates ?? '—', icon: <Package size={24} color="#00B8D9" />, bg: 'rgba(0, 184, 217, 0.16)' },
    { label: 'Total Weight (kg)', value: summary?.total_weight_kg ?? '—', icon: <TrendingUp size={24} color="#FFAB00" />, bg: 'rgba(255, 171, 0, 0.16)' },
    { label: 'Total Valuation', value: summary?.total_valuation ?? '—', icon: <CheckCircle2 size={24} color="#22C55E" />, bg: 'rgba(34, 197, 94, 0.16)' },
  ];

  return (
    <Fade in timeout={500}>
      <Box sx={pageContainerSx}>
        <Box sx={{ mb: 5, display: 'flex', alignItems: 'center' }}>
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(0, 167, 111, 0.16)', mr: 2, display: 'flex' }}>
            <Activity size={24} color="#00A76F" />
          </Box>
          <Box>
            <Typography sx={pageTitleSx}>Outbound Settlement Audits</Typography>
            <Typography variant="body2" color="text.secondary">Transaction out reports with pipeline status tracking</Typography>
          </Box>
        </Box>

        <Paper sx={{ mb: 3 }}>
          <Tabs value={reportType} onChange={(_, v) => setReportType(v)} variant="scrollable">
            {reportTabs.map((t) => <Tab key={t.value} value={t.value} label={t.label} />)}
          </Tabs>
        </Paper>

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

        {/* Status breakdown */}
        {summary?.status_counts && (
          <Paper sx={{ mb: 3, p: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 600 }}>Pipeline Status Distribution</Typography>
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
            <TextField
              size="small"
              placeholder="Search buyer, destination, vehicle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search size={18} /></InputAdornment> } }}
              sx={{ minWidth: 250, flexGrow: 1 }}
            />
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Status</InputLabel>
              <Select value={status} label="Status" onChange={(e) => setStatus(e.target.value)}>
                <MenuItem value="">All Statuses</MenuItem>
                {Object.keys(statusColors).map((s) => <MenuItem key={s} value={s}>{s.replace(/_/g, ' ')}</MenuItem>)}
              </Select>
            </FormControl>
            <FilterDateField label="From" value={startDate} onChange={setStartDate} />
            <FilterDateField label="To" value={endDate} onChange={setEndDate} />
            {(searchQuery || status || startDate || endDate) && (
              <Button size="small" color="error" onClick={() => { setSearchQuery(''); setStatus(''); setStartDate(''); setEndDate(''); }}>Clear</Button>
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
                      <TableCell>Source TXN</TableCell>
                      <TableCell>Buyer</TableCell>
                      <TableCell>Destination</TableCell>
                      <TableCell align="right">Crates</TableCell>
                      <TableCell align="right">Weight (kg)</TableCell>
                      <TableCell>Vehicle</TableCell>
                      <TableCell>Packing</TableCell>
                      {(reportType === 'valuation' || reportType === 'packing-draft') && (
                        <TableCell align="right">Valuation</TableCell>
                      )}
                      {reportType === 'manifest' && <TableCell>Confirmed</TableCell>}
                      <TableCell>Status</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.map((row: any) => (
                      <TableRow key={row.id} hover>
                        <TableCell><Typography variant="subtitle2" sx={{ fontWeight: 600 }}>#{row.id}</Typography></TableCell>
                        <TableCell><Chip label={`TXN-${row.transaction_in_id}`} size="small" variant="outlined" /></TableCell>
                        <TableCell>{row.buyer_name || '—'}</TableCell>
                        <TableCell>{row.destination || '—'}</TableCell>
                        <TableCell align="right">
                          <Typography sx={{ fontFamily: '"JetBrains Mono", monospace' }}>{row.crates_out}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography sx={{ fontFamily: '"JetBrains Mono", monospace' }}>{row.weight_out_kg}</Typography>
                        </TableCell>
                        <TableCell>{row.dispatch_vehicle || '—'}</TableCell>
                        <TableCell>{row.packing_type || '—'}</TableCell>
                        {(reportType === 'valuation' || reportType === 'packing-draft') && (
                          <TableCell align="right">{row.stock_valuation ?? '—'}</TableCell>
                        )}
                        {reportType === 'manifest' && (
                          <TableCell>{row.outward_confirmed_at ? new Date(row.outward_confirmed_at).toLocaleString() : '—'}</TableCell>
                        )}
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
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>No outbound transactions found</Typography>
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
