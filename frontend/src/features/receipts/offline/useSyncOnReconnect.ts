'use client';

import { useEffect } from 'react';
import { syncAllPending } from './syncEngine';
import { Business } from '@/features/business/api/businessApi';

export function useSyncOnReconnect(business: Business | undefined) {
  useEffect(() => {
    if (!business) return;

    // Covers both cases: the tab was open when connectivity returned
    // (the 'online' event), and the tab was opened fresh while already
    // online with receipts still queued from a previous offline session.
    void syncAllPending(business);

    function handleOnline() {
      if (!business) return;
      void syncAllPending(business);
    }
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [business]);
}