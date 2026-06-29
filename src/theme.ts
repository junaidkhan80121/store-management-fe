import { type PaletteMode } from '@mui/material';

export const getDesignTokens = (mode: PaletteMode) => ({
  palette: {
    mode,
    primary: { main: '#00A76F', darker: '#004B50', lighter: '#C8FAD6' },
    secondary: { main: '#8E33FF' },
    error: { main: '#FF5630' },
    ...(mode === 'light'
      ? {
          background: { default: '#F9FAFB', paper: '#FFFFFF' },
          text: { primary: '#212B36', secondary: '#637381', disabled: '#919EAB' },
          divider: 'rgba(145, 158, 171, 0.2)',
        }
      : {
          background: { default: '#161C24', paper: '#212B36' },
          text: { primary: '#FFFFFF', secondary: '#919EAB', disabled: '#637381' },
          divider: 'rgba(145, 158, 171, 0.24)',
        }),
  },
  typography: {
    fontFamily: '"Public Sans", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.02em' },
    h2: { fontWeight: 800 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 700 } as const,
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: mode === 'light' ? '#F9FAFB' : '#161C24',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          borderRadius: 16,
          border: 'none',
          boxShadow: mode === 'light' 
            ? '0 0 2px 0 rgba(145, 158, 171, 0.2), 0 12px 24px -4px rgba(145, 158, 171, 0.12)'
            : '0 0 2px 0 rgba(0, 0, 0, 0.2), 0 12px 24px -4px rgba(0, 0, 0, 0.12)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          boxShadow: '0 8px 16px 0 rgba(0, 167, 111, 0.24)',
          '&:hover': {
            backgroundColor: '#007867',
            boxShadow: '0 8px 16px 0 rgba(0, 167, 111, 0.24)',
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          height: 8,
          borderRadius: 4,
          backgroundColor: 'rgba(145, 158, 171, 0.16)',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            '& fieldset': {
              borderColor: 'rgba(145, 158, 171, 0.2)',
            },
            '&:hover fieldset': {
              borderColor: '#212B36',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#212B36',
            },
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px dashed rgba(145, 158, 171, 0.2)',
        },
        head: {
          color: '#637381',
          backgroundColor: mode === 'light' ? '#F4F6F8' : 'rgba(145, 158, 171, 0.12)',
          '&:first-of-type': {
            borderTopLeftRadius: 8,
            borderBottomLeftRadius: 8,
          },
          '&:last-of-type': {
            borderTopRightRadius: 8,
            borderBottomRightRadius: 8,
          },
        },
      },
    },
  },
});
