import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Paper, Alert, Link, IconButton } from '@mui/material';
import { Sun, Moon } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';
import { useThemeContext } from '../context/ThemeContext';
import { SESSION_EXPIRED_KEY } from '../lib/auth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [sessionMessage, setSessionMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { mode, toggleColorMode } = useThemeContext();

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_EXPIRED_KEY)) {
      sessionStorage.removeItem(SESSION_EXPIRED_KEY);
      setSessionMessage('Your session has expired. Please sign in again.');
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append('username', email); // FastAPI OAuth2 still expects 'username' key
      formData.append('password', password);

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString()
      });

      if (!response.ok) {
        throw new Error('Invalid username or password');
      }

      const data = await response.json();
      dispatch(setCredentials({ token: data.access_token, refreshToken: data.refresh_token }));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        alignItems: 'center',
        justifyContent: 'center',
        px: { xs: 2, sm: 3 },
        py: { xs: 2, sm: 0 },
      }}
    >
      <IconButton 
        sx={{ position: 'absolute', top: { xs: 12, sm: 16 }, right: { xs: 12, sm: 16 } }} 
        onClick={toggleColorMode} 
        color="inherit"
      >
        {mode === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
      </IconButton>
      <Paper sx={{ p: { xs: 3, sm: 5 }, width: '100%', maxWidth: 480 }}>
        <Typography gutterBottom align="center" sx={{ mb: 4, fontWeight: 700, fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
          Sign in to Cold Store
        </Typography>
        
        {sessionMessage && <Alert severity="warning" sx={{ mb: 3 }}>{sessionMessage}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
        
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
          <Box textAlign="center">
            <Link href="/signup" variant="body2" sx={{ cursor: 'pointer' }}>
              Don't have an account? Sign Up
            </Link>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
