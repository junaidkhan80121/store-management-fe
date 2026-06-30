import React, { useState, useEffect } from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton, Button, useTheme } from '@mui/material';
import { Menu, Sun, Moon, LogOut } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { DRAWER_WIDTH, MINI_DRAWER_WIDTH } from '../constants/layout';
import { useLayoutBreakpoints } from '../hooks/useLayoutBreakpoints';
import { useThemeContext } from '../context/ThemeContext';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';
import { type RootState } from '../store/store';
import { useNavigate, Outlet } from 'react-router-dom';
import AuthSessionWatcher from './AuthSessionWatcher';
import { API_BASE } from '../lib/auth';

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isOverlay } = useLayoutBreakpoints();
  const theme = useTheme();
  const { mode, toggleColorMode } = useThemeContext();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const refreshToken = useSelector((state: RootState) => state.auth.refreshToken);

  useEffect(() => {
    setMobileOpen(!isOverlay);
  }, [isOverlay]);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const handleLogout = async () => {
    if (refreshToken) {
      try {
        await fetch(`${API_BASE}/token/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      } catch {
        // still clear local session
      }
    }
    dispatch(logout());
    navigate('/login');
  };

  const drawerOffset = mobileOpen ? DRAWER_WIDTH : MINI_DRAWER_WIDTH;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>
      <AuthSessionWatcher />
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: {
            xs: '100%',
            md: `calc(100% - ${drawerOffset}px)`,
          },
          ml: {
            xs: 0,
            md: `${drawerOffset}px`,
          },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          zIndex: theme.zIndex.drawer + 1,
          bgcolor: (t) => (t.palette.mode === 'light' ? 'rgba(249, 250, 251, 0.8)' : 'rgba(22, 28, 36, 0.8)'),
          backdropFilter: 'blur(6px)',
          color: 'text.primary',
          borderBottom: '1px dashed rgba(145, 158, 171, 0.24)',
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 }, px: { xs: 1.5, sm: 2 } }}>
          {isOverlay && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              aria-label="Open navigation menu"
              sx={{ mr: 1 }}
            >
              <Menu size={22} />
            </IconButton>
          )}
          {isOverlay && (
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, display: { xs: 'block', sm: 'none' }, mr: 1 }}
              noWrap
            >
              Cold Store
            </Typography>
          )}
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 } }}>
            <IconButton onClick={toggleColorMode} color="inherit" aria-label="Toggle theme" size="large">
              {mode === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
            </IconButton>
            <Button
              color="inherit"
              onClick={handleLogout}
              startIcon={<LogOut size={20} />}
              sx={{ minWidth: { xs: 40, sm: 64 }, px: { xs: 1, sm: 2 } }}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                Logout
              </Box>
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      <Sidebar
        mobileOpen={mobileOpen}
        handleDrawerToggle={handleDrawerToggle}
        onDrawerOpen={() => setMobileOpen(true)}
        onDrawerClose={() => setMobileOpen(false)}
      />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1.5, sm: 2, md: 3 },
          width: '100%',
          minWidth: 0,
          maxWidth: '100%',
          overflowX: 'hidden',
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }} />
        <Outlet />
      </Box>
    </Box>
  );
}
