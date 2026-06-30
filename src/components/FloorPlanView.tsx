import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, Grid, Chip, Tooltip, CircularProgress, Stack } from '@mui/material';
import { Thermometer, MapPin } from 'lucide-react';
import { useSelector } from 'react-redux';
import { type RootState } from '../store/store';

interface FloorPlanChamber {
  id: number;
  name: string;
  zone?: string;
  status: string;
  temperature_c: number;
  current_temperature_c: number;
  occupancy_percent: number;
  grid: { rows: number; columns: number; levels: number };
  slots: Array<{
    manifest_id: number;
    row?: string;
    column?: string;
    level?: string;
    item_type: string;
    crates: number;
    quality_grade?: string;
  }>;
}

export default function FloorPlanView() {
  const [plan, setPlan] = useState<FloorPlanChamber[]>([]);
  const [updatedAt, setUpdatedAt] = useState('');
  const [loading, setLoading] = useState(true);
  const token = useSelector((state: RootState) => state.auth.token);

  const fetchPlan = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/chambers/floor-plan`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPlan(data.chambers || []);
        setUpdatedAt(data.updated_at || '');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchPlan();
    const interval = setInterval(fetchPlan, 15000);
    return () => clearInterval(interval);
  }, [token]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 6 }}><CircularProgress /></Box>;
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Live Floor Plan</Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time chamber analytics {updatedAt && `— updated ${new Date(updatedAt).toLocaleTimeString()}`}
          </Typography>
        </Box>
        <Chip icon={<Thermometer size={14} />} label="Live telemetry" color="success" size="small" variant="outlined" />
      </Stack>

      <Grid container spacing={3}>
        {plan.map((chamber) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={chamber.id}>
            <Paper sx={{ p: 2, border: '1px solid', borderColor: 'divider', height: '100%' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>{chamber.name}</Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <MapPin size={12} />
                    <Typography variant="caption" color="text.secondary">{chamber.zone || 'Unzoned'}</Typography>
                  </Stack>
                </Box>
                <Chip label={chamber.status} size="small" color={chamber.status === 'Active' ? 'success' : 'warning'} />
              </Stack>

              <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <Typography variant="caption">Target: {chamber.temperature_c}°C</Typography>
                <Typography variant="caption">Current: {chamber.current_temperature_c}°C</Typography>
                <Typography variant="caption">Occ: {chamber.occupancy_percent}%</Typography>
              </Stack>

              <Box sx={{
                display: 'grid',
                gridTemplateColumns: `repeat(${Math.min(chamber.grid.columns, 8)}, 1fr)`,
                gap: 0.5,
                bgcolor: 'action.hover',
                p: 1,
                borderRadius: 1,
                minHeight: 80,
              }}>
                {Array.from({ length: Math.min(chamber.grid.rows * chamber.grid.columns, 32) }, (_, i) => {
                  const row = Math.floor(i / chamber.grid.columns) + 1;
                  const col = (i % chamber.grid.columns) + 1;
                  const occupied = chamber.slots.some((s) =>
                    (s.row && s.row.includes(String(row))) || (s.column && s.column.includes(String(col)))
                  );
                  const slot = chamber.slots.find((s) => s.row?.includes(String(row)) && s.column?.includes(String(col)));
                  return (
                    <Tooltip key={i} title={slot ? `#${slot.manifest_id} ${slot.item_type} (${slot.crates} crates)` : `R${row}C${col} — available`}>
                      <Box sx={{
                        aspectRatio: '1',
                        borderRadius: 0.5,
                        bgcolor: occupied ? 'primary.main' : 'background.paper',
                        opacity: occupied ? 0.85 : 0.4,
                        border: '1px solid',
                        borderColor: 'divider',
                        cursor: 'pointer',
                      }} />
                    </Tooltip>
                  );
                })}
              </Box>

              {chamber.slots.length > 0 && (
                <Box sx={{ mt: 1.5 }}>
                  {chamber.slots.map((s) => (
                    <Typography key={s.manifest_id} variant="caption" display="block" color="text.secondary">
                      #{s.manifest_id} @ {s.row || '?'}-{s.column || '?'}-{s.level || '?'} — {s.crates} crates
                    </Typography>
                  ))}
                </Box>
              )}
            </Paper>
          </Grid>
        ))}
        {plan.length === 0 && (
          <Grid size={{ xs: 12 }}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">No chambers configured. Add chambers to view the floor plan.</Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
