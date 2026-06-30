import { store } from '../store/store';
import { setCredentials, sessionExpiredLogout } from '../store/authSlice';

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const SESSION_EXPIRED_KEY = 'sessionExpired';

export function getTokenExpiryMs(token: string | null): number | null {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function isAccessTokenExpired(token: string | null, skewMs = 30_000): boolean {
  const exp = getTokenExpiryMs(token);
  if (!exp) return true;
  return Date.now() >= exp - skewMs;
}

let refreshInFlight: Promise<boolean> | null = null;

export async function refreshAccessToken(): Promise<boolean> {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return false;

  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const res = await fetch(`${API_BASE}/token/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
        if (!res.ok) return false;
        const data = await res.json();
        store.dispatch(
          setCredentials({
            token: data.access_token,
            refreshToken: data.refresh_token,
          })
        );
        return true;
      } catch {
        return false;
      } finally {
        refreshInFlight = null;
      }
    })();
  }

  return refreshInFlight;
}

export function forceSessionExpiredLogout() {
  sessionStorage.setItem(SESSION_EXPIRED_KEY, '1');
  store.dispatch(sessionExpiredLogout());
  if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
    window.location.assign('/login');
  }
}

export async function ensureValidAccessToken(): Promise<boolean> {
  const { token } = store.getState().auth;
  if (!token) return false;
  if (!isAccessTokenExpired(token)) return true;
  const ok = await refreshAccessToken();
  if (!ok) forceSessionExpiredLogout();
  return ok;
}

function isApiRequest(url: string): boolean {
  return url.startsWith(API_BASE) && !url.includes('/token');
}

function withAuthHeader(init?: RequestInit): RequestInit {
  const headers = new Headers(init?.headers);
  const token = store.getState().auth.token;
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  return { ...init, headers };
}

export function setupFetchInterceptor() {
  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

    let response = await originalFetch(input, init);

    if (response.status === 401 && isApiRequest(url)) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        const retryInit = withAuthHeader(init);
        if (input instanceof Request) {
          const retryRequest = new Request(input, retryInit);
          response = await originalFetch(retryRequest);
        } else {
          response = await originalFetch(input, retryInit);
        }
      } else if (store.getState().auth.isAuthenticated) {
        forceSessionExpiredLogout();
      }
    }

    return response;
  };
}
