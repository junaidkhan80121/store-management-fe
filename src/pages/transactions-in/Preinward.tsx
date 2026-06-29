import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Fade, TextField, MenuItem, Button, Alert, CircularProgress, Grid } from '@mui/material';
import { FileText, Send } from 'lucide-react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../store/store';

interface Grower {
  id: number;
  name: string;
  contact_number?: string;
}

export default function Preinward() {
  const [growers, setGrowers] = useState<Grower[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [growerId, setGrowerId] = useState<number | ''>('');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [itemType, setItemType] = useState('Apple');
  const [cratesCount, setCratesCount] = useState<number | ''>('');
  const [totalWeight, setTotalWeight] = useState<number | ''>('');
  
  const [submitStatus, setSubmitStatus] = useState<{type: 'success'|'error', message: string} | null>(null);
  const [submitting, setSubmitting] = useState(false);
  
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    let isMounted = true;
    const fetchGrowers = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/growers`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          if (isMounted) setGrowers(data.items || []);
        }
      } catch (err) {
        console.error("Failed to fetch growers", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchGrowers();
    return () => { isMounted = false; };
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!growerId) return;

    setSubmitting(true);
    setSubmitStatus(null);

    const payload = {
      grower_id: growerId,
      vehicle_number: vehicleNumber || null,
      item_type: itemType,
      crates_count: Number(cratesCount) || 0,
      total_weight_kg: Number(totalWeight) || 0.0
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/transactions-in/preinward`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to create manifest');
      
      setSubmitStatus({ type: 'success', message: 'Preinward manifest created successfully! Vehicle is now in Quality Queue.' });
      setVehicleNumber('');
      setCratesCount('');
      setTotalWeight('');
      setGrowerId('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setSubmitStatus({ type: 'error', message: err.message });
      } else {
        setSubmitStatus({ type: 'error', message: 'An error occurred' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Fade in={true} timeout={500}>
      <Box sx={{ p: 3, maxWidth: 800, margin: '0 auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'primary.main', color: 'primary.contrastText', mr: 2, display: 'flex' }}>
            <FileText size={24} />
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }} color="text.primary">
            Preinward Manifest
          </Typography>
        </Box>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Initialize a new inbound manifest for arriving grower stock.
        </Typography>

        {submitStatus && (
          <Alert severity={submitStatus.type} sx={{ mb: 3 }}>
            {submitStatus.message}
          </Alert>
        )}

        <Paper 
          elevation={0}
          component="form"
          onSubmit={handleSubmit}
          sx={{ 
            p: 4, 
            borderRadius: 3, 
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={3}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  select
                  fullWidth
                  required
                  label="Select Grower"
                  value={growerId}
                  onChange={(e) => setGrowerId(Number(e.target.value))}
                >
                  {growers.map((grower) => (
                    <MenuItem key={grower.id} value={grower.id}>
                      {grower.name} {grower.contact_number ? `(${grower.contact_number})` : ''}
                    </MenuItem>
                  ))}
                  {growers.length === 0 && (
                    <MenuItem disabled value="">No growers found. Please add a grower first.</MenuItem>
                  )}
                </TextField>
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Vehicle Number (Optional)"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value)}
                  placeholder="e.g. JK01AB1234"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  required
                  label="Item Type"
                  value={itemType}
                  onChange={(e) => setItemType(e.target.value)}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  required
                  type="number"
                  label="Crates Count"
                  value={cratesCount}
                  onChange={(e) => setCratesCount(e.target.value === '' ? '' : Number(e.target.value))}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  required
                  type="number"
                  label="Total Weight (KG)"
                  value={totalWeight}
                  onChange={(e) => setTotalWeight(e.target.value === '' ? '' : Number(e.target.value))}
                  slotProps={{ htmlInput: { step: "0.1" } }}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  size="large" 
                  disabled={submitting || !growerId}
                  startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <Send size={20} />}
                  sx={{ mt: 2, px: 4, py: 1.5, borderRadius: 2 }}
                >
                  {submitting ? 'Creating Manifest...' : 'Initialize Manifest'}
                </Button>
              </Grid>
            </Grid>
          )}
        </Paper>
      </Box>
    </Fade>
  );
}
