import { Response } from 'express';
import { getDashboardStats } from '../receipts/services/getDashboardStats';
import { sendSuccess } from '../../shared/utils/response';
import { BusinessScopedRequest } from '../business/middleware/requireBusinessOwnership';

export async function getDashboard(req: BusinessScopedRequest, res: Response) {
  const stats = await getDashboardStats(req.business!._id.toString());
  return sendSuccess(res, stats);
}