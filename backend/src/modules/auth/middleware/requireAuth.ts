import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../../../shared/utils/token';
import { sendError } from '../../../shared/utils/response';

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return sendError(res, 'UNAUTHORIZED', 'Missing or malformed Authorization header.', 401);
  }

  try {
    req.userId = verifyAccessToken(header.slice(7)).userId;
    next();
  } catch {
    return sendError(res, 'UNAUTHORIZED', 'Access token is invalid or expired.', 401);
  }
}