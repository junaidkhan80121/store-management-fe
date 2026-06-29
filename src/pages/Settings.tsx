import React, { useState, useEffect } from 'react';
import { 
  Typography, Paper, Box, Switch, FormControlLabel, 
  Divider, Button, TextField, Stack, Alert, Grid, Tabs, Tab
} from '@mui/material';
import { useSelector } from 'react-redux';
import { type RootState } from '../store/store';
import { User, KeyRound, Bell } from 'lucide-react';

export default function Settings() {
  const [profile, setProfile] = useState<{ email: string }>({ email: '' });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [pwdStatus, setPwdStatus] = useState<{ type: 'error' | 'success', msg: string } | null>(null);
  const [currentTab, setCurrentTab] = useState(0);
  
  const token = useSelector((state: RootState) => state.auth.token);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/users/me/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setProfile({ email: data.email });
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (token) fetchProfile();
  }, [token]);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdStatus(null);
    
    if (passwords.new !== passwords.confirm) {
      setPwdStatus({ type: 'error', msg: 'New passwords do not match' });
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/users/me/password`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          current_password: passwords.current,
          new_password: passwords.new
        })
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Failed to update password');
      }
      
      setPwdStatus({ type: 'success', msg: 'Password successfully updated' });
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err: any) {
      setPwdStatus({ type: 'error', msg: err.message });
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Box sx={{ maxWidth: 1440, mx: 'auto', pt: 2, pb: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: '700' }} gutterBottom>
        Settings
      </Typography>

      <Tabs 
        value={currentTab} 
        onChange={handleTabChange} 
        sx={{ mb: 5, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab icon={<User size={20} />} iconPosition="start" label="General" sx={{ fontWeight: 600 }} />
        <Tab icon={<KeyRound size={20} />} iconPosition="start" label="Security" sx={{ fontWeight: 600 }} />
        <Tab icon={<Bell size={20} />} iconPosition="start" label="Notifications" sx={{ fontWeight: 600 }} />
      </Tabs>

      {currentTab === 0 && (
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: '600' }} gutterBottom>
                Profile Information
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Update your account details and manager profile.
              </Typography>
              
              <Stack spacing={3}>
                <TextField fullWidth label="Email Address" value={profile.email} disabled />
                <TextField fullWidth label="Role" defaultValue="Administrator" disabled />
                <Button variant="contained" sx={{ alignSelf: 'flex-start' }}>Save Changes</Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      )}

      {currentTab === 1 && (
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: '600' }} gutterBottom>
                Change Password
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Ensure your account uses a strong, random password.
              </Typography>
              
              {pwdStatus && (
                <Alert severity={pwdStatus.type} sx={{ mb: 3 }}>
                  {pwdStatus.msg}
                </Alert>
              )}

              <Box component="form" onSubmit={handleChangePassword}>
                <Stack spacing={3}>
                  <TextField fullWidth label="Current Password" type="password" required value={passwords.current} onChange={e => setPasswords({...passwords, current: e.target.value})} />
                  <TextField fullWidth label="New Password" type="password" required value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} />
                  <TextField fullWidth label="Confirm New Password" type="password" required value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} />
                  <Button type="submit" variant="contained" sx={{ alignSelf: 'flex-start' }}>Update Password</Button>
                </Stack>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {currentTab === 2 && (
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 8 }}>
            <Paper sx={{ p: 4 }}>
              <Typography variant="h6" sx={{ fontWeight: '600' }} gutterBottom>
                Notifications & Preferences
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Manage how you receive critical system alerts.
              </Typography>
              
              <Stack spacing={2}>
                <FormControlLabel control={<Switch defaultChecked color="primary" />} label="Email notifications for system alerts" />
                <FormControlLabel control={<Switch defaultChecked color="primary" />} label="SMS notifications for warnings" />
                <FormControlLabel control={<Switch color="primary" />} label="Weekly capacity usage reports" />
              </Stack>

              <Typography variant="h6" gutterBottom sx={{ mt: 5, fontWeight: '600' }}>
                System Actions
              </Typography>
              <Button variant="outlined" color="error">Clear Local Cache</Button>
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
