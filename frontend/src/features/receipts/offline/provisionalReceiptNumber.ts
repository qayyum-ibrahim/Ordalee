import { offlineDb } from '@/lib/offline/db';
import { Business } from '@/features/business/api/businessApi';

/**
 * Generates the number shown on screen and printed on the PDF at the
 * moment of creation, before the request ever reaches the server. This is
 * necessarily optimistic — the server's atomic counter (unchanged since
 * Milestone 3) stays the source of truth and can assign something
 * different if two devices create receipts concurrently while both
 * offline. For a single-device business — the default assumption for v1,
 * since there are no staff accounts — this always matches. See
 * syncEngine.ts for how a mismatch gets surfaced rather than silently
 * hidden if it ever does happen.
 */
export async function getNextProvisionalReceiptNumber(business: Business): Promise<string> {
  const cached = await offlineDb.cachedSequences.get(business._id);
  const currentSequence = cached?.lastKnownSequence ?? business.receiptSequence;
  const nextSequence = currentSequence + 1;

  await offlineDb.cachedSequences.put({
    businessId: business._id,
    receiptPrefix: business.receiptPrefix,
    lastKnownSequence: nextSequence,
  });

  return `${business.receiptPrefix}-${String(nextSequence).padStart(6, '0')}`;
}

/** Called after every successful sync so the local cache never drifts
 * behind the server's real counter. */
export async function reconcileSequence(businessId: string, prefix: string, serverSequence: number): Promise<void> {
  const cached = await offlineDb.cachedSequences.get(businessId);
  if (!cached || serverSequence > cached.lastKnownSequence) {
    await offlineDb.cachedSequences.put({ businessId, receiptPrefix: prefix, lastKnownSequence: serverSequence });
  }
}