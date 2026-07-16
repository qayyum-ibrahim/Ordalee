'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { refreshRequest } from '@/features/auth/api/authApi';
import { useAuthStore } from '@/features/auth/store/authStore';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  const router = useRouter();
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Same silent-refresh check AuthGuard uses — if there's a valid
    // session cookie, skip the landing page entirely.
    refreshRequest()
      .then((data) => {
        setAccessToken(data.accessToken);
        router.replace('/dashboard');
      })
      .catch(() => setChecking(false));
  }, [setAccessToken, router]);

  if (checking) return <div className="min-h-screen bg-background" />;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-6 text-center">
      <h1 className="text-3xl font-bold text-primary">Ordalee</h1>
      <p className="mt-2 max-w-xs text-muted-foreground">
        Create professional receipts, track every sale, and share instantly on WhatsApp.
      </p>
      <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
        <Link href="/login" className="w-full"><Button className="w-full">Log in</Button></Link>
        <Link href="/register" className="w-full"><Button variant="outline" className="w-full">Create account</Button></Link>
      </div>
    </div>
  );
}