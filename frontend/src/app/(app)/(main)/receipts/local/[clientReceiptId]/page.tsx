'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { offlineDb, PendingReceipt } from '@/lib/offline/db';
import { useMyBusiness } from '@/features/business/hooks/useMyBusiness';
import { calculateTotals } from '@/features/receipts/utils/calculateTotals';
import { ReceiptSummaryCard } from '@/features/receipts/components/ReceiptSummaryCard';
import { Receipt } from '@/features/receipts/api/receiptsApi';
import { Skeleton } from '@/components/ui/skeleton';

export default function LocalReceiptPage() {
  const { clientReceiptId } = useParams<{ clientReceiptId: string }>();
  const router = useRouter();
  const { data: business } = useMyBusiness();
  const [pending, setPending] = useState<PendingReceipt | null | 'loading'>('loading');

  useEffect(() => {
    let cancelled = false;

    async function checkStatus() {
      const record = await offlineDb.pendingReceipts.get(clientReceiptId);
      if (cancelled) return;
      if (!record) {
        // Already synced and removed from the queue — hand off to the
        // canonical server-backed page instead of duplicating it here.
        router.replace(`/receipts/by-client-id/${clientReceiptId}`);
        return;
      }
      setPending(record);
    }

    checkStatus();
    // This screen is only open briefly, right after saving — a 1s poll
    // is imperceptible and avoids pulling in a live-query dependency for
    // one page.
    const interval = setInterval(checkStatus, 1000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [clientReceiptId, router]);

if (!business || pending === 'loading' || pending === null) {
  return (
    <div className="mx-auto max-w-lg p-4 md:p-8">
      <Skeleton className="h-56 rounded-xl" />
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Skeleton className="h-11 rounded-lg" />
        <Skeleton className="h-11 rounded-lg" />
      </div>
    </div>
  );
}

  const totals = calculateTotals(
    pending.input.items,
    pending.input.discountType,
    pending.input.discountValue,
    business.taxPercentage
  );

  const previewReceipt: Receipt = {
    _id: pending.clientReceiptId,
    businessId: business._id,
    clientReceiptId: pending.clientReceiptId,
    receiptNumber: pending.provisionalReceiptNumber,
    customerName: pending.input.customerName,
    items: pending.input.items.map((item) => ({ ...item, subtotalMinor: item.quantity * item.unitPriceMinor })),
    ...totals,
    discountType: pending.input.discountType,
    discountValue: pending.input.discountValue,
    taxPercentage: business.taxPercentage,
    notes: pending.input.notes,
    paymentMethod: pending.input.paymentMethod,
    status: 'completed',
    clientCreatedAt: pending.input.clientCreatedAt,
    createdAt: pending.createdAt,
  };

return (
  <ReceiptSummaryCard
    showVoidAction={false}
    receipt={previewReceipt}
    business={business}
    statusBadge={pending.syncStatus === 'failed' ? 'Sync failed — retrying' : 'Saved on this device · Syncing…'}
    statusVariant={pending.syncStatus === 'failed' ? 'warning' : 'info'}
  />
);
}