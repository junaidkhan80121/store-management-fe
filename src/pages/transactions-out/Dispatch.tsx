import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, TextField, Chip, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert, TablePagination,
  Stack, Fade
} from '@mui/material';
import { Send, Truck, ArrowRight, Package } from 'lucide-react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../store/store';

export default function Dispatch() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [dispatchDialog, setDispatchDialog] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [vehicle, setVehicle] = useState('');
  const [destination, setDestination] = useState('');

  const token = useSelector((state: RootState) => state.auth.token);
  const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const fetchTransactions = async () => {
    try {
      const params = new URLSearchParams({
        skip: (page * rowsPerPage).toString(),
        limit: rowsPerPage.toString(),
        status: 'PACKING',
      });
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
  };

  useEffect(() => { fetchTransactions(); }, [token, page, rowsPerPage]);

  const handleDispatch = async (id: number) => {
    setProcessing(true);
    try {
      const res = await fetch(`${API}/api/transactions-out/${id}/dispatch`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          dispatch_vehicle: vehicle || null,
          destination: destination || null,
        }),
      });
      if (!res.ok) throw new Error('Failed to dispatch');
      setAlert({ type: 'success', message: `Order #${id} dispatched successfully!` });
      setDispatchDialog(null);
      setVehicle('');
      setDestination('');
      fetchTransactions();
    } catch (err: any) {
      setAlert({ type: 'error', message: err.message });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Fade in timeout={500}>
      <Box sx={{ maxWidth: 1440, mx: 'auto', pt: 2, pb: 4 }}>
        <Box sx={{ mb: 5, display: 'flex', alignItems: 'center' }}>
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(34, 197, 94, 0.16)', mr: 2, display: 'flex' }}>
            <Truck size={24} color="#22C55E" />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>Dispatch</Typography>
            <Typography variant="body2" color="text.secondary">
              Dispatch packed orders to destinations — {totalCount} ready for dispatch
            </Typography>
          </Box>
        </Box>

        {alert && (
          <Alert severity={alert.type} sx={{ mb: 3 }} onClose={() => setAlert(null)}>
            {alert.message}
          </Alert>
        )}

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
                      <TableCell>Packing</TableCell>
                      <TableCell>Destination</TableCell>
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
                            <Chip label={txn.packing_type} size="small" variant="outlined" />
                          ) : '—'}
                        </TableCell>
                        <TableCell>{txn.destination || '—'}</TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(txn.created_at).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            endIcon={<Send size={16} />}
                            onClick={() => {
                              setDispatchDialog(txn);
                              setDestination(txn.destination || '');
                              setVehicle(txn.dispatch_vehicle || '');
                            }}
                          >
                            Dispatch
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {transactions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                          <Package size={40} color="#919EAB" />
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            No packed orders ready for dispatch
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
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(_, p) => setPage(p)}
                onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
              />
            </>
          )}
        </Paper>

        {/* Dispatch Dialog */}
        <Dialog open={!!dispatchDialog} onClose={() => setDispatchDialog(null)} maxWidth="sm" fullWidth>
          <DialogTitle>Dispatch Order #{dispatchDialog?.id}</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <Box sx={{ p: 2, bgcolor: 'rgba(145, 158, 171, 0.08)', borderRadius: 2 }}>
                <Typography variant="body2">
                  {dispatchDialog?.crates_out} crates • {dispatchDialog?.weight_out_kg} kg
                  {dispatchDialog?.buyer_name ? ` • Buyer: ${dispatchDialog.buyer_name}` : ''}
                </Typography>
              </Box>
              <TextField
                fullWidth
                label="Vehicle Number"
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
                placeholder="e.g. JK01AB1234"
              />
              <TextField
                fullWidth
                label="Destination"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Delivery address or market"
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={() => setDispatchDialog(null)} color="inherit">Cancel</Button>
            <Button onClick={() => handleDispatch(dispatchDialog?.id)} variant="contained" color="success" disabled={processing}
              startIcon={processing ? <CircularProgress size={16} color="inherit" /> : <Send size={16} />}>
              {processing ? 'Dispatching...' : 'Confirm Dispatch'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  );
}
