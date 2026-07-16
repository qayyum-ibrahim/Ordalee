'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../store/authStore';
import { refreshRequest } from '../api/authApi';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // On a hard refresh, the in-memory access token is gone but the
    // httpOnly refresh cookie is still there — use it to silently
    // re-authenticate before deciding whether to bounce to /login.
    if (accessToken) {
      setChecking(false);
      return;
    }
    refreshRequest()
      .then((data) => setAccessToken(data.accessToken))
      .catch(() => router.replace('/login'))
      .finally(() => setChecking(false));
  }, [accessToken, setAccessToken, router]);

  if (checking) return <div className="min-h-screen bg-background" />;
  if (!accessToken) return null;
  return <>{children}</>;
}