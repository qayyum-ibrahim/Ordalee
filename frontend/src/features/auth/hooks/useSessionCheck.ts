'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { refreshRequest } from '../api/authApi';

type SessionStatus = 'checking' | 'authenticated' | 'unauthenticated';

export function useSessionCheck(): SessionStatus {
  const accessToken = useAuthStore((state) => state.accessToken);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const [status, setStatus] = useState<SessionStatus>(accessToken ? 'authenticated' : 'checking');

  useEffect(() => {
    if (accessToken) {
      setStatus('authenticated');
      return;
    }
    // No in-memory token (e.g. a fresh page load) — the httpOnly refresh
    // cookie may still hold a valid session, so check before concluding
    // this is actually a logged-out visitor.
    refreshRequest()
      .then((data) => {
        setAccessToken(data.accessToken);
        setStatus('authenticated');
      })
      .catch(() => setStatus('unauthenticated'));
  }, [accessToken, setAccessToken]);

  return status;
}