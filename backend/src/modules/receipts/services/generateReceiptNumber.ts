import { Business } from '../../business/models/Business.model';

/**
 * $inc is atomic at the document level in MongoDB — two concurrent
 * requests for the same business can never receive the same number,
 * even under load, without needing a transaction.
 */
export async function getNextReceiptNumber(businessId: string): Promise<string> {
  const business = await Business.findOneAndUpdate(
    { _id: businessId },
    { $inc: { receiptSequence: 1 } },
    { new: true }
  );

  if (!business) {
    throw new Error('Business not found');
  }

  return `${business.receiptPrefix}-${String(business.receiptSequence).padStart(6, '0')}`;
}