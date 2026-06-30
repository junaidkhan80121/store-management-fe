import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, TextField, Chip, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Alert, TablePagination,
  Stack, MenuItem, Fade
} from '@mui/material';
import { PackageCheck, ArrowRight, Package } from 'lucide-react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../store/store';

export default function PackingDraft() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [draftDialog, setDraftDialog] = useState<any>(null);
  const [processing, setProcessing] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [packingType, setPackingType] = useState('');
  const [packingNotes, setPackingNotes] = useState('');

  const token = useSelector((state: RootState) => state.auth.token);
  const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const fetchTransactions = async () => {
    try {
      const params = new URLSearchParams({
        skip: (page * rowsPerPage).toString(),
        limit: rowsPerPage.toString(),
        status: 'STORE_OUT',
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

  const handleCreateDraft = async (id: number) => {
    setProcessing(true);
    try {
      const res = await fetch(`${API}/api/transactions-out/${id}/packing-draft`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          packing_type: packingType || null,
          packing_notes: packingNotes || null,
        }),
      });
      if (!res.ok) throw new Error('Failed to create packing draft');
      setAlert({ type: 'success', message: `Packing draft created for order #${id}!` });
      setDraftDialog(null);
      setPackingType('');
      setPackingNotes('');
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
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(142, 51, 255, 0.16)', mr: 2, display: 'flex' }}>
            <PackageCheck size={24} color="#8E33FF" />
          </Box>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700 }}>Packing Drafts</Typography>
            <Typography variant="body2" color="text.secondary">
              Create packing specifications for store-out items — {totalCount} awaiting
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
                      <TableCell>Destination</TableCell>
                      <TableCell>Crates</TableCell>
                      <TableCell>Weight (kg)</TableCell>
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
                        <TableCell>{txn.destination || '—'}</TableCell>
                        <TableCell>
                          <Typography sx={{ fontFamily: '"JetBrains Mono", monospace' }}>{txn.crates_out}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontFamily: '"JetBrains Mono", monospace' }}>{txn.weight_out_kg}</Typography>
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
                            sx={{ bgcolor: '#8E33FF', '&:hover': { bgcolor: '#6B21A8' } }}
                            endIcon={<ArrowRight size={16} />}
                            onClick={() => setDraftDialog(txn)}
                          >
                            Create Draft
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {transactions.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                          <Package size={40} color="#919EAB" />
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            No store-out items awaiting packing drafts
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

        {/* Packing Draft Dialog */}
        <Dialog open={!!draftDialog} onClose={() => setDraftDialog(null)} maxWidth="sm" fullWidth>
          <DialogTitle>Create Packing Draft — Order #{draftDialog?.id}</DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <Box sx={{ p: 2, bgcolor: 'rgba(145, 158, 171, 0.08)', borderRadius: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {draftDialog?.crates_out} crates • {draftDialog?.weight_out_kg} kg
                  {draftDialog?.buyer_name ? ` • Buyer: ${draftDialog.buyer_name}` : ''}
                </Typography>
              </Box>
              <TextField
                select
                fullWidth
                label="Packing Type"
                value={packingType}
                onChange={(e) => setPackingType(e.target.value)}
              >
                <MenuItem value="Standard Box">Standard Box</MenuItem>
                <MenuItem value="Premium Carton">Premium Carton</MenuItem>
                <MenuItem value="Export Grade">Export Grade</MenuItem>
                <MenuItem value="Bulk Pack">Bulk Pack</MenuItem>
                <MenuItem value="Custom">Custom</MenuItem>
              </TextField>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Packing Notes"
                value={packingNotes}
                onChange={(e) => setPackingNotes(e.target.value)}
                placeholder="Special instructions, labeling requirements, etc."
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={() => setDraftDialog(null)} color="inherit">Cancel</Button>
            <Button onClick={() => handleCreateDraft(draftDialog?.id)} variant="contained" disabled={processing}
              sx={{ bgcolor: '#8E33FF', '&:hover': { bgcolor: '#6B21A8' } }}
              startIcon={processing ? <CircularProgress size={16} color="inherit" /> : <PackageCheck size={16} />}>
              {processing ? 'Creating...' : 'Create Draft'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  );
}
