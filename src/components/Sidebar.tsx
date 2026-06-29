import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Box, ListItemButton, useTheme, useMediaQuery, Typography, IconButton } from '@mui/material';
import { LayoutDashboard, Box as BoxIcon, Settings, Menu, Users, Leaf, Trees } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { type RootState } from '../store/store';

const drawerWidth = 240;
const miniDrawerWidth = 88;

interface SidebarProps {
  mobileOpen: boolean;
  handleDrawerToggle: () => void;
}

export default function Sidebar({ mobileOpen, handleDrawerToggle }: SidebarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();
  const role = useSelector((state: RootState) => state.auth.role);

  const menuItems = [
    { text: 'Dashboard', icon: <LayoutDashboard size={24} />, path: '/dashboard' },
    { text: 'Grower Groups', icon: <Trees size={24} />, path: '/grower-groups' },
    { text: 'Growers', icon: <Leaf size={24} />, path: '/growers' },
    { text: 'Check Capacity', icon: <BoxIcon size={24} />, path: '/capacity' },
    { text: 'Settings', icon: <Settings size={24} />, path: '/settings' },
  ];

  if (role === 'admin') {
    menuItems.push({ text: 'Admin Panel', icon: <Users size={24} />, path: '/admin' });
  }

  const drawer = (
    <div>
      <Box sx={{ px: mobileOpen ? 2.5 : 0, py: 3, display: 'flex', alignItems: 'center', justifyContent: mobileOpen ? 'space-between' : 'center', transition: 'padding 0.2s' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', opacity: mobileOpen ? 1 : 0, width: mobileOpen ? 'auto' : 0, overflow: 'hidden', whiteSpace: 'nowrap', transition: 'opacity 0.2s, width 0.2s' }}>
          <Box sx={{ width: 32, height: 32, borderRadius: 1, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 1 }}>
            <span style={{ color: '#fff', fontWeight: 900, fontSize: 16 }}>C</span>
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: '700' }} color="text.primary">
            Cold Store
          </Typography>
        </Box>
        <IconButton onClick={handleDrawerToggle} color="inherit">
          <Menu size={20} />
        </IconButton>
      </Box>
      <Box sx={{ overflow: 'auto', px: 2, pt: 1 }}>
        <List>
          {menuItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <ListItem disablePadding key={item.text} sx={{ mb: 1 }}>
                <ListItemButton 
                  selected={active}
                  onClick={() => {
                    navigate(item.path);
                    if (isMobile) handleDrawerToggle();
                  }}
                  sx={{
                    borderRadius: 1,
                    ...(active && {
                      bgcolor: 'rgba(0, 167, 111, 0.08)',
                      color: 'primary.main',
                      '&:hover': {
                        bgcolor: 'rgba(0, 167, 111, 0.16)',
                      }
                    })
                  }}
                >
                  <ListItemIcon sx={{ 
                    color: active ? 'primary.main' : 'text.secondary',
                    minWidth: 40
                  }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText 
                    primary={item.text} 
                    slotProps={{
                      primary: {
                        sx: {
                          fontWeight: active ? 600 : 500,
                          color: active ? 'primary.main' : 'text.secondary'
                        }
                      }
                    }} 
                    sx={{ 
                      opacity: mobileOpen ? 1 : 0, 
                      transition: 'opacity 0.2s',
                      width: mobileOpen ? 'auto' : 0, 
                      overflow: 'hidden', 
                      whiteSpace: 'nowrap',
                      m: 0
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </div>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: mobileOpen ? drawerWidth : miniDrawerWidth }, flexShrink: { sm: 0 }, transition: 'width 0.3s' }}
    >
      <Drawer
        variant="temporary"
        open={isMobile && mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
        }}
      >
        {drawer}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: mobileOpen ? drawerWidth : miniDrawerWidth,
            borderRight: '1px dashed rgba(145, 158, 171, 0.24)',
            bgcolor: 'background.default',
            transition: (theme) => theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden'
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
}
