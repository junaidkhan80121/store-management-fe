import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, Fade, Button, CircularProgress, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem } from '@mui/material';
import { CheckSquare, CheckCircle, XCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../store/store';

interface Transaction {
  id: number;
  grower_id: number;
  vehicle_number: string | null;
  item_type: string;
  crates_count: number;
  total_weight_kg: number;
  quality_grade: string | null;
}

export default function Quality() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [grade, setGrade] = useState('Grade A');
  const [notes, setNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  
  const token = useSelector((state: RootState) => state.auth.token);

  const fetchPendingQuality = useCallback(async (isMounted: boolean) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/transactions-in?status=PREINWARD`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        if (isMounted) setTransactions(data.items || []);
      }
    } catch (err) {
      console.error("Failed to fetch preinward transactions", err);
    } finally {
      if (isMounted) setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    let isMounted = true;
    fetchPendingQuality(isMounted);
    return () => { isMounted = false; };
  }, [fetchPendingQuality]);

  const handleApprove = async () => {
    if (!selectedTx) return;
    setProcessing(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/transactions-in/${selectedTx.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          status: 'QUALITY',
          quality_grade: grade,
          quality_notes: notes
        })
      });

      if (response.ok) {
        setSelectedTx(null);
        setGrade('Grade A');
        setNotes('');
        fetchPendingQuality(true); // Refresh list
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
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'warning.main', color: 'warning.contrastText', mr: 2, display: 'flex' }}>
            <CheckSquare size={24} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }} color="text.primary">
            Quality Control
          </Typography>
        </Box>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Verify and grade arriving stock before allowing them to proceed to the dockyard.
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
              <Typography color="text.secondary">No stock currently awaiting quality check.</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Manifest ID</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Grower</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Vehicle</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Item</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Details</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id} hover>
                      <TableCell>#{tx.id}</TableCell>
                      <TableCell>{tx.grower_id}</TableCell>
                      <TableCell>
                        <Chip label={tx.vehicle_number || 'N/A'} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{tx.item_type}</TableCell>
                      <TableCell>{tx.crates_count} Crates ({tx.total_weight_kg}kg)</TableCell>
                      <TableCell>
                        <Button 
                          variant="contained" 
                          color="warning" 
                          size="small"
                          onClick={() => setSelectedTx(tx)}
                        >
                          Grade Stock
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
          <DialogTitle>Quality Verification - Manifest #{selectedTx?.id}</DialogTitle>
          <DialogContent dividers>
            <Box sx={{ mb: 3 }}>
              <TextField
                select
                fullWidth
                label="Quality Grade"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                sx={{ mb: 2 }}
              >
                <MenuItem value="Grade A">Grade A (Premium)</MenuItem>
                <MenuItem value="Grade B">Grade B (Standard)</MenuItem>
                <MenuItem value="Grade C">Grade C (Juice)</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
              </TextField>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Quality Notes (Optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2, pt: 0 }}>
            <Button onClick={() => setSelectedTx(null)} color="inherit">Cancel</Button>
            <Button 
              onClick={handleApprove} 
              variant="contained" 
              color={grade === 'Rejected' ? 'error' : 'success'}
              disabled={processing}
              startIcon={processing ? <CircularProgress size={16} /> : (grade === 'Rejected' ? <XCircle size={16}/> : <CheckCircle size={16} />)}
            >
              {grade === 'Rejected' ? 'Reject Stock' : 'Approve & Move to Dockyard'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  );
}
