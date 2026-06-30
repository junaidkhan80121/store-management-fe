import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, Fade, Button, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Alert } from '@mui/material';
import { Grid as GridIcon, CheckCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../store/store';
import { pageContainerSx } from '../../constants/responsive';

interface Transaction {
  id: number;
  item_type: string;
  crates_count: number;
  total_weight_kg: number;
  quality_grade: string | null;
  required_temperature_c?: number;
}

interface Chamber {
  id: number;
  name: string;
  total_capacity: number;
  used_capacity: number;
  temperature_c?: number;
  zone?: string;
  row_count?: number;
  column_count?: number;
  level_count?: number;
}

export default function Slotting() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [chambers, setChambers] = useState<Chamber[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [chamberId, setChamberId] = useState<number | ''>('');
  const [slotRow, setSlotRow] = useState('');
  const [slotColumn, setSlotColumn] = useState('');
  const [slotLevel, setSlotLevel] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const token = useSelector((state: RootState) => state.auth.token);

  const selectedChamber = chambers.find((c) => c.id === chamberId);

  const fetchSlottingQueue = useCallback(async (isMounted: boolean) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/transactions-in?status=DOCKYARD`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (isMounted) setTransactions(data.items || []);
      }
    } catch (err) {
      console.error("Failed to fetch slotting queue", err);
    } finally {
      if (isMounted) setLoading(false);
    }
  }, [token]);

  const fetchChambers = useCallback(async (isMounted: boolean) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/chambers?limit=1000`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (isMounted) setChambers(data.items || []);
      }
    } catch (err) {
      console.error("Failed to fetch chambers", err);
    }
  }, [token]);

  useEffect(() => {
    let isMounted = true;
    fetchSlottingQueue(isMounted);
    fetchChambers(isMounted);
    return () => { isMounted = false; };
  }, [fetchSlottingQueue, fetchChambers]);

  const handleSlot = async () => {
    if (!selectedTx || !chamberId) return;
    setProcessing(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/transactions-in/${selectedTx.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          status: 'SLOTTED',
          chamber_id: chamberId,
          slot_row: slotRow || null,
          slot_column: slotColumn || null,
          slot_level: slotLevel || null,
        })
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Slotting failed');
      }

      setSelectedTx(null);
      setChamberId('');
      setSlotRow('');
      setSlotColumn('');
      setSlotLevel('');
      fetchSlottingQueue(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Slotting failed');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Fade in={true} timeout={500}>
      <Box sx={pageContainerSx}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'info.main', color: 'info.contrastText', mr: 2, display: 'flex' }}>
            <GridIcon size={24} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }} color="text.primary">Chamber Location</Typography>
        </Box>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Commit received lots to physical coordinates in cold vaults based on required temperature curves.
        </Typography>

        <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
          ) : transactions.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">No stock waiting for chamber slotting.</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                  <TableRow>
                    <TableCell>Manifest</TableCell>
                    <TableCell>Item</TableCell>
                    <TableCell>Crates</TableCell>
                    <TableCell>Weight</TableCell>
                    <TableCell>Req. Temp</TableCell>
                    <TableCell>Grade</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id} hover>
                      <TableCell>#{tx.id}</TableCell>
                      <TableCell>{tx.item_type}</TableCell>
                      <TableCell>{tx.crates_count}</TableCell>
                      <TableCell>{tx.total_weight_kg} kg</TableCell>
                      <TableCell>{tx.required_temperature_c ?? '—'}°C</TableCell>
                      <TableCell><Chip label={tx.quality_grade || '—'} size="small" variant="outlined" /></TableCell>
                      <TableCell>
                        <Button variant="contained" color="info" size="small" onClick={() => setSelectedTx(tx)}>Assign Chamber</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        <Dialog open={!!selectedTx} onClose={() => setSelectedTx(null)} maxWidth="sm" fullWidth>
          <DialogTitle>Chamber Slotting — #{selectedTx?.id}</DialogTitle>
          <DialogContent dividers>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            <TextField select fullWidth label="Select Chamber" value={chamberId} onChange={(e) => setChamberId(Number(e.target.value))} sx={{ mb: 2 }}>
              {chambers.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name} — {c.temperature_c}°C — {c.used_capacity}/{c.total_capacity} {c.zone ? `(${c.zone})` : ''}
                </MenuItem>
              ))}
            </TextField>
            {selectedChamber && selectedTx?.required_temperature_c != null && (
              <Alert severity={Math.abs((selectedChamber.temperature_c || 0) - selectedTx.required_temperature_c) > 1.5 ? 'warning' : 'info'} sx={{ mb: 2 }}>
                Lot requires {selectedTx.required_temperature_c}°C — chamber target is {selectedChamber.temperature_c}°C
              </Alert>
            )}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField fullWidth label="Row" value={slotRow} onChange={(e) => setSlotRow(e.target.value)} placeholder="R-01" />
              <TextField fullWidth label="Column" value={slotColumn} onChange={(e) => setSlotColumn(e.target.value)} placeholder="C-05" />
              <TextField fullWidth label="Level" value={slotLevel} onChange={(e) => setSlotLevel(e.target.value)} placeholder="L-2" />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setSelectedTx(null)} color="inherit">Cancel</Button>
            <Button onClick={handleSlot} variant="contained" color="info" disabled={processing || !chamberId}
              startIcon={processing ? <CircularProgress size={16} color="inherit" /> : <CheckCircle size={16} />}>
              Confirm Slotting
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  );
}
