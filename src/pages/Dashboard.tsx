import React, { useState, useEffect } from 'react';
import { 
  Typography, Grid, Paper, Box, Stack, Divider, Button, 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip
} from '@mui/material';
import { useSelector } from 'react-redux';
import { type RootState } from '../store/store';
import { 
  TrendingUp, CheckCircle2, PieChart, Package, Download, 
  FileText, Activity, AlertTriangle, Settings2 
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/dashboard/stats`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          throw new Error("Failed");
        }
      } catch (error) {
        setStats({
            total_chambers: 42,
            active_chambers: 38,
            capacity_used_percent: 82,
            total_inventory_items: 1284
        });
      }
    };
    if (token) fetchStats();
  }, [token]);

  return (
    <Box sx={{ maxWidth: 1440, mx: 'auto', pt: 2, pb: 4 }}>
      {/* Hero Metrics */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="overline" color="text.secondary" sx={{ fontWeight: '700' }}>Total Chambers</Typography>
                <Typography variant="h3" color="primary.main" sx={{ fontWeight: '600' }}>{stats ? stats.total_chambers : '...'}</Typography>
              </Box>
              <Box sx={{ p: 1.5, bgcolor: 'rgba(0, 167, 111, 0.16)', borderRadius: 2, height: 'fit-content' }}>
                <Package size={24} color="#00A76F" />
              </Box>
            </Box>
            <Stack direction="row" sx={{ alignItems: 'center', mt: 2, color: 'text.secondary' }} spacing={0.5}>
              <TrendingUp size={16} />
              <Typography variant="body2" sx={{ fontFamily: '"JetBrains Mono", monospace' }}>+2 this month</Typography>
            </Stack>
          </Paper>
        </Grid>
        
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="overline" color="text.secondary" sx={{ fontWeight: '700' }}>Active Chambers</Typography>
                <Typography variant="h3" color="primary.main" sx={{ fontWeight: '600' }}>{stats ? stats.active_chambers : '...'}</Typography>
              </Box>
              <Box sx={{ p: 1.5, bgcolor: 'rgba(0, 184, 217, 0.16)', borderRadius: 2, height: 'fit-content' }}>
                <Activity size={24} color="#00B8D9" />
              </Box>
            </Box>
            <Stack direction="row" sx={{ alignItems: 'center', mt: 2, color: 'primary.main' }} spacing={0.5}>
              <CheckCircle2 size={16} />
              <Typography variant="body2" sx={{ fontFamily: '"JetBrains Mono", monospace' }}>90.5% Operational</Typography>
            </Stack>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="overline" color="text.secondary" sx={{ fontWeight: '700' }}>Capacity Used</Typography>
                <Typography variant="h3" color="primary.main" sx={{ fontWeight: '600' }}>{stats ? `${stats.capacity_used_percent}%` : '...'}</Typography>
              </Box>
              <Box sx={{ p: 1.5, bgcolor: 'rgba(255, 171, 0, 0.16)', borderRadius: 2, height: 'fit-content' }}>
                <PieChart size={24} color="#FFAB00" />
              </Box>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Box sx={{ width: '100%', height: 8, bgcolor: 'divider', borderRadius: 4, overflow: 'hidden' }}>
                <Box sx={{ width: '82%', height: '100%', bgcolor: 'primary.main' }} />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>Critical threshold: 90%</Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Box>
                <Typography variant="overline" color="text.secondary" sx={{ fontWeight: '700' }}>Inventory Items</Typography>
                <Typography variant="h3" color="primary.main" sx={{ fontWeight: '600' }}>{stats ? stats.total_inventory_items : '...'}</Typography>
              </Box>
              <Box sx={{ p: 1.5, bgcolor: 'rgba(255, 86, 48, 0.16)', borderRadius: 2, height: 'fit-content' }}>
                <Package size={24} color="#FF5630" />
              </Box>
            </Box>
            <Stack direction="row" sx={{ alignItems: 'center', mt: 2, color: 'text.secondary' }} spacing={0.5}>
              <FileText size={16} />
              <Typography variant="body2" sx={{ fontFamily: '"JetBrains Mono", monospace' }}>Refreshed 2m ago</Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Removed Temperature Analytics and System Health Grids */}

      {/* Recent Activities Table */}
      <Paper sx={{ overflow: 'hidden', mt: 4 }}>
        <Box sx={{ p: 4, borderBottom: '1px dashed rgba(145, 158, 171, 0.24)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h5" sx={{ fontWeight: '600' }}>Overview</Typography>
          <Button variant="outlined" size="small" startIcon={<Settings2 size={16} />}>Filter</Button>
        </Box>
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">Check the Capacity page to view chamber details.</Typography>
        </Box>
      </Paper>
    </Box>
  );
}
