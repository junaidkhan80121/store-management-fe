import { useState, useCallback } from 'react';
import { Snackbar, Alert, type AlertColor } from '@mui/material';

export function useAppToast() {
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({ open: false, message: '', severity: 'success' });

  const showToast = useCallback((message: string, severity: AlertColor = 'success') => {
    setToast({ open: true, message, severity });
  }, []);

  const hideToast = useCallback(() => {
    setToast((prev) => ({ ...prev, open: false }));
  }, []);

  const Toast = () => (
    <Snackbar
      open={toast.open}
      autoHideDuration={5000}
      onClose={hideToast}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert onClose={hideToast} severity={toast.severity} variant="filled" sx={{ width: '100%' }}>
        {toast.message}
      </Alert>
    </Snackbar>
  );

  return { showToast, Toast };
}
