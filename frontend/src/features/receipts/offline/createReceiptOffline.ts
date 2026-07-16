import { offlineDb } from '@/lib/offline/db';
import { CreateReceiptInput } from '../api/receiptsApi';
import { Business } from '@/features/business/api/businessApi';
import { getNextProvisionalReceiptNumber } from './provisionalReceiptNumber';
import { syncPendingReceipt } from './syncEngine';

export async function createReceiptOffline(
  business: Business,
  formInput: Omit<CreateReceiptInput, 'clientReceiptId'>
): Promise<{ clientReceiptId: string; provisionalReceiptNumber: string }> {
  const clientReceiptId = crypto.randomUUID();
  const provisionalReceiptNumber = await getNextProvisionalReceiptNumber(business);
  const input: CreateReceiptInput = { ...formInput, clientReceiptId };

  await offlineDb.pendingReceipts.put({
    clientReceiptId,
    businessId: business._id,
    input,
    provisionalReceiptNumber,
    syncStatus: 'pending',
    attempts: 0,
    createdAt: new Date().toISOString(),
  });

  // Fire-and-forget — the caller navigates immediately using only local
  // data. Whether this succeeds or not happens entirely in the background.
  void syncPendingReceipt(clientReceiptId, business);

  return { clientReceiptId, provisionalReceiptNumber };
}