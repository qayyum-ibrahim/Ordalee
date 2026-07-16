import { offlineDb } from '@/lib/offline/db';
import { createReceiptRequest } from '../api/receiptsApi';
import { reconcileSequence } from './provisionalReceiptNumber';
import { Business } from '@/features/business/api/businessApi';
import { queryClient } from '@/lib/services/queryClient';

const MAX_ATTEMPTS = 5;

export async function syncPendingReceipt(clientReceiptId: string, business: Business): Promise<void> {
  const pending = await offlineDb.pendingReceipts.get(clientReceiptId);
  if (!pending || pending.syncStatus === 'syncing') return;

  await offlineDb.pendingReceipts.update(clientReceiptId, { syncStatus: 'syncing' });

  try {
    // Idempotent on clientReceiptId (Milestone 3) — safe to call again
    // even if a previous attempt actually succeeded but the response
    // never made it back to this device.
    const synced = await createReceiptRequest(business._id, pending.input);
    await reconcileSequence(business._id, business.receiptPrefix, extractSequence(synced.receiptNumber));

    if (synced.receiptNumber !== pending.provisionalReceiptNumber) {
      // Rare — only happens with genuinely concurrent offline creation
      // across two devices. Surfaced to the user, never silently swapped.
      window.dispatchEvent(new CustomEvent('receipt-number-reconciled', {
        detail: { clientReceiptId, provisional: pending.provisionalReceiptNumber, actual: synced.receiptNumber },
      }));
    }

    await offlineDb.pendingReceipts.delete(clientReceiptId);
    queryClient.invalidateQueries({ queryKey: ['receipts', business._id] });
    window.dispatchEvent(new CustomEvent('receipt-synced', { detail: { clientReceiptId, receipt: synced } }));
  } catch (error) {
    const attempts = pending.attempts + 1;
    await offlineDb.pendingReceipts.update(clientReceiptId, {
      syncStatus: attempts >= MAX_ATTEMPTS ? 'failed' : 'pending',
      attempts,
      lastError: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

function extractSequence(receiptNumber: string): number {
  const match = receiptNumber.match(/(\d+)$/);
  return match ? parseInt(match[1], 10) : 0;
}

export async function syncAllPending(business: Business): Promise<void> {
  const pending = await offlineDb.pendingReceipts
    .where('businessId').equals(business._id)
    .and((r) => r.syncStatus !== 'syncing')
    .toArray();

  for (const receipt of pending) {
    await syncPendingReceipt(receipt.clientReceiptId, business);
  }
}

export async function countUnsyncedReceipts(businessId: string): Promise<number> {
  return offlineDb.pendingReceipts.where('businessId').equals(businessId).count();
}