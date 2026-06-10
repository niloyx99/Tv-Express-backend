import type { Response } from 'express';
import jwt from 'jsonwebtoken';
import { Admin } from '../../models/Admin.js';
import { ApiError } from '../../utils/ApiError.js';
import { env } from '../../config/env.js';
import type { AdminRequest } from '../../middleware/adminAuth.middleware.js';

function signAdminToken(adminId: string) {
  return jwt.sign({ adminId, type: 'admin' }, env.jwtSecret, { expiresIn: '12h' });
}

export async function adminLogin(req: AdminRequest, res: Response) {
  const { password } = req.body;
  if (!password) throw new ApiError(400, 'Password is required');
  if (!env.adminPassword) throw new ApiError(500, 'Admin password is not configured');
  if (password !== env.adminPassword) throw new ApiError(401, 'Invalid password');

  const admin = await Admin.findOne();
  if (!admin) throw new ApiError(503, 'Admin account not configured. Restart the backend after setting ADMIN_PASSWORD.');

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      admin: { name: admin.name, email: admin.email, role: admin.role },
      token: signAdminToken(admin.id),
    },
  });
}

export async function adminMe(req: AdminRequest, res: Response) {
  const admin = await Admin.findById(req.adminId);
  if (!admin) throw new ApiError(404, 'Admin not found');
  res.json({
    success: true,
    data: { name: admin.name, email: admin.email, role: admin.role },
  });
}
