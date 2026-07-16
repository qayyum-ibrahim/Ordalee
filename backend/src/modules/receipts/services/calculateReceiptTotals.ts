import { IReceiptItem, DiscountType } from '../models/Receipt.model';

export interface ReceiptTotals {
  subtotalMinor: number;
  discountAmountMinor: number;
  taxAmountMinor: number;
  totalMinor: number;
}

export function calculateReceiptTotals(
  items: IReceiptItem[],
  discountType: DiscountType | undefined,
  discountValue: number | undefined,
  taxPercentage: number
): ReceiptTotals {
  const subtotalMinor = items.reduce((sum, item) => sum + item.subtotalMinor, 0);

  let discountAmountMinor = 0;
  if (discountType === 'flat' && discountValue) {
    discountAmountMinor = Math.min(discountValue, subtotalMinor);
  } else if (discountType === 'percentage' && discountValue) {
    discountAmountMinor = Math.round((subtotalMinor * discountValue) / 100);
  }

  const taxableAmount = subtotalMinor - discountAmountMinor;
  const taxAmountMinor = Math.round((taxableAmount * taxPercentage) / 100);
  const totalMinor = taxableAmount + taxAmountMinor;

  return { subtotalMinor, discountAmountMinor, taxAmountMinor, totalMinor };
}