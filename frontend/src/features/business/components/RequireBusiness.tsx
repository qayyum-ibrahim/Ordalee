'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMyBusiness } from '../hooks/useMyBusiness';
import { useSyncOnReconnect } from '@/features/receipts/offline/useSyncOnReconnect';

export function RequireBusiness({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: business, isLoading } = useMyBusiness();
  useSyncOnReconnect(business ?? undefined);
  
  useEffect(() => {
    if (!isLoading && business === null) {
      router.replace('/business/setup');
    }
  }, [isLoading, business, router]);

  if (isLoading) return <div className="min-h-screen bg-background" />;
  if (!business) return null;
  return <>{children}</>;
}