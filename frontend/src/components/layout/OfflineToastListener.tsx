'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

export function OfflineToastListener() {
  useEffect(() => {
    function handleOffline() {
      toast.warning('Internet connection lost. Receipts will save on this device and sync automatically.');
    }
    function handleOnline() {
      toast.info('Back online. Syncing…');
    }
    function handleSynced() {
      toast.success('Sync complete.');
    }
    function handleReconciled(e: Event) {
      const { provisional, actual } = (e as CustomEvent).detail;
      toast.info(`Receipt number updated from ${provisional} to ${actual} after syncing.`);
    }

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);
    window.addEventListener('receipt-synced', handleSynced);
    window.addEventListener('receipt-number-reconciled', handleReconciled);
    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('receipt-synced', handleSynced);
      window.removeEventListener('receipt-number-reconciled', handleReconciled);
    };
  }, []);

  return null;
}