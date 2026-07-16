import { Response } from 'express';
import { Receipt } from './models/Receipt.model';
import { getNextReceiptNumber } from './services/generateReceiptNumber';
import { calculateReceiptTotals } from './services/calculateReceiptTotals';
import { sendSuccess, sendError } from '../../shared/utils/response';
import { BusinessScopedRequest } from '../business/middleware/requireBusinessOwnership';

interface ReceiptItemInput {
  name: string;
  quantity: number;
  unitPriceMinor: number;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function createReceipt(req: BusinessScopedRequest, res: Response) {
  const business = req.business!;
  const {
    clientReceiptId,
    customerName,
    items,
    discountType,
    discountValue,
    notes,
    paymentMethod,
    clientCreatedAt,
  } = req.body as {
    clientReceiptId?: string;
    customerName?: string;
    items?: ReceiptItemInput[];
    discountType?: 'flat' | 'percentage';
    discountValue?: number;
    notes?: string;
    paymentMethod?: 'cash' | 'transfer' | 'pos' | 'other';
    clientCreatedAt?: string;
  };

  if (!clientReceiptId) return sendError(res, 'VALIDATION_ERROR', 'clientReceiptId is required.');
  if (!clientCreatedAt) return sendError(res, 'VALIDATION_ERROR', 'clientCreatedAt is required.');
  if (!items || items.length === 0) return sendError(res, 'VALIDATION_ERROR', 'At least one item is required.');
  for (const item of items) {
    if (!item.name?.trim() || item.quantity <= 0 || item.unitPriceMinor < 0) {
      return sendError(res, 'VALIDATION_ERROR', 'Each item needs a name, a positive quantity, and a non-negative price.');
    }
  }

  // Idempotency: a retried offline sync sends the same clientReceiptId.
  // Return the existing receipt instead of creating a duplicate for one
  // real-world sale.
  const existing = await Receipt.findOne({ businessId: business._id.toString(), clientReceiptId });
  if (existing) {
    return sendSuccess(res, existing, 'Receipt already exists.', 200);
  }

  const computedItems = items.map((item) => ({
    name: item.name,
    quantity: item.quantity,
    unitPriceMinor: item.unitPriceMinor,
    subtotalMinor: item.quantity * item.unitPriceMinor,
  }));

  const totals = calculateReceiptTotals(computedItems, discountType, discountValue, business.taxPercentage);
  const receiptNumber = await getNextReceiptNumber(business._id.toString().toString());

  const receipt = await Receipt.create({
    businessId: business._id.toString(),
    clientReceiptId,
    receiptNumber,
    customerName,
    items: computedItems,
    ...totals,
    discountType,
    discountValue,
    taxPercentage: business.taxPercentage,
    notes,
    paymentMethod: paymentMethod || 'cash',
    status: 'completed',
    createdOffline: false, // the offline-queue milestone will set this from the client
    clientCreatedAt: new Date(clientCreatedAt),
  });

  return sendSuccess(res, receipt, 'Receipt created.', 201);
}

export async function listReceipts(req: BusinessScopedRequest, res: Response) {
  const business = req.business!;
  const { from, to, search, page = '1', limit = '20' } = req.query as Record<string, string>;

  const query: Record<string, unknown> = { businessId: business._id.toString() };
  if (from || to) {
    query.clientCreatedAt = {
      ...(from ? { $gte: new Date(from) } : {}),
      ...(to ? { $lte: new Date(to) } : {}),
    };
  }
  if (search) {
    const pattern = new RegExp(escapeRegex(search), 'i');
    query.$or = [{ customerName: pattern }, { receiptNumber: pattern }];
  }

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

  const [receipts, total] = await Promise.all([
    Receipt.find(query).sort({ clientCreatedAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
    Receipt.countDocuments(query),
  ]);

  return sendSuccess(res, { receipts, total, page: pageNum, limit: limitNum });
}

export async function getReceipt(req: BusinessScopedRequest, res: Response) {
  const receipt = await Receipt.findOne({ _id: req.params.id, businessId: req.business!._id });
  if (!receipt) return sendError(res, 'NOT_FOUND', 'Receipt not found.', 404);
  return sendSuccess(res, receipt);
}

export async function getReceiptByClientId(req: BusinessScopedRequest, res: Response) {
  const receipt = await Receipt.findOne({ businessId: req.business!._id.toString(), clientReceiptId: req.params.clientReceiptId });
  if (!receipt) return sendError(res, 'NOT_FOUND', 'Receipt not found.', 404);
  return sendSuccess(res, receipt);
}