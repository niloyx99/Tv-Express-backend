import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError.js';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }

  if (err && typeof err === 'object' && 'type' in err && err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Invalid JSON in request body' });
  }

  if (err instanceof Error && err.message === 'Not allowed by CORS') {
    return res.status(403).json({ success: false, message: 'Not allowed by CORS' });
  }

  console.error(err);
  return res.status(500).json({ success: false, message: 'Internal server error' });
}
