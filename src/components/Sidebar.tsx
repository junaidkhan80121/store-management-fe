import React, { useState } from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Box, ListItemButton, Typography, IconButton, Collapse } from '@mui/material';
import { LayoutDashboard, Box as BoxIcon, Settings, Menu, Users, Trees, ArrowDownToLine, ArrowUpFromLine, Activity, ChevronDown, ChevronRight, CheckSquare, Truck, Grid, Calendar, PackageSearch, PackageCheck, Send, FileText, LogOut, Receipt } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { type RootState } from '../store/store';
import { DRAWER_WIDTH, MINI_DRAWER_WIDTH } from '../constants/layout';
import { useLayoutBreakpoints } from '../hooks/useLayoutBreakpoints';

interface SidebarProps {
  mobileOpen: boolean;
  handleDrawerToggle: () => void;
  onDrawerOpen: () => void;
  onDrawerClose: () => void;
}

export default function Sidebar({ mobileOpen, handleDrawerToggle, onDrawerOpen, onDrawerClose }: SidebarProps) {
  const { isOverlay } = useLayoutBreakpoints();
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
    { text: 'Invoices', icon: <Receipt size={24} />, path: '/invoices' },
    { text: 'Settings', icon: <Settings size={24} />, path: '/settings' },
  ];

  if (role === 'admin') {
    menuConfig.push({ text: 'Admin Panel', icon: <Users size={24} />, path: '/admin' });
  }

  const isCompact = !mobileOpen && !isOverlay;

  const handleParentClick = (groupName: string) => {
    if (isCompact) {
      onDrawerOpen();
      setOpenGroups((prev) => ({ ...prev, [groupName]: true }));
      return;
    }
    toggleGroup(groupName);
  };

  const closeOnNavigate = () => {
    if (isOverlay) onDrawerClose();
  };

  const renderNavItem = (item: any, depth = 0) => {
    const isParent = !!item.children;
    const active = item.path ? location.pathname === item.path : false;
    const isOpen = openGroups[item.text];
    const isChildActive = isParent && item.children.some((child: any) => location.pathname === child.path);

    return (
      <React.Fragment key={item.text}>
        <ListItem disablePadding sx={{ mb: 0.5, width: '100%', overflow: 'hidden' }}>
          <ListItemButton 
            selected={active || (isChildActive && !isOpen)}
            onClick={() => {
              if (isParent) {
                handleParentClick(item.text);
              } else {
                navigate(item.path);
                closeOnNavigate();
              }
            }}
            sx={{
              borderRadius: 1,
              width: '100%',
              maxWidth: '100%',
              pl: isCompact ? 0 : depth === 0 ? 2 : 4,
              pr: isCompact ? 0 : 2,
              py: 1,
              justifyContent: isCompact ? 'center' : 'flex-start',
              minHeight: 48,
              ...(active && {
                bgcolor: 'rgba(0, 167, 111, 0.08)',
                color: 'primary.main',
                '&:hover': { bgcolor: 'rgba(0, 167, 111, 0.16)' }
              })
            }}
          >
            <ListItemIcon sx={{ 
              color: (active || isChildActive) ? 'primary.main' : 'text.secondary',
              minWidth: isCompact ? 0 : 40,
              justifyContent: 'center',
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
                display: isCompact ? 'none' : 'block',
                opacity: mobileOpen ? 1 : 0, 
                transition: 'opacity 0.2s',
                m: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
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
    <Box sx={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ 
        px: isCompact ? 0 : mobileOpen ? 2.5 : 0, 
        py: { xs: 2, sm: 3 }, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: isCompact ? 'center' : mobileOpen ? 'space-between' : 'center', 
        transition: 'padding 0.2s',
        flexShrink: 0,
      }}>
        <Box sx={{ 
          display: isCompact ? 'none' : 'flex', 
          alignItems: 'center', 
          opacity: mobileOpen ? 1 : 0, 
          width: mobileOpen ? 'auto' : 0, 
          overflow: 'hidden', 
          whiteSpace: 'nowrap', 
          transition: 'opacity 0.2s, width 0.2s' 
        }}>
          <Box sx={{ width: 32, height: 32, borderRadius: 1, bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 1 }}>
            <span style={{ color: '#fff', fontWeight: 900, fontSize: 16 }}>C</span>
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: '700' }} color="text.primary">
            Cold Store
          </Typography>
        </Box>
        <IconButton onClick={handleDrawerToggle} color="inherit" sx={{ flexShrink: 0 }} aria-label="Toggle sidebar">
          <Menu size={20} />
        </IconButton>
      </Box>
      <Box sx={{ 
        flex: 1,
        overflowX: 'hidden', 
        overflowY: 'auto', 
        px: isCompact ? 0.75 : 2, 
        pt: 1, 
        pb: 4,
      }}>
        <List disablePadding sx={{ width: '100%' }}>
          {menuConfig.map((item) => renderNavItem(item))}
        </List>
      </Box>
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{
        width: { xs: 0, md: mobileOpen ? DRAWER_WIDTH : MINI_DRAWER_WIDTH },
        flexShrink: { md: 0 },
        transition: 'width 0.3s',
      }}
    >
      <Drawer
        variant="temporary"
        open={isOverlay && mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
            maxWidth: '85vw',
          },
        }}
      >
        {drawer}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: mobileOpen ? DRAWER_WIDTH : MINI_DRAWER_WIDTH,
            borderRight: '1px dashed rgba(145, 158, 171, 0.24)',
            bgcolor: 'background.default',
            transition: (theme) => theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
            overflowY: 'hidden',
          },
        }}
        open
      >
        {drawer}
      </Drawer>
    </Box>
  );
}
