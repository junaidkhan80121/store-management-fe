import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, Fade, Button, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from '@mui/material';
import { Truck, ArrowRightCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../store/store';
import { pageContainerSx } from '../../constants/responsive';

interface Transaction {
  id: number;
  grower_name?: string;
  vehicle_number: string | null;
  item_type: string;
  crates_count: number;
  total_weight_kg: number;
  quality_grade: string | null;
  product_temperature_c?: number;
  bruising_ratio_percent?: number;
}

const DOCKYARD_BAYS = ['Dock 1', 'Dock 2', 'Dock 3', 'Dock 4', 'Cold Bay 5'];
const EQUIPMENT = ['Forklift F-01', 'Forklift F-02', 'Conveyor C-01', 'Pallet Jack P-03'];
const TERMINAL_STATUSES = ['IDLE', 'OFFLOADING', 'QUEUED', 'COMPLETE'];

export default function Dockyard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [dockyardBay, setDockyardBay] = useState('');
  const [equipmentId, setEquipmentId] = useState('');
  const [terminalStatus, setTerminalStatus] = useState('OFFLOADING');
  const [processing, setProcessing] = useState(false);
  const token = useSelector((state: RootState) => state.auth.token);

  const fetchDockyardQueue = useCallback(async (isMounted: boolean) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/transactions-in?status=QUALITY`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (isMounted) setTransactions(data.items || []);
      }
    } catch (err) {
      console.error("Failed to fetch dockyard queue", err);
    } finally {
      if (isMounted) setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    let isMounted = true;
    fetchDockyardQueue(isMounted);
    return () => { isMounted = false; };
  }, [fetchDockyardQueue]);

  const handleOffload = async () => {
    if (!selectedTx) return;
    setProcessing(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/transactions-in/${selectedTx.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          status: 'DOCKYARD',
          dockyard_bay: dockyardBay || null,
          equipment_id: equipmentId || null,
          terminal_status: terminalStatus,
        })
      });
      if (response.ok) {
        setSelectedTx(null);
        setDockyardBay('');
        setEquipmentId('');
        fetchDockyardQueue(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Fade in={true} timeout={500}>
      <Box sx={pageContainerSx}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'secondary.main', color: 'secondary.contrastText', mr: 2, display: 'flex' }}>
            <Truck size={24} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: "bold" }} color="text.primary">Dockyard Offloading</Typography>
        </Box>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Track terminal status, assign physical bays, and log material-handling equipment utilization.
        </Typography>

        <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>
          ) : transactions.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">No vehicles in dockyard queue.</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Manifest</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Grower</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Vehicle</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Grade</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Temp (°C)</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Bruising %</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Load</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id} hover>
                      <TableCell>#{tx.id}</TableCell>
                      <TableCell>{tx.grower_name || '—'}</TableCell>
                      <TableCell><Chip label={tx.vehicle_number || 'N/A'} size="small" /></TableCell>
                      <TableCell><Chip label={tx.quality_grade || '—'} color="success" variant="outlined" size="small" /></TableCell>
                      <TableCell>{tx.product_temperature_c ?? '—'}</TableCell>
                      <TableCell>{tx.bruising_ratio_percent ?? '—'}</TableCell>
                      <TableCell>{tx.crates_count} crates ({tx.total_weight_kg}kg)</TableCell>
                      <TableCell>
                        <Button variant="contained" color="secondary" size="small" onClick={() => setSelectedTx(tx)}
                          startIcon={<ArrowRightCircle size={16} />}>Assign Bay</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        <Dialog open={!!selectedTx} onClose={() => setSelectedTx(null)} maxWidth="sm" fullWidth>
          <DialogTitle>Dockyard Assignment — #{selectedTx?.id}</DialogTitle>
          <DialogContent dividers>
            <TextField select fullWidth label="Dockyard Bay" value={dockyardBay} onChange={(e) => setDockyardBay(e.target.value)} sx={{ mb: 2 }}>
              {DOCKYARD_BAYS.map((b) => <MenuItem key={b} value={b}>{b}</MenuItem>)}
            </TextField>
            <TextField select fullWidth label="Equipment" value={equipmentId} onChange={(e) => setEquipmentId(e.target.value)} sx={{ mb: 2 }}>
              {EQUIPMENT.map((e) => <MenuItem key={e} value={e}>{e}</MenuItem>)}
            </TextField>
            <TextField select fullWidth label="Terminal Status" value={terminalStatus} onChange={(e) => setTerminalStatus(e.target.value)}>
              {TERMINAL_STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </TextField>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setSelectedTx(null)} color="inherit">Cancel</Button>
            <Button onClick={handleOffload} variant="contained" color="secondary" disabled={processing || !dockyardBay}
              startIcon={processing ? <CircularProgress size={16} color="inherit" /> : <ArrowRightCircle size={16} />}>
              Mark Offloaded
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  );
}
