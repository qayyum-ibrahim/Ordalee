'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionCheck } from '../hooks/useSessionCheck';

export function GuestGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const status = useSessionCheck();

  useEffect(() => {
    if (status === 'authenticated') router.replace('/dashboard');
  }, [status, router]);

  if (status !== 'unauthenticated') return <div className="min-h-screen bg-background" />;
  return <>{children}</>;
}