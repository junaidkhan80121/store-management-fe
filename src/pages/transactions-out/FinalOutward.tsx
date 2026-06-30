import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, TextField, Chip, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert, TablePagination,
  Stack, Fade
} from '@mui/material';
import { CheckCircle2, LogOut, Package } from 'lucide-react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../store/store';
import { pageContainerSx, pageTitleSx } from '../../constants/responsive';
import { OUTBOUND_SORT_OPTIONS, OUTBOUND_STATUS_OPTIONS } from '../../constants/transactionFilters';
import { parseApiError } from '../../lib/api';
import { useListFilters } from '../../hooks/useListFilters';
import ListFiltersBar from '../../components/ListFiltersBar';

export default function FinalOutward() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const filters = useListFilters({ defaultStatus: 'DISPATCHED' });
  const [confirmDialog, setConfirmDialog] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [outwardNotes, setOutwardNotes] = useState('');
  const [stockCheck, setStockCheck] = useState<any>(null);
  const [checkingStock, setCheckingStock] = useState(false);

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

  useEffect(() => { fetchTransactions(); }, [fetchTransactions, filters.page, filters.rowsPerPage, filters.filterKey]);

  useEffect(() => {
    if (!confirmDialog?.id || !token) {
      setStockCheck(null);
      return;
    }
    const loadStock = async () => {
      setCheckingStock(true);
      try {
        const res = await fetch(`${API}/api/transactions-out/${confirmDialog.id}/stock-check`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setStockCheck(await res.json());
        else setStockCheck(null);
      } catch {
        setStockCheck(null);
      } finally {
        setCheckingStock(false);
      }
    };
    loadStock();
  }, [confirmDialog?.id, token]);

  const handleFinalOutward = async (id: number) => {
    setProcessing(true);
    try {
      const res = await fetch(`${API}/api/transactions-out/${id}/final-outward`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          final_outward_notes: outwardNotes || null,
        }),
      });
      if (!res.ok) throw new Error(await parseApiError(res, 'Failed to finalize outward'));
      setAlert({ type: 'success', message: `Order #${id} finalized! Transaction is now complete.` });
      setConfirmDialog(null);
      setOutwardNotes('');
      fetchTransactions();
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Fade in timeout={500}>
      <Box sx={pageContainerSx}>
        <Box sx={{ mb: 5, display: 'flex', alignItems: 'center' }}>
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(0, 167, 111, 0.16)', mr: 2, display: 'flex' }}>
            <LogOut size={24} color="#00A76F" />
          </Box>
          <Box>
            <Typography sx={pageTitleSx}>Final OutWard</Typography>
            <Typography variant="body2" color="text.secondary">
              Finalize dispatched orders — {totalCount} awaiting confirmation
            </Typography>
          </Box>
        </Box>

        {alert && (
          <Alert severity={alert.type} sx={{ mb: 3 }} onClose={() => setAlert(null)}>
            {alert.message}
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
                      <TableCell>Order ID</TableCell>
                      <TableCell>Buyer</TableCell>
                      <TableCell>Crates</TableCell>
                      <TableCell>Weight (kg)</TableCell>
                      <TableCell>Vehicle</TableCell>
                      <TableCell>Destination</TableCell>
                      <TableCell>Dispatched</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.map((txn) => (
                      <TableRow key={txn.id} hover>
                        <TableCell>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>#{txn.id}</Typography>
                        </TableCell>
                        <TableCell>{txn.buyer_name || '—'}</TableCell>
                        <TableCell>
                          <Typography sx={{ fontFamily: '"JetBrains Mono", monospace' }}>{txn.crates_out}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontFamily: '"JetBrains Mono", monospace' }}>{txn.weight_out_kg}</Typography>
                        </TableCell>
                        <TableCell>
                          {txn.dispatch_vehicle ? (
                            <Chip label={txn.dispatch_vehicle} size="small" variant="outlined" />
                          ) : '—'}
                        </TableCell>
                        <TableCell>{txn.destination || '—'}</TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(txn.updated_at).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="contained"
                            endIcon={<CheckCircle2 size={16} />}
                            onClick={() => setConfirmDialog(txn)}
                          >
                            Finalize
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {transactions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                          <Package size={40} color="#919EAB" />
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            No dispatched orders awaiting finalization
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

        {/* Final Outward Dialog */}
        <Dialog open={!!confirmDialog} onClose={() => setConfirmDialog(null)} maxWidth="sm" fullWidth>
          <DialogTitle>Finalize Outward — Order #{confirmDialog?.id}</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <Box sx={{ p: 2, bgcolor: 'rgba(0, 167, 111, 0.08)', borderRadius: 2, border: '1px dashed rgba(0, 167, 111, 0.24)' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'primary.main', mb: 1 }}>Order Summary</Typography>
                <Typography variant="body2">{confirmDialog?.crates_out} crates • {confirmDialog?.weight_out_kg} kg</Typography>
                {confirmDialog?.buyer_name && <Typography variant="body2">Buyer: {confirmDialog.buyer_name}</Typography>}
                {confirmDialog?.dispatch_vehicle && <Typography variant="body2">Vehicle: {confirmDialog.dispatch_vehicle}</Typography>}
                {confirmDialog?.destination && <Typography variant="body2">Destination: {confirmDialog.destination}</Typography>}
              </Box>
              {checkingStock ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={18} />
                  <Typography variant="body2" color="text.secondary">Checking source lot stock…</Typography>
                </Box>
              ) : stockCheck && !stockCheck.can_proceed && (
                <Alert severity="error">
                  {stockCheck.warnings?.join(' ')}
                </Alert>
              )}
              {stockCheck?.can_proceed && (
                <Alert severity="success">
                  Source lot has {stockCheck.remaining_crates} crates / {stockCheck.remaining_weight_kg} kg remaining — sufficient for this order.
                </Alert>
              )}
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Outward Notes (Optional)"
                value={outwardNotes}
                onChange={(e) => setOutwardNotes(e.target.value)}
                placeholder="Final remarks, delivery confirmation details, etc."
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={() => setConfirmDialog(null)} color="inherit">Cancel</Button>
            <Button onClick={() => handleFinalOutward(confirmDialog?.id)} variant="contained"
              disabled={processing || checkingStock || (stockCheck && !stockCheck.can_proceed)}
              startIcon={processing ? <CircularProgress size={16} color="inherit" /> : <CheckCircle2 size={16} />}>
              {processing ? 'Finalizing...' : 'Confirm Final Outward'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  );
}
