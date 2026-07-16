import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  console.error(err);

  // MongoDB duplicate key error — most likely a race on receiptNumber or
  // clientReceiptId that slipped past the idempotency check.
  if (typeof err === 'object' && err !== null && 'code' in err && (err as { code: number }).code === 11000) {
    return sendError(res, 'DUPLICATE', 'This record already exists.', 409);
  }

  const message = err instanceof Error ? err.message : 'Unexpected server error.';
  return sendError(res, 'INTERNAL_ERROR', message, 500);
}