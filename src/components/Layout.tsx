import React, { useState, useEffect } from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton, Button } from '@mui/material';
import { Menu, Sun, Moon, LogOut } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { DRAWER_WIDTH, MINI_DRAWER_WIDTH } from '../constants/layout';
import { useThemeContext } from '../context/ThemeContext';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';
import { useNavigate, Outlet } from 'react-router-dom';

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(true);
  const { mode, toggleColorMode } = useThemeContext();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { xs: '100%', sm: `calc(100% - ${mobileOpen ? DRAWER_WIDTH : MINI_DRAWER_WIDTH}px)` },
          ml: { xs: 0, sm: `${mobileOpen ? DRAWER_WIDTH : MINI_DRAWER_WIDTH}px` },
          transition: (theme) => theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          zIndex: (theme) => theme.zIndex.drawer + 1,
          bgcolor: (theme) => theme.palette.mode === 'light' ? 'rgba(249, 250, 251, 0.8)' : 'rgba(22, 28, 36, 0.8)',
          backdropFilter: 'blur(6px)',
          color: 'text.primary',
          borderBottom: '1px dashed rgba(145, 158, 171, 0.24)',
        }}
      >
        <Toolbar>
          <Box sx={{ flexGrow: 1 }} />
          <IconButton sx={{ ml: 1 }} onClick={toggleColorMode} color="inherit">
            {mode === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
          </IconButton>
          <Button color="inherit" onClick={handleLogout} startIcon={<LogOut size={20} />}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>
      
      <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} onDrawerOpen={() => setMobileOpen(true)} />

      <Box
        component="main"
        sx={{ 
            flexGrow: 1, 
            p: 3, 
            transition: (theme) => theme.transitions.create('margin', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
            })
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
