import { Business } from '@/features/business/api/businessApi';
import { PendingReceipt } from '@/lib/offline/db';
import { Receipt } from '../api/receiptsApi';
import { calculateTotals } from '../utils/calculateTotals';

export function pendingToReceipt(pending: PendingReceipt, business: Business): Receipt {
  const totals = calculateTotals(
    pending.input.items,
    pending.input.discountType,
    pending.input.discountValue,
    business.taxPercentage
  );

  return {
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
}