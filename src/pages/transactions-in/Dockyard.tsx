import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, Fade, Button, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';
import { Truck, ArrowRightCircle } from 'lucide-react';
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

export default function Dockyard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  
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

  const handleOffload = async (id: number) => {
    setProcessingId(id);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/transactions-in/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({ status: 'DOCKYARD' })
      });

      if (response.ok) {
        fetchDockyardQueue(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <Fade in={true} timeout={500}>
      <Box sx={{ p: 3, maxWidth: 1000, margin: '0 auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'secondary.main', color: 'secondary.contrastText', mr: 2, display: 'flex' }}>
            <Truck size={24} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: "bold" }} color="text.primary">
            Dockyard Offloading
          </Typography>
        </Box>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Manage vehicles that have passed Quality Control and are currently offloading in the dockyard.
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
              <Typography color="text.secondary">No vehicles currently in the dockyard queue.</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.02)' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Manifest</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Vehicle</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Item</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Quality Grade</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Load Size</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id} hover>
                      <TableCell>#{tx.id}</TableCell>
                      <TableCell>
                        <Chip label={tx.vehicle_number || 'N/A'} size="small" />
                      </TableCell>
                      <TableCell>{tx.item_type}</TableCell>
                      <TableCell>
                        <Chip 
                          label={tx.quality_grade || 'Unknown'} 
                          color="success" 
                          variant="outlined" 
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{tx.crates_count} Crates ({tx.total_weight_kg}kg)</TableCell>
                      <TableCell>
                        <Button 
                          variant="contained" 
                          color="secondary" 
                          size="small"
                          disabled={processingId === tx.id}
                          onClick={() => handleOffload(tx.id)}
                          startIcon={processingId === tx.id ? <CircularProgress size={16} color="inherit" /> : <ArrowRightCircle size={16} />}
                        >
                          Mark Offloaded
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Paper>
      </Box>
    </Fade>
  );
}
