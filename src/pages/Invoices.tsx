import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, TextField, Chip, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Stack, TablePagination,
  Fade, MenuItem, IconButton, Tooltip
} from '@mui/material';
import { Plus, FileText, Download, Trash2, Receipt, X } from 'lucide-react';
import { useSelector } from 'react-redux';
import { type RootState } from '../store/store';
import { useAppToast } from '../hooks/useAppToast';
import { pageContainerSx, pageHeaderSx, pageTitleSx } from '../constants/responsive';
import { INVOICE_SORT_OPTIONS, INVOICE_STATUS_OPTIONS } from '../constants/transactionFilters';
import { useListFilters } from '../hooks/useListFilters';
import ListFiltersBar from '../components/ListFiltersBar';

const statusColors: Record<string, 'default' | 'success' | 'warning' | 'error' | 'info'> = {
  DRAFT: 'default',
  ISSUED: 'info',
  PAID: 'success',
  CANCELLED: 'error',
};

type TaxLineForm = { name: string; rate_percent: string };

const defaultTaxLines = (): TaxLineForm[] => [{ name: 'GST', rate_percent: '18' }];

export default function Invoices() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [eligibleOrders, setEligibleOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const filters = useListFilters({ defaultSortField: 'issued_at', defaultSortOrder: 'desc' });
  const [submitting, setSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [form, setForm] = useState({ transaction_out_id: '' as number | '', notes: '' });
  const [taxLines, setTaxLines] = useState<TaxLineForm[]>(defaultTaxLines);

  const token = useSelector((state: RootState) => state.auth.token);
  const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const { showToast, Toast } = useAppToast();

  const fetchInvoices = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      filters.appendToParams(params);
      const res = await fetch(`${API}/api/invoices?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.items || []);
        setTotalCount(data.total || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token, filters.appendToParams]);

  const fetchEligible = async () => {
    try {
      const res = await fetch(`${API}/api/invoices/eligible-orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setEligibleOrders(data.items || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchInvoices(); }, [fetchInvoices, filters.page, filters.rowsPerPage, filters.filterKey]);
  useEffect(() => { if (open) fetchEligible(); }, [open, token]);

  const handleCreate = async () => {
    if (!form.transaction_out_id) return;
    setSubmitting(true);
    try {
      const payloadTaxLines = taxLines
        .filter((line) => line.name.trim())
        .map((line) => ({
          name: line.name.trim(),
          rate_percent: Number(line.rate_percent) || 0,
        }));

      const res = await fetch(`${API}/api/invoices`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          transaction_out_id: form.transaction_out_id,
          tax_lines: payloadTaxLines.length > 0 ? payloadTaxLines : undefined,
          notes: form.notes || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || 'Failed to create invoice');
      }
      const created = await res.json();
      setOpen(false);
      setForm({ transaction_out_id: '', notes: '' });
      setTaxLines(defaultTaxLines());
      fetchInvoices();
      showToast(`Invoice ${created.invoice_number} created`);
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Failed to create invoice', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const downloadPdf = async (invoice: any) => {
    try {
      const res = await fetch(`${API}/api/invoices/${invoice.id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to download PDF');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoice.invoice_number}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showToast('PDF downloaded');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'PDF download failed', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      const res = await fetch(`${API}/api/invoices/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to delete invoice');
      setDeleteTarget(null);
      fetchInvoices();
      showToast('Invoice deleted');
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Delete failed', 'error');
    }
  };

  const selectedOrder = eligibleOrders.find((o) => o.id === form.transaction_out_id);
  const subtotal = selectedOrder?.stock_valuation || 0;

  const computedTaxLines = taxLines
    .filter((line) => line.name.trim())
    .map((line) => {
      const rate = Number(line.rate_percent) || 0;
      return {
        name: line.name.trim(),
        rate,
        amount: Math.round(subtotal * rate) / 100,
      };
    });
  const computedTaxTotal = computedTaxLines.reduce((sum, line) => sum + line.amount, 0);
  const computedGrandTotal = subtotal + computedTaxTotal;

  const updateTaxLine = (index: number, field: keyof TaxLineForm, value: string) => {
    setTaxLines((prev) => prev.map((line, i) => (i === index ? { ...line, [field]: value } : line)));
  };

  const addTaxLine = () => {
    setTaxLines((prev) => [...prev, { name: '', rate_percent: '' }]);
  };

  const removeTaxLine = (index: number) => {
    setTaxLines((prev) => (prev.length <= 1 ? [{ name: '', rate_percent: '' }] : prev.filter((_, i) => i !== index)));
  };

  return (
    <Fade in timeout={500}>
      <Box sx={pageContainerSx}>
        <Box sx={pageHeaderSx}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(0, 167, 111, 0.16)', mr: 2, display: 'flex' }}>
              <Receipt size={24} color="#00A76F" />
            </Box>
            <Box>
              <Typography sx={pageTitleSx}>Invoices</Typography>
              <Typography variant="body2" color="text.secondary">Create and download PDF invoices for outbound orders</Typography>
            </Box>
          </Box>
          <Button variant="contained" startIcon={<Plus size={20} />} onClick={() => setOpen(true)}>
            Create Invoice
          </Button>
        </Box>

        <ListFiltersBar
          filters={filters}
          searchPlaceholder="Search invoice #, buyer, order ref..."
          statusOptions={INVOICE_STATUS_OPTIONS}
          sortOptions={INVOICE_SORT_OPTIONS}
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
                      <TableCell>Invoice #</TableCell>
                      <TableCell>Buyer</TableCell>
                      <TableCell>Order Ref</TableCell>
                      <TableCell align="right">Weight</TableCell>
                      <TableCell align="right">Subtotal</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoices.map((inv) => (
                      <TableRow key={inv.id} hover>
                        <TableCell>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{inv.invoice_number}</Typography>
                        </TableCell>
                        <TableCell>{inv.buyer_name || '—'}</TableCell>
                        <TableCell>#{inv.transaction_out_id}</TableCell>
                        <TableCell align="right">{inv.weight_out_kg} kg</TableCell>
                        <TableCell align="right">₹ {inv.subtotal?.toLocaleString()}</TableCell>
                        <TableCell align="right">
                          <Typography sx={{ fontWeight: 600 }}>₹ {inv.total_amount?.toLocaleString()}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={inv.status} size="small" color={statusColors[inv.status] || 'default'} />
                        </TableCell>
                        <TableCell>
                          {inv.issued_at ? new Date(inv.issued_at).toLocaleDateString() : '—'}
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Download PDF">
                            <IconButton size="small" color="primary" onClick={() => downloadPdf(inv)}>
                              <Download size={18} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error" onClick={() => setDeleteTarget(inv)}>
                              <Trash2 size={18} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                    {invoices.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                          <FileText size={40} color="#919EAB" />
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            No invoices match your filters.
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

        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Create Invoice</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <TextField
                select
                fullWidth
                required
                label="Outbound Order"
                value={form.transaction_out_id}
                onChange={(e) => setForm({ ...form, transaction_out_id: Number(e.target.value) })}
              >
                {eligibleOrders.map((o) => (
                  <MenuItem key={o.id} value={o.id}>
                    #{o.id} — {o.buyer_name || 'Buyer'} — {o.item_type} — ₹{(o.stock_valuation || 0).toLocaleString()}
                  </MenuItem>
                ))}
                {eligibleOrders.length === 0 && (
                  <MenuItem disabled value="">No eligible orders (complete packing draft with unit price first)</MenuItem>
                )}
              </TextField>
              {selectedOrder && (
                <Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover' }}>
                  <Typography variant="body2">{selectedOrder.crates_out} crates · {selectedOrder.weight_out_kg} kg</Typography>
                  <Typography variant="body2">Subtotal: ₹ {subtotal.toLocaleString()}</Typography>
                </Paper>
              )}

              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Taxes (manual)</Typography>
                  <Button size="small" startIcon={<Plus size={16} />} onClick={addTaxLine}>
                    Add tax
                  </Button>
                </Box>
                <Stack spacing={1.5}>
                  {taxLines.map((line, index) => (
                    <Box key={index} sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                      <TextField
                        size="small"
                        label="Tax type"
                        placeholder="e.g. CGST, SGST, Service"
                        value={line.name}
                        onChange={(e) => updateTaxLine(index, 'name', e.target.value)}
                        sx={{ flex: 1.4 }}
                      />
                      <TextField
                        size="small"
                        type="number"
                        label="Rate (%)"
                        value={line.rate_percent}
                        onChange={(e) => updateTaxLine(index, 'rate_percent', e.target.value)}
                        slotProps={{ htmlInput: { min: 0, step: '0.1' } }}
                        sx={{ flex: 0.8 }}
                      />
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => removeTaxLine(index)}
                        sx={{ mt: 0.5 }}
                        aria-label="Remove tax line"
                      >
                        <X size={18} />
                      </IconButton>
                    </Box>
                  ))}
                </Stack>
                {selectedOrder && computedTaxLines.length > 0 && (
                  <Paper variant="outlined" sx={{ p: 2, mt: 2, bgcolor: 'background.default' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                      Preview
                    </Typography>
                    {computedTaxLines.map((line, i) => (
                      <Box key={`${line.name}-${i}`} sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="body2">{line.name} ({line.rate}%)</Typography>
                        <Typography variant="body2">₹ {line.amount.toLocaleString()}</Typography>
                      </Box>
                    ))}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, pt: 1, borderTop: 1, borderColor: 'divider' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Grand Total</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>₹ {computedGrandTotal.toLocaleString()}</Typography>
                    </Box>
                  </Paper>
                )}
              </Box>

              <TextField
                fullWidth
                multiline
                rows={2}
                label="Notes (optional)"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpen(false)} color="inherit">Cancel</Button>
            <Button variant="contained" onClick={handleCreate} disabled={submitting || !form.transaction_out_id}>
              {submitting ? 'Creating...' : 'Create & Issue'}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)} maxWidth="xs" fullWidth>
          <DialogTitle>Delete Invoice</DialogTitle>
          <DialogContent>
            <Typography>Delete invoice <strong>{deleteTarget?.invoice_number}</strong>?</Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setDeleteTarget(null)} color="inherit">Cancel</Button>
            <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
          </DialogActions>
        </Dialog>

        <Toast />
      </Box>
    </Fade>
  );
}
