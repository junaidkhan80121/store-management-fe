import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { type RootState } from '../store/store';
import {
  ensureValidAccessToken,
  getTokenExpiryMs,
  isAccessTokenExpired,
  refreshAccessToken,
  forceSessionExpiredLogout,
} from '../lib/auth';

/** Proactively refresh before access token expires; logout if refresh fails. */
export default function AuthSessionWatcher() {
  const token = useSelector((state: RootState) => state.auth.token);
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!isAuthenticated || !token) return;

    const schedule = () => {
      const exp = getTokenExpiryMs(token);
      if (!exp) {
        forceSessionExpiredLogout();
        return;
      }
      const refreshAt = exp - 60_000;
      const delay = Math.max(refreshAt - Date.now(), 0);

      timerRef.current = setTimeout(async () => {
        if (isAccessTokenExpired(token, 0)) {
          const ok = await refreshAccessToken();
          if (!ok) forceSessionExpiredLogout();
        } else {
          await refreshAccessToken();
        }
      }, delay);
    };

    if (isAccessTokenExpired(token)) {
      ensureValidAccessToken();
    } else {
      schedule();
    }

    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        ensureValidAccessToken();
      }
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [token, isAuthenticated]);

  return null;
}
