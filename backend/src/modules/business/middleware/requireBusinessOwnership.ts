import { Response, NextFunction } from 'express';
import { Business, IBusiness } from '../models/Business.model';
import { AuthenticatedRequest } from '../../auth/middleware/requireAuth';
import { sendError } from '../../../shared/utils/response';

export interface BusinessScopedRequest extends AuthenticatedRequest {
  business?: IBusiness;
}

export async function requireBusinessOwnership(
  req: BusinessScopedRequest,
  res: Response,
  next: NextFunction
) {
  const { businessId } = req.params;
  const business = await Business.findById(businessId);

  if (!business || business.ownerId.toString() !== req.userId) {
    // 404, not 403, on a mismatch — we don't want to confirm to a caller
    // that a business ID exists but belongs to someone else.
    return sendError(res, 'NOT_FOUND', 'Business not found.', 404);
  }

  req.business = business;
  next();
}