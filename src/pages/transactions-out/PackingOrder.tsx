import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, Chip, CircularProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, Alert, TablePagination, Fade
} from '@mui/material';
import { PackageCheck, ArrowRight, Package } from 'lucide-react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../store/store';
import { pageContainerSx, pageTitleSx } from '../../constants/responsive';
import { OUTBOUND_SORT_OPTIONS, OUTBOUND_STATUS_OPTIONS } from '../../constants/transactionFilters';
import { useListFilters } from '../../hooks/useListFilters';
import ListFiltersBar from '../../components/ListFiltersBar';

export default function PackingOrder() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const filters = useListFilters({ defaultStatus: 'PACKING_DRAFT' });
  const [confirmDialog, setConfirmDialog] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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

  const handleConfirmOrder = async (id: number) => {
    setProcessing(true);
    try {
      const res = await fetch(`${API}/api/transactions-out/${id}/packing-order`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to confirm packing order');
      setAlert({ type: 'success', message: `Packing order confirmed for #${id}!` });
      setConfirmDialog(null);
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
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(51, 102, 255, 0.16)', mr: 2, display: 'flex' }}>
            <PackageCheck size={24} color="#3366FF" />
          </Box>
          <Box>
            <Typography sx={pageTitleSx}>Packing Orders</Typography>
            <Typography variant="body2" color="text.secondary">
              Confirm packing drafts into active orders — {totalCount} pending confirmation
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
                      <TableCell>Packing Type</TableCell>
                      <TableCell>Notes</TableCell>
                      <TableCell>Created</TableCell>
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
                          {txn.packing_type ? (
                            <Chip label={txn.packing_type} size="small" sx={{ bgcolor: 'rgba(142, 51, 255, 0.08)', color: '#8E33FF', fontWeight: 600 }} />
                          ) : '—'}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {txn.packing_notes || '—'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(txn.created_at).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="contained"
                            sx={{ bgcolor: '#3366FF', '&:hover': { bgcolor: '#2952CC' } }}
                            endIcon={<ArrowRight size={16} />}
                            onClick={() => setConfirmDialog(txn)}
                          >
                            Confirm
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {transactions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                          <Package size={40} color="#919EAB" />
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            No packing drafts pending confirmation
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

        <Dialog open={!!confirmDialog} onClose={() => setConfirmDialog(null)} maxWidth="xs" fullWidth>
          <DialogTitle>Confirm Packing Order</DialogTitle>
          <DialogContent>
            <Typography color="text.secondary">
              Confirm packing order <strong>#{confirmDialog?.id}</strong>?
            </Typography>
            <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(145, 158, 171, 0.08)', borderRadius: 2 }}>
              <Typography variant="body2">{confirmDialog?.crates_out} crates • {confirmDialog?.weight_out_kg} kg</Typography>
              {confirmDialog?.packing_type && <Typography variant="body2">Type: {confirmDialog.packing_type}</Typography>}
              {confirmDialog?.buyer_name && <Typography variant="body2">Buyer: {confirmDialog.buyer_name}</Typography>}
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={() => setConfirmDialog(null)} color="inherit">Cancel</Button>
            <Button onClick={() => handleConfirmOrder(confirmDialog?.id)} variant="contained" disabled={processing}
              sx={{ bgcolor: '#3366FF', '&:hover': { bgcolor: '#2952CC' } }}
              startIcon={processing ? <CircularProgress size={16} color="inherit" /> : <PackageCheck size={16} />}>
              {processing ? 'Confirming...' : 'Confirm Order'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  );
}
