import React from 'react';
import { Box, Typography, Paper, Fade } from '@mui/material';

export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <Fade in={true} timeout={500}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom color="text.primary">
          {title}
        </Typography>
        <Paper 
          elevation={0}
          sx={{ 
            p: 4, 
            mt: 3, 
            borderRadius: 3, 
            bgcolor: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.8)',
            minHeight: '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Typography variant="h6" color="text.secondary">
            {title} interface is under construction...
          </Typography>
        </Paper>
      </Box>
    </Fade>
  );
}
