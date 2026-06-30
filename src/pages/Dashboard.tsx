import React, { useState, useEffect } from 'react';
import { 
  Typography, Grid, Paper, Box, Stack, Button, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, LinearProgress
} from '@mui/material';
import { useSelector } from 'react-redux';
import { type RootState } from '../store/store';
import { TrendingUp, CheckCircle2, PieChart, Package, Activity, Truck, Thermometer } from 'lucide-react';
import { pageContainerSx, pageHeaderSx, pageTitleSx } from '../constants/responsive';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/dashboard/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) setStats(await response.json());
      } catch (error) {
        console.error(error);
      }
    };
    if (token) fetchStats();
    const interval = setInterval(() => { if (token) fetchStats(); }, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const capacityPercent = stats?.capacity_used_percent ?? 0;

  return (
    <Box sx={pageContainerSx}>
      <Typography sx={{ ...pageTitleSx, mb: { xs: 2, sm: 4 } }}>Central Monitoring & Fleet Telemetry</Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { label: 'Total Chambers', value: stats?.total_chambers ?? '—', icon: <Package size={24} color="#00A76F" />, bg: 'rgba(0, 167, 111, 0.16)' },
          { label: 'Active Chambers', value: stats?.active_chambers ?? '—', icon: <Activity size={24} color="#00B8D9" />, bg: 'rgba(0, 184, 217, 0.16)' },
          { label: 'Capacity Used', value: stats ? `${capacityPercent}%` : '—', icon: <PieChart size={24} color="#FFAB00" />, bg: 'rgba(255, 171, 0, 0.16)' },
          { label: 'Slotted Lots', value: stats?.slotted_lots ?? '—', icon: <CheckCircle2 size={24} color="#22C55E" />, bg: 'rgba(34, 197, 94, 0.16)' },
        ].map((card) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={card.label}>
            <Paper sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>{card.label}</Typography>
                <Typography variant="h3" color="primary.main" sx={{ fontWeight: 600 }}>{card.value}</Typography>
              </Box>
              <Box sx={{ p: 1.5, bgcolor: card.bg, borderRadius: 2 }}>{card.icon}</Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Truck size={20} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Fleet Telemetry</Typography>
            </Stack>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Manifest</TableCell>
                    <TableCell>Vehicle</TableCell>
                    <TableCell>Grower</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Bay</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(stats?.fleet_telemetry || []).map((f: any) => (
                    <TableRow key={f.manifest_id}>
                      <TableCell>#{f.manifest_id}</TableCell>
                      <TableCell>{f.vehicle_number || '—'}</TableCell>
                      <TableCell>{f.grower_name}</TableCell>
                      <TableCell><Chip label={f.status} size="small" /></TableCell>
                      <TableCell>{f.dockyard_bay || f.staging_bay || '—'}</TableCell>
                    </TableRow>
                  ))}
                  {(!stats?.fleet_telemetry || stats.fleet_telemetry.length === 0) && (
                    <TableRow><TableCell colSpan={5} align="center">No active fleet</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <Thermometer size={20} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Chamber Temperature Telemetry</Typography>
            </Stack>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Chamber</TableCell>
                    <TableCell>Zone</TableCell>
                    <TableCell>Target</TableCell>
                    <TableCell>Current</TableCell>
                    <TableCell>Occupancy</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(stats?.chamber_telemetry || []).map((c: any) => (
                    <TableRow key={c.id}>
                      <TableCell>{c.name}</TableCell>
                      <TableCell>{c.zone || '—'}</TableCell>
                      <TableCell>{c.target_temperature_c}°C</TableCell>
                      <TableCell>{c.current_temperature_c}°C</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LinearProgress variant="determinate" value={c.occupancy_percent} sx={{ flex: 1, height: 6, borderRadius: 3 }} />
                          <Typography variant="caption">{c.occupancy_percent}%</Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Inbound Pipeline</Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
              {stats?.inbound_pipeline && Object.entries(stats.inbound_pipeline).map(([k, v]: [string, any]) => (
                <Chip key={k} label={`${k}: ${v}`} variant="outlined" />
              ))}
            </Stack>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Outbound Pipeline</Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
              {stats?.outbound_pipeline && Object.entries(stats.outbound_pipeline).map(([k, v]: [string, any]) => (
                <Chip key={k} label={`${k.replace(/_/g, ' ')}: ${v}`} variant="outlined" color="primary" />
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ mt: 3, p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>System Capacity</Typography>
          <Stack direction="row" spacing={0.5} sx={{ color: 'text.secondary', alignItems: 'center' }}>
            <TrendingUp size={16} />
            <Typography variant="caption">Auto-refresh every 30s</Typography>
          </Stack>
        </Box>
        <LinearProgress variant="determinate" value={capacityPercent} sx={{ height: 10, borderRadius: 5 }} color={capacityPercent > 90 ? 'error' : capacityPercent > 75 ? 'warning' : 'primary'} />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Critical threshold: 90% — currently at {capacityPercent}%
        </Typography>
      </Paper>
    </Box>
  );
}
