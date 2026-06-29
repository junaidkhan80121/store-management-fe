import React, { useState, useEffect } from 'react';
import { 
  Typography, Box, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, IconButton, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Switch, FormControlLabel, Tabs, Tab
} from '@mui/material';
import { Trash2, UserPlus, ShieldAlert, Power, PowerOff } from 'lucide-react';
import { useSelector } from 'react-redux';
import { type RootState } from '../store/store';

export default function AdminPanel() {
  const [users, setUsers] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', role: 'user' });
  const [tabValue, setTabValue] = useState(0);
  const token = useSelector((state: RootState) => state.auth.token);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  };

  useEffect(() => {
    if (token) fetchUsers();
  }, [token]);

  const handleAddUser = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/admin/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newUser)
      });
      if (response.ok) {
        setOpen(false);
        setNewUser({ email: '', password: '', role: 'user' });
        fetchUsers();
      } else {
        alert("Failed to add user (email might exist)");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to permanently delete this user?")) return;
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) fetchUsers();
      else alert("Failed to delete user");
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleSuspend = async (id: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/admin/users/${id}/suspend`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      if (response.ok) fetchUsers();
      else alert("Failed to update status");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Box sx={{ maxWidth: 1440, mx: 'auto', pt: 2, pb: 4 }}>
      <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: '700' }}>Admin Control Panel</Typography>
        <Button 
          variant="contained" 
          startIcon={<UserPlus size={20} />}
          onClick={() => setOpen(true)}
        >
          New User
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={(e, val) => setTabValue(val)}>
          <Tab label="User Management" />
          <Tab label="System Rules" />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <Paper sx={{ overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Email / ID</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2">{user.email}</Typography>
                      <Typography variant="body2" color="text.secondary">ID: {user.id}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user.role === 'admin' ? 'Admin' : 'User'} 
                        color={user.role === 'admin' ? 'secondary' : 'default'}
                        size="small" 
                        sx={{ fontWeight: 700 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={user.is_active ? 'Active' : 'Suspended'} 
                        color={user.is_active ? 'primary' : 'error'} 
                        variant="outlined"
                        size="small" 
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        color={user.is_active ? "warning" : "success"} 
                        onClick={() => handleToggleSuspend(user.id, user.is_active)}
                        title={user.is_active ? "Suspend User" : "Activate User"}
                      >
                        {user.is_active ? <PowerOff size={20} /> : <Power size={20} />}
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDelete(user.id)} title="Delete User">
                        <Trash2 size={20} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {tabValue === 1 && (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <ShieldAlert size={48} color="#919EAB" style={{ marginBottom: 16 }} />
          <Typography variant="h6" color="text.secondary">Global System Rules</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This section is reserved for future global configurations, limits, and system-wide constraints.
          </Typography>
        </Paper>
      )}

      {/* Add User Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={newUser.email}
            onChange={(e) => setNewUser({...newUser, email: e.target.value})}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            variant="outlined"
            value={newUser.password}
            onChange={(e) => setNewUser({...newUser, password: e.target.value})}
            sx={{ mb: 3 }}
          />
          <FormControlLabel
            control={
              <Switch 
                checked={newUser.role === 'admin'} 
                onChange={(e) => setNewUser({...newUser, role: e.target.checked ? 'admin' : 'user'})} 
              />
            }
            label="Grant Admin Privileges"
          />
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleAddUser} variant="contained">Create User</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
