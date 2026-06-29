import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, Fade, Button, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from '@mui/material';
import { Grid as GridIcon, CheckCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../store/store';

interface Transaction {
  id: number;
  item_type: string;
  crates_count: number;
  total_weight_kg: number;
  quality_grade: string | null;
}

interface Chamber {
  id: number;
  name: string;
  capacity_crates: number;
}

export default function Slotting() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [chambers, setChambers] = useState<Chamber[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [chamberId, setChamberId] = useState<number | ''>('');
  const [processing, setProcessing] = useState(false);
  
  const token = useSelector((state: RootState) => state.auth.token);

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
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/chambers`, {
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

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/transactions-in/${selectedTx.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ 
          status: 'SLOTTED',
          chamber_id: chamberId
        })
      });

      if (response.ok) {
        setSelectedTx(null);
        setChamberId('');
        fetchSlottingQueue(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Fade in={true} timeout={500}>
      <Box sx={{ p: 3, maxWidth: 1000, margin: '0 auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'info.main', color: 'info.contrastText', mr: 2, display: 'flex' }}>
            <GridIcon size={24} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }} color="text.primary">
            Chamber Slotting
          </Typography>
        </Box>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Assign offloaded grower stock into specific cold storage chambers.
        </Typography>

        <Paper 
          elevation={0}
          sx={{ 
            borderRadius: 3, 
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden'
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : transactions.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">No stock waiting to be slotted into chambers.</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Manifest</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Item Type</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Crates</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Weight (kg)</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Grade</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id} hover>
                      <TableCell>#{tx.id}</TableCell>
                      <TableCell>{tx.item_type}</TableCell>
                      <TableCell>{tx.crates_count}</TableCell>
                      <TableCell>{tx.total_weight_kg}</TableCell>
                      <TableCell>
                        <Chip label={tx.quality_grade || 'Unknown'} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="contained" 
                          color="info" 
                          size="small"
                          onClick={() => setSelectedTx(tx)}
                        >
                          Assign Chamber
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>

        <Dialog open={!!selectedTx} onClose={() => setSelectedTx(null)} maxWidth="sm" fullWidth>
          <DialogTitle>Assign Chamber - Manifest #{selectedTx?.id}</DialogTitle>
          <DialogContent dividers>
            <Typography variant="body2" sx={{ mb: 3 }} color="text.secondary">
              Select the destination chamber for {selectedTx?.crates_count} crates of {selectedTx?.item_type}.
            </Typography>
            <TextField
              select
              fullWidth
              label="Select Chamber"
              value={chamberId}
              onChange={(e) => setChamberId(Number(e.target.value))}
            >
              {chambers.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name} (Capacity: {c.capacity_crates} crates)
                </MenuItem>
              ))}
              {chambers.length === 0 && (
                <MenuItem disabled value="">No chambers available</MenuItem>
              )}
            </TextField>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button onClick={() => setSelectedTx(null)} color="inherit">Cancel</Button>
            <Button 
              onClick={handleSlot} 
              variant="contained" 
              color="info"
              disabled={processing || !chamberId}
              startIcon={processing ? <CircularProgress size={16} color="inherit" /> : <CheckCircle size={16} />}
            >
              Confirm Slotting
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  );
}
