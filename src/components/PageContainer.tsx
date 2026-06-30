import React from 'react';
import { Box, Typography, type SxProps, type Theme } from '@mui/material';
import { pageContainerSx, pageHeaderSx, pageTitleSx } from '../constants/responsive';

interface PageContainerProps {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
}

export function PageContainer({ children, sx }: PageContainerProps) {
  return <Box sx={{ ...pageContainerSx, ...sx }}>{children}</Box>;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}

export function PageHeader({ title, subtitle, action, icon }: PageHeaderProps) {
  return (
    <Box sx={pageHeaderSx}>
      <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
        {icon && (
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(0, 167, 111, 0.16)', mr: 2, display: 'flex', flexShrink: 0 }}>
            {icon}
          </Box>
        )}
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={pageTitleSx}>{title}</Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
      {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
    </Box>
  );
}
