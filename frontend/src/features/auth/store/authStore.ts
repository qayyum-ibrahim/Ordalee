import { create } from 'zustand';

interface AuthState {
  accessToken: string | null;
  setAccessToken: (token: string) => void;
  clearAuth: () => void;
}

// No localStorage/sessionStorage. An access token that lives in JS-readable
// storage is a bigger XSS blast radius than one that just disappears on
// refresh and gets silently re-issued via the httpOnly refresh cookie.
export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  setAccessToken: (token) => set({ accessToken: token }),
  clearAuth: () => set({ accessToken: null }),
}));