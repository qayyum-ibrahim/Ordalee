import { Response } from 'express';
import { Business } from './models/Business.model';
import { sendSuccess, sendError } from '../../shared/utils/response';
import { AuthenticatedRequest } from '../auth/middleware/requireAuth';
import { BusinessScopedRequest } from './middleware/requireBusinessOwnership';

export async function createBusiness(req: AuthenticatedRequest, res: Response) {
  const { name, phone, email, address, currency, receiptPrefix, taxPercentage } = req.body as {
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    currency?: string;
    receiptPrefix?: string;
    taxPercentage?: number;
  };

  if (!name?.trim()) return sendError(res, 'VALIDATION_ERROR', 'Business name is required.');
  if (!phone?.trim()) return sendError(res, 'VALIDATION_ERROR', 'Phone number is required.');

  const existing = await Business.findOne({ ownerId: req.userId });
  if (existing) {
    // One business per owner is a v1 application rule, not a schema
    // constraint — the schema already allows more later (EB §10).
    return sendError(res, 'BUSINESS_EXISTS', 'You already have a business. Use PATCH to update it.', 409);
  }

  const business = await Business.create({
    ownerId: req.userId,
    name: name.trim(),
    phone: phone.trim(),
    email,
    address,
    currency,
    receiptPrefix,
    taxPercentage,
  });

  return sendSuccess(res, business, 'Business created.', 201);
}

export async function getMyBusiness(req: AuthenticatedRequest, res: Response) {
  const business = await Business.findOne({ ownerId: req.userId });
  if (!business) return sendError(res, 'NOT_FOUND', 'No business found for this account.', 404);
  return sendSuccess(res, business);
}

export async function updateBusiness(req: BusinessScopedRequest, res: Response) {
  const allowedFields = ['name', 'phone', 'email', 'address', 'logoUrl', 'currency', 'receiptPrefix', 'taxPercentage'] as const;

    // Cast req.business as a generic record to allow dynamic string indexing safely
  const businessUpdate = req.business as Record<string, any>;

  for (const field of allowedFields) {
    if (field in req.body) {
      businessUpdate[field] = req.body[field];
    }
  }

  await req.business!.save();
  return sendSuccess(res, req.business, 'Business updated.');
}