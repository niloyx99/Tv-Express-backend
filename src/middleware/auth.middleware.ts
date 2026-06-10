import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/User.js';

export interface AuthRequest extends Request {
  userId?: string;
}

export function requireAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Authentication required'));
  }

  const token = header.slice(7);
  jwt.verify(token, env.jwtSecret, async (err, decoded) => {
    if (err || !decoded || typeof decoded !== 'object' || !('userId' in decoded)) {
      return next(new ApiError(401, 'Invalid or expired token'));
    }
    try {
      const user = await User.findById((decoded as { userId: string }).userId);
      if (!user) return next(new ApiError(401, 'User not found'));
      if (user.isBanned) return next(new ApiError(403, 'Your account has been banned. Contact support.'));
      req.userId = user.id;
      next();
    } catch (error) {
      next(error);
    }
  });
}

export async function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next();

  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, env.jwtSecret) as { userId: string };
    const user = await User.findById(payload.userId);
    if (user) req.userId = user.id;
  } catch {
    // ignore invalid token for optional routes
  }
  next();
}
