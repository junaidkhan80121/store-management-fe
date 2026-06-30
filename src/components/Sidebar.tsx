import React, { useState } from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Box, ListItemButton, useTheme, useMediaQuery, Typography, IconButton, Collapse } from '@mui/material';
import { LayoutDashboard, Box as BoxIcon, Settings, Menu, Users, Leaf, Trees, ArrowDownToLine, ArrowUpFromLine, Activity, ChevronDown, ChevronRight, CheckSquare, Truck, Grid, Calendar, PackageSearch, PackageCheck, Send, FileText, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { type RootState } from '../store/store';

const drawerWidth = 280;
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

  const [openGroups, setOpenGroups] = useState<{ [key: string]: boolean }>({});

  const toggleGroup = (groupName: string) => {
    setOpenGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  const menuConfig = [
    { text: 'Dashboard', icon: <LayoutDashboard size={24} />, path: '/dashboard' },
    { 
      text: 'Grower Management', icon: <Trees size={24} />, 
      children: [
        { text: 'Grower Group', path: '/grower-groups' },
        { text: 'Growers', path: '/growers' },
        { text: 'Reports', path: '/growers/reports' }
      ]
    },
    {
      text: 'Transactions In', icon: <ArrowDownToLine size={24} />,
      children: [
        { text: 'Preinward', icon: <FileText size={20} />, path: '/transactions-in/preinward' },
        { text: 'Quality', icon: <CheckSquare size={20} />, path: '/transactions-in/quality' },
        { text: 'Dockyard', icon: <Truck size={20} />, path: '/transactions-in/dockyard' },
        { text: 'Chamber Location', icon: <Grid size={20} />, path: '/transactions-in/slotting' }
      ]
    },
    { text: 'View Chambers', icon: <BoxIcon size={24} />, path: '/capacity' },
    {
      text: 'Transactions Out', icon: <ArrowUpFromLine size={24} />,
      children: [
        { text: 'Calendar', icon: <Calendar size={20} />, path: '/transactions-out/calendar' },
        { text: 'Demand Order', icon: <FileText size={20} />, path: '/transactions-out/demand' },
        { text: 'Store Out', icon: <PackageSearch size={20} />, path: '/transactions-out/store-out' },
        { text: 'Packing Draft', icon: <PackageCheck size={20} />, path: '/transactions-out/packing-draft' },
        { text: 'Packing Order', icon: <PackageCheck size={20} />, path: '/transactions-out/packing-order' },
        { text: 'Dispatch', icon: <Send size={20} />, path: '/transactions-out/dispatch' },
        { text: 'Final OutWard', icon: <LogOut size={20} />, path: '/transactions-out/final-outward' },
      ]
    },
    { text: 'Transactions In Reports', icon: <Activity size={24} />, path: '/reports/inbound' },
    { text: 'Transactions Out Reports', icon: <Activity size={24} />, path: '/reports/outbound' },
    { text: 'Settings', icon: <Settings size={24} />, path: '/settings' },
  ];

  if (role === 'admin') {
    menuConfig.push({ text: 'Admin Panel', icon: <Users size={24} />, path: '/admin' });
  }

  const renderNavItem = (item: any, depth = 0) => {
    const isParent = !!item.children;
    const active = item.path ? location.pathname === item.path : false;
    const isOpen = openGroups[item.text];
    
    // Check if any child is active to keep parent highlighted/open
    const isChildActive = isParent && item.children.some((child: any) => location.pathname === child.path);

    return (
      <React.Fragment key={item.text}>
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton 
            selected={active || (isChildActive && !isOpen)}
            onClick={() => {
              if (isParent) {
                toggleGroup(item.text);
              } else {
                navigate(item.path);
                if (isMobile) handleDrawerToggle();
              }
            }}
            sx={{
              borderRadius: 1,
              pl: depth === 0 ? 2 : 4,
              pr: 2,
              py: 1,
              ...(active && {
                bgcolor: 'rgba(0, 167, 111, 0.08)',
                color: 'primary.main',
                '&:hover': { bgcolor: 'rgba(0, 167, 111, 0.16)' }
              })
            }}
          >
            <ListItemIcon sx={{ 
              color: (active || isChildActive) ? 'primary.main' : 'text.secondary',
              minWidth: 40
            }}>
              {item.icon || <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'currentColor', ml: 1 }} />}
            </ListItemIcon>
            
            <ListItemText 
              primary={item.text} 
              slotProps={{
                primary: {
                  sx: {
                    fontWeight: active || isChildActive ? 600 : 500,
                    color: (active || isChildActive) ? 'primary.main' : 'text.secondary',
                    fontSize: depth === 0 ? '0.875rem' : '0.8125rem'
                  }
                }
              }} 
              sx={{ 
                opacity: mobileOpen ? 1 : 0, 
                transition: 'opacity 0.2s',
                width: mobileOpen ? 'auto' : 0, 
                m: 0,
                whiteSpace: 'nowrap'
              }}
            />
            
            {isParent && mobileOpen && (
              <Box sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
                {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </Box>
            )}
          </ListItemButton>
        </ListItem>
        
        {isParent && (
          <Collapse in={isOpen && mobileOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.children.map((child: any) => renderNavItem(child, depth + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

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
      <Box sx={{ overflow: 'auto', px: 2, pt: 1, pb: 4 }}>
        <List>
          {menuConfig.map((item) => renderNavItem(item))}
        </List>
      </Box>
    </div>
  );

  return (
    <Box component="nav" sx={{ width: { sm: mobileOpen ? drawerWidth : miniDrawerWidth }, flexShrink: { sm: 0 }, transition: 'width 0.3s' }}>
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
