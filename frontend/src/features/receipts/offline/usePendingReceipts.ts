'use client';

import { useEffect, useState } from 'react';
import { offlineDb, PendingReceipt } from '@/lib/offline/db';

export function usePendingReceipts(businessId: string | undefined): PendingReceipt[] {
  const [pending, setPending] = useState<PendingReceipt[]>([]);

  useEffect(() => {
    if (!businessId) return;

    async function load() {
      const records = await offlineDb.pendingReceipts.where('businessId').equals(businessId!).toArray();
      setPending(records);
    }

    load();
    // Reuses the events the sync engine already dispatches (Milestone 8)
    // rather than polling constantly.
    window.addEventListener('receipt-synced', load);
    window.addEventListener('online', load);
    // A light safety-net poll too — a sync attempt failing (as opposed to
    // succeeding) doesn't currently dispatch its own event.
    const interval = setInterval(load, 3000);

    return () => {
      window.removeEventListener('receipt-synced', load);
      window.removeEventListener('online', load);
      clearInterval(interval);
    };
  }, [businessId]);

  return pending;
}