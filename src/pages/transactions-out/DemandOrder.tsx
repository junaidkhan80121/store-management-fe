import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, TextField, MenuItem, Dialog, DialogTitle,
  DialogContent, DialogActions, Alert, CircularProgress, Chip,
  Stack, TablePagination, Grid, Fade
} from '@mui/material';
import { Plus, Send, Package, ShoppingCart } from 'lucide-react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../store/store';
import { pageContainerSx, pageHeaderSx, pageTitleSx } from '../../constants/responsive';
import { OUTBOUND_SORT_OPTIONS, OUTBOUND_STATUS_OPTIONS } from '../../constants/transactionFilters';
import { parseApiError } from '../../lib/api';
import { useListFilters } from '../../hooks/useListFilters';
import ListFiltersBar from '../../components/ListFiltersBar';

const statusColors: Record<string, string> = {
  DEMAND_DRAFT: '#FFAB00',
  STORE_OUT: '#00B8D9',
  PACKING_DRAFT: '#8E33FF',
  PACKING: '#3366FF',
  DISPATCHED: '#22C55E',
  FINAL_OUTWARD: '#00A76F',
};

export default function DemandOrder() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [sourceTransactions, setSourceTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const filters = useListFilters();
  const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [lotAvailability, setLotAvailability] = useState<any>(null);

  const [form, setForm] = useState({
    transaction_in_id: '' as number | '',
    crates_out: '' as number | '',
    weight_out_kg: '' as number | '',
    buyer_name: '',
    buyer_contact: '',
    destination: '',
  });

  const token = useSelector((state: RootState) => state.auth.token);
  const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const fetchTransactions = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      filters.appendToParams(params);
      const res = await fetch(`${API}/api/transactions-out?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.items || []);
        setTotalCount(data.total || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token, filters.appendToParams]);

  const fetchSourceTransactions = async () => {
    try {
      const res = await fetch(`${API}/api/transactions-in?status=SLOTTED&limit=1000`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSourceTransactions(data.items || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchTransactions(); }, [fetchTransactions, filters.page, filters.rowsPerPage, filters.filterKey]);
  useEffect(() => { fetchSourceTransactions(); }, [token]);

  useEffect(() => {
    if (!form.transaction_in_id || !token) {
      setLotAvailability(null);
      return;
    }
    const loadAvailability = async () => {
      try {
        const res = await fetch(`${API}/api/transactions-in/${form.transaction_in_id}/availability`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setLotAvailability(await res.json());
        else setLotAvailability(null);
      } catch {
        setLotAvailability(null);
      }
    };
    loadAvailability();
  }, [form.transaction_in_id, token]);

  const requestedCrates = Number(form.crates_out) || 0;
  const requestedWeight = Number(form.weight_out_kg) || 0;
  const stockWarning =
    lotAvailability &&
    (requestedCrates > lotAvailability.available_crates ||
      requestedWeight > lotAvailability.available_weight_kg);

  const handleSubmit = async () => {
    if (!form.transaction_in_id) return;
    setSubmitting(true);
    setSubmitStatus(null);

    try {
      const res = await fetch(`${API}/api/transactions-out/demand-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          transaction_in_id: form.transaction_in_id,
          crates_out: Number(form.crates_out) || 0,
          weight_out_kg: Number(form.weight_out_kg) || 0,
          buyer_name: form.buyer_name || null,
          buyer_contact: form.buyer_contact || null,
          destination: form.destination || null,
        }),
      });
      if (!res.ok) throw new Error(await parseApiError(res, 'Failed to create demand order'));

      setSubmitStatus({ type: 'success', message: 'Demand order created successfully!' });
      setForm({ transaction_in_id: '', crates_out: '', weight_out_kg: '', buyer_name: '', buyer_contact: '', destination: '' });
      setOpen(false);
      fetchTransactions();
    } catch (err: any) {
      setSubmitStatus({ type: 'error', message: err.message || 'An error occurred' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Fade in timeout={500}>
      <Box sx={pageContainerSx}>
        <Box sx={pageHeaderSx}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255, 171, 0, 0.16)', mr: 2, display: 'flex' }}>
              <ShoppingCart size={24} color="#FFAB00" />
            </Box>
            <Box>
              <Typography sx={pageTitleSx}>Demand Orders</Typography>
              <Typography variant="body2" color="text.secondary">Create and manage outbound demand orders</Typography>
            </Box>
          </Box>
          <Button variant="contained" startIcon={<Plus size={20} />} onClick={() => setOpen(true)}>
            New Demand Order
          </Button>
        </Box>

        {submitStatus && (
          <Alert severity={submitStatus.type} sx={{ mb: 3 }} onClose={() => setSubmitStatus(null)}>
            {submitStatus.message}
          </Alert>
        )}

        <ListFiltersBar
          filters={filters}
          searchPlaceholder="Search buyer, destination, vehicle..."
          statusOptions={OUTBOUND_STATUS_OPTIONS}
          sortOptions={OUTBOUND_SORT_OPTIONS}
        />

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
                      <TableCell>Crates</TableCell>
                      <TableCell>Weight (kg)</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Created</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.map((txn) => (
                      <TableRow key={txn.id} hover>
                        <TableCell>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>#{txn.id}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={`TXN-${txn.transaction_in_id}`} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>{txn.buyer_name || '—'}</TableCell>
                        <TableCell>{txn.destination || '—'}</TableCell>
                        <TableCell>
                          <Typography sx={{ fontFamily: '"JetBrains Mono", monospace' }}>{txn.crates_out}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontFamily: '"JetBrains Mono", monospace' }}>{txn.weight_out_kg}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={txn.status.replace(/_/g, ' ')}
                            size="small"
                            sx={{
                              bgcolor: `${statusColors[txn.status] || '#919EAB'}20`,
                              color: statusColors[txn.status] || '#919EAB',
                              fontWeight: 700,
                              fontSize: '0.75rem',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(txn.created_at).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                    {transactions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                          <Package size={40} color="#919EAB" />
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            No demand orders found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
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
                onRowsPerPageChange={(e) => { filters.setRowsPerPage(parseInt(e.target.value, 10)); filters.setPage(0); }}
              />
            </>
          )}
        </Paper>

        {/* Create Dialog */}
        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>New Demand Order</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <TextField
                select
                fullWidth
                required
                label="Source Inbound Transaction"
                value={form.transaction_in_id}
                onChange={(e) => setForm({ ...form, transaction_in_id: Number(e.target.value) })}
              >
                {sourceTransactions.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    TXN-{t.id} — {t.item_type} — {t.remaining_crates ?? t.crates_count} crates avail ({t.remaining_weight_kg ?? t.total_weight_kg} kg)
                  </MenuItem>
                ))}
                {sourceTransactions.length === 0 && (
                  <MenuItem disabled value="">No slotted transactions available</MenuItem>
                )}
              </TextField>
              {lotAvailability && (
                <Alert severity={stockWarning ? 'warning' : 'info'}>
                  Source lot TXN-{lotAvailability.transaction_in_id}:{' '}
                  <strong>{lotAvailability.available_crates}</strong> crates /{' '}
                  <strong>{lotAvailability.available_weight_kg}</strong> kg available
                  {lotAvailability.committed_crates > 0 && (
                    <> ({lotAvailability.committed_crates} crates already on other open orders)</>
                  )}
                </Alert>
              )}
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <TextField fullWidth required type="number" label="Crates Out" value={form.crates_out}
                    onChange={(e) => setForm({ ...form, crates_out: e.target.value === '' ? '' : Number(e.target.value) })} />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField fullWidth required type="number" label="Weight (kg)" value={form.weight_out_kg}
                    onChange={(e) => setForm({ ...form, weight_out_kg: e.target.value === '' ? '' : Number(e.target.value) })}
                    slotProps={{ htmlInput: { step: '0.1' } }} />
                </Grid>
              </Grid>
              <TextField fullWidth label="Buyer Name" value={form.buyer_name}
                onChange={(e) => setForm({ ...form, buyer_name: e.target.value })} />
              <TextField fullWidth label="Buyer Contact" value={form.buyer_contact}
                onChange={(e) => setForm({ ...form, buyer_contact: e.target.value })} />
              <TextField fullWidth label="Destination" value={form.destination}
                onChange={(e) => setForm({ ...form, destination: e.target.value })} />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={() => setOpen(false)} color="inherit">Cancel</Button>
            <Button onClick={handleSubmit} variant="contained" disabled={submitting || !form.transaction_in_id || !!stockWarning}
              startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <Send size={16} />}>
              {submitting ? 'Creating...' : 'Create Order'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  );
}
