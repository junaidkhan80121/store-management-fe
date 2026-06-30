import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  role: string | null;
}

const getRoleFromToken = (token: string | null) => {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role || 'user';
  } catch {
    return 'user';
  }
};

const initialToken = localStorage.getItem('token');
const initialRefresh = localStorage.getItem('refreshToken');
const initialState: AuthState = {
  token: initialToken,
  refreshToken: initialRefresh,
  isAuthenticated: !!initialToken,
  role: getRoleFromToken(initialToken),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; refreshToken: string }>
    ) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.role = getRoleFromToken(action.payload.token);
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('refreshToken', action.payload.refreshToken);
    },
    logout: (state) => {
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.role = null;
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    },
    sessionExpiredLogout: (state) => {
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.role = null;
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
    },
  },
});

export const { setCredentials, logout, sessionExpiredLogout } = authSlice.actions;

export default authSlice.reducer;
