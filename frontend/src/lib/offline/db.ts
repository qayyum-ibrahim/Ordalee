import Dexie, { Table } from 'dexie';
import { CreateReceiptInput } from '@/features/receipts/api/receiptsApi';

export type SyncStatus = 'pending' | 'syncing' | 'failed';

export interface PendingReceipt {
  clientReceiptId: string; // primary key — same value used as the server's idempotency key
  businessId: string;
  input: CreateReceiptInput;
  provisionalReceiptNumber: string;
  syncStatus: SyncStatus;
  attempts: number;
  lastError?: string;
  createdAt: string;
}

export interface CachedSequence {
  businessId: string; // primary key
  receiptPrefix: string;
  lastKnownSequence: number;
}

class OrdaleeDB extends Dexie {
  pendingReceipts!: Table<PendingReceipt, string>;
  cachedSequences!: Table<CachedSequence, string>;

  constructor() {
    super('ordalee-offline');
    this.version(1).stores({
      pendingReceipts: 'clientReceiptId, businessId, syncStatus',
      cachedSequences: 'businessId',
    });
  }
}

export const offlineDb = new OrdaleeDB();