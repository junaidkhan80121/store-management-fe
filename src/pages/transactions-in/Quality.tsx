import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, Fade, Button, CircularProgress, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Alert, TablePagination } from '@mui/material';
import { CheckSquare, CheckCircle, XCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../store/store';
import { pageContainerSx } from '../../constants/responsive';
import { INBOUND_SORT_OPTIONS, INBOUND_STATUS_OPTIONS } from '../../constants/transactionFilters';
import { useListFilters } from '../../hooks/useListFilters';
import ListFiltersBar from '../../components/ListFiltersBar';

interface Transaction {
  id: number;
  grower_id: number;
  grower_name?: string;
  vehicle_number: string | null;
  item_type: string;
  crates_count: number;
  total_weight_kg: number;
  quality_grade: string | null;
  staging_bay?: string;
  expected_arrival_at?: string;
}

export default function Quality() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [grade, setGrade] = useState('Grade A');
  const [notes, setNotes] = useState('');
  const [temperature, setTemperature] = useState<number | ''>('');
  const [bruising, setBruising] = useState<number | ''>('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const filters = useListFilters({ defaultStatus: 'PREINWARD' });
  const token = useSelector((state: RootState) => state.auth.token);
  const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const fetchPendingQuality = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      filters.appendToParams(params);
      const response = await fetch(`${API}/api/transactions-in?${params}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.items || []);
        setTotalCount(data.total || 0);
      }
    } catch (err) {
      console.error("Failed to fetch preinward transactions", err);
    } finally {
      setLoading(false);
    }
  }, [token, filters.appendToParams]);

  useEffect(() => {
    fetchPendingQuality();
  }, [fetchPendingQuality, filters.page, filters.rowsPerPage, filters.filterKey]);

  const handleApprove = async () => {
    if (!selectedTx) return;
    if (temperature === '' || bruising === '') {
      setError('Product temperature and bruising ratio are required.');
      return;
    }
    setProcessing(true);
    setError('');

    const isRejected = grade === 'Rejected';
    const payload: Record<string, unknown> = {
      status: isRejected ? 'REJECTED' : 'QUALITY',
      quality_grade: grade,
      quality_notes: notes,
      product_temperature_c: Number(temperature),
      bruising_ratio_percent: Number(bruising),
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/transactions-in/${selectedTx.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Quality check failed');
      }

      setSelectedTx(null);
      setGrade('Grade A');
      setNotes('');
      setTemperature('');
      setBruising('');
      fetchPendingQuality();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Quality check failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Fade in={true} timeout={500}>
      <Box sx={pageContainerSx}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'warning.main', color: 'warning.contrastText', mr: 2, display: 'flex' }}>
            <CheckSquare size={24} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }} color="text.primary">Quality Control</Typography>
        </Box>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Record product temperature, bruising ratios, and grading metrics before dockyard release.
        </Typography>

        <ListFiltersBar
          filters={filters}
          searchPlaceholder="Search grower, vehicle, item type..."
          statusOptions={INBOUND_STATUS_OPTIONS}
          sortOptions={INBOUND_SORT_OPTIONS}
        />

        <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
          ) : transactions.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">No stock matches your filters.</Typography>
            </Box>
          ) : (
            <>
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Manifest</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Grower</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Vehicle</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Staging</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Arrival ETA</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Load</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id} hover>
                      <TableCell>#{tx.id}</TableCell>
                      <TableCell>{tx.grower_name || tx.grower_id}</TableCell>
                      <TableCell><Chip label={tx.vehicle_number || 'N/A'} size="small" variant="outlined" /></TableCell>
                      <TableCell>{tx.staging_bay || '—'}</TableCell>
                      <TableCell>{tx.expected_arrival_at ? new Date(tx.expected_arrival_at).toLocaleString() : '—'}</TableCell>
                      <TableCell>{tx.crates_count} crates ({tx.total_weight_kg}kg)</TableCell>
                      <TableCell>
                        <Button variant="contained" color="warning" size="small" onClick={() => setSelectedTx(tx)}>Inspect</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={totalCount}
              rowsPerPage={filters.rowsPerPage}
              page={filters.page}
              onPageChange={(_, p) => filters.setPage(p)}
              onRowsPerPageChange={(e) => {
                filters.setRowsPerPage(parseInt(e.target.value, 10));
                filters.setPage(0);
              }}
            />
            </>
          )}
        </Paper>

        <Dialog open={!!selectedTx} onClose={() => setSelectedTx(null)} maxWidth="sm" fullWidth>
          <DialogTitle>Quality Verification — Manifest #{selectedTx?.id}</DialogTitle>
          <DialogContent dividers>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <TextField fullWidth type="number" label="Product Temperature (°C)" value={temperature}
              onChange={(e) => setTemperature(e.target.value === '' ? '' : Number(e.target.value))} sx={{ mb: 2 }}
              slotProps={{ htmlInput: { step: '0.1' } }} />
            <TextField fullWidth type="number" label="Bruising Ratio (%)" value={bruising}
              onChange={(e) => setBruising(e.target.value === '' ? '' : Number(e.target.value))} sx={{ mb: 2 }}
              slotProps={{ htmlInput: { min: 0, max: 100, step: '0.1' } }} />
            <TextField select fullWidth label="Quality Grade" value={grade} onChange={(e) => setGrade(e.target.value)} sx={{ mb: 2 }}>
              <MenuItem value="Grade A">Grade A (Premium)</MenuItem>
              <MenuItem value="Grade B">Grade B (Standard)</MenuItem>
              <MenuItem value="Grade C">Grade C (Juice)</MenuItem>
              <MenuItem value="Rejected">Rejected</MenuItem>
            </TextField>
            <TextField fullWidth multiline rows={3} label="Quality Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setSelectedTx(null)} color="inherit">Cancel</Button>
            <Button onClick={handleApprove} variant="contained" color={grade === 'Rejected' ? 'error' : 'success'}
              disabled={processing} startIcon={processing ? <CircularProgress size={16} /> : (grade === 'Rejected' ? <XCircle size={16}/> : <CheckCircle size={16} />)}>
              {grade === 'Rejected' ? 'Reject Stock' : 'Approve for Dockyard'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  );
}
