import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Chip, CircularProgress, IconButton,
  Stack, Grid, Fade, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Table, TableBody, TableCell, TableHead, TableRow, TableContainer
} from '@mui/material';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { useSelector } from 'react-redux';
import { type RootState } from '../../store/store';
import { pageContainerSx, pageHeaderSx, pageTitleSx } from '../../constants/responsive';

const statusColors: Record<string, string> = {
  DEMAND_DRAFT: '#FFAB00',
  STORE_OUT: '#00B8D9',
  PACKING_DRAFT: '#8E33FF',
  PACKING: '#3366FF',
  DISPATCHED: '#22C55E',
  FINAL_OUTWARD: '#00A76F',
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function DispatchCalendar() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [calendarData, setCalendarData] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  const token = useSelector((state: RootState) => state.auth.token);
  const API = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const fetchCalendar = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/transactions-out/calendar?year=${year}&month=${month}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCalendarData(data.data || {});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCalendar(); }, [token, year, month]);

  const handlePrevMonth = () => {
    if (month === 1) { setMonth(12); setYear(year - 1); }
    else setMonth(month - 1);
  };

  const handleNextMonth = () => {
    if (month === 12) { setMonth(1); setYear(year + 1); }
    else setMonth(month + 1);
  };

  // Build calendar grid
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) calendarDays.push(null);
  for (let i = 1; i <= daysInMonth; i++) calendarDays.push(i);
  // Pad to complete the last week
  while (calendarDays.length % 7 !== 0) calendarDays.push(null);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  const getDateKey = (day: number) => {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const today = new Date();
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const totalOrders = Object.values(calendarData).reduce((sum, arr) => sum + arr.length, 0);
  const activeDays = Object.keys(calendarData).length;

  return (
    <Fade in timeout={500}>
      <Box sx={pageContainerSx}>
        <Box sx={{ mb: 5, display: 'flex', alignItems: 'center' }}>
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(0, 167, 111, 0.16)', mr: 2, display: 'flex' }}>
            <CalendarIcon size={24} color="#00A76F" />
          </Box>
          <Box>
            <Typography sx={pageTitleSx}>Dispatch Calendar</Typography>
            <Typography variant="body2" color="text.secondary">
              {totalOrders} orders across {activeDays} active days this month
            </Typography>
          </Box>
        </Box>

        {/* Summary stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {Object.entries(statusColors).map(([status, color]) => {
            const count = Object.values(calendarData).flat().filter((t: any) => t.status === status).length;
            return (
              <Grid size={{ xs: 6, sm: 4, md: 2 }} key={status}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color, mx: 'auto', mb: 1 }} />
                  <Typography variant="h5" sx={{ fontWeight: 700, color }}>{count}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    {status.replace(/_/g, ' ')}
                  </Typography>
                </Paper>
              </Grid>
            );
          })}
        </Grid>

        {/* Calendar */}
        <Paper sx={{ overflow: 'hidden' }}>
          {/* Header */}
          <Box sx={{ p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed rgba(145, 158, 171, 0.24)' }}>
            <IconButton onClick={handlePrevMonth}><ChevronLeft size={20} /></IconButton>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {MONTHS[month - 1]} {year}
            </Typography>
            <IconButton onClick={handleNextMonth}><ChevronRight size={20} /></IconButton>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 8 }}><CircularProgress /></Box>
          ) : (
            <Box sx={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <Box sx={{ minWidth: { xs: 640, sm: 'auto' }, p: 2 }}>
              {/* Day headers */}
              <Grid container>
                {DAYS.map((day) => (
                  <Grid size={{ xs: 12 / 7 }} key={day}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textAlign: 'center', display: 'block', py: 1 }}>
                      {day}
                    </Typography>
                  </Grid>
                ))}
              </Grid>

              {/* Calendar grid */}
              {weeks.map((week, wi) => (
                <Grid container key={wi}>
                  {week.map((day, di) => {
                    if (day === null) {
                      return <Grid size={{ xs: 12 / 7 }} key={`empty-${di}`}><Box sx={{ minHeight: 90, p: 1 }} /></Grid>;
                    }
                    const dateKey = getDateKey(day);
                    const dayOrders = calendarData[dateKey] || [];
                    const isToday = dateKey === todayKey;

                    return (
                      <Grid size={{ xs: 12 / 7 }} key={day}>
                        <Box
                          onClick={() => dayOrders.length > 0 ? setSelectedDay(dateKey) : null}
                          sx={{
                            minHeight: 90,
                            p: 1,
                            border: '1px solid',
                            borderColor: isToday ? 'primary.main' : 'divider',
                            borderRadius: 1,
                            m: 0.25,
                            cursor: dayOrders.length > 0 ? 'pointer' : 'default',
                            transition: 'all 0.2s',
                            bgcolor: isToday ? 'rgba(0, 167, 111, 0.04)' : 'transparent',
                            '&:hover': dayOrders.length > 0 ? { bgcolor: 'rgba(145, 158, 171, 0.08)', transform: 'scale(1.02)' } : {},
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: isToday ? 700 : 500,
                              color: isToday ? 'primary.main' : 'text.primary',
                              fontSize: '0.8rem'
                            }}
                          >
                            {day}
                          </Typography>
                          <Stack direction="row" spacing={0.3} sx={{ flexWrap: 'wrap', mt: 0.5, gap: 0.3 }}>
                            {dayOrders.slice(0, 4).map((order: any, idx: number) => (
                              <Box
                                key={idx}
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: '50%',
                                  bgcolor: statusColors[order.status] || '#919EAB',
                                }}
                              />
                            ))}
                            {dayOrders.length > 4 && (
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem', lineHeight: 1.5 }}>
                                +{dayOrders.length - 4}
                              </Typography>
                            )}
                          </Stack>
                          {dayOrders.length > 0 && (
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block', mt: 0.3 }}>
                              {dayOrders.length} order{dayOrders.length > 1 ? 's' : ''}
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              ))}
            </Box>
            </Box>
          )}
        </Paper>

        {/* Day Detail Dialog */}
        <Dialog open={!!selectedDay} onClose={() => setSelectedDay(null)} maxWidth="md" fullWidth>
          <DialogTitle>
            Orders for {selectedDay ? new Date(selectedDay + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : ''}
          </DialogTitle>
          <DialogContent>
            {selectedDay && calendarData[selectedDay] && (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Buyer</TableCell>
                      <TableCell>Destination</TableCell>
                      <TableCell>Crates</TableCell>
                      <TableCell>Weight</TableCell>
                      <TableCell>Vehicle</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {calendarData[selectedDay].map((order: any) => (
                      <TableRow key={order.id} hover>
                        <TableCell><Typography variant="subtitle2" sx={{ fontWeight: 600 }}>#{order.id}</Typography></TableCell>
                        <TableCell>{order.buyer_name || '—'}</TableCell>
                        <TableCell>{order.destination || '—'}</TableCell>
                        <TableCell>{order.crates_out}</TableCell>
                        <TableCell>{order.weight_out_kg} kg</TableCell>
                        <TableCell>{order.dispatch_vehicle || '—'}</TableCell>
                        <TableCell>
                          <Chip
                            label={order.status.replace(/_/g, ' ')}
                            size="small"
                            sx={{
                              bgcolor: `${statusColors[order.status] || '#919EAB'}20`,
                              color: statusColors[order.status] || '#919EAB',
                              fontWeight: 700,
                              fontSize: '0.7rem',
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={() => setSelectedDay(null)} color="inherit">Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Fade>
  );
}
