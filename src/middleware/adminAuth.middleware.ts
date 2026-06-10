import type { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from '../utils/ApiError.js';
import { Admin } from '../models/Admin.js';
import type { AuthRequest } from './auth.middleware.js';

export interface AdminRequest extends AuthRequest {
  adminId?: string;
}

export function requireAdmin(req: AdminRequest, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Admin authentication required'));
  }

  const token = header.slice(7);
  jwt.verify(token, env.jwtSecret, async (err, decoded) => {
    if (err || !decoded || typeof decoded !== 'object') {
      return next(new ApiError(401, 'Invalid or expired admin token'));
    }

    const payload = decoded as { adminId?: string; type?: string };
    if (payload.type !== 'admin' || !payload.adminId) {
      return next(new ApiError(403, 'Admin access only'));
    }

    try {
      const admin = await Admin.findById(payload.adminId);
      if (!admin) return next(new ApiError(401, 'Admin not found'));
      req.adminId = admin.id;
      next();
    } catch (error) {
      next(error);
    }
  });
}
