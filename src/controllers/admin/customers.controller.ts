import type { Response } from 'express';
import { User } from '../../models/User.js';
import { Order } from '../../models/Order.js';
import { ApiError } from '../../utils/ApiError.js';
import type { AdminRequest } from '../../middleware/adminAuth.middleware.js';

function toAdminUser(u: {
  fullName: string;
  email: string;
  phone: string;
  addressLine?: string;
  city?: string;
  postalCode?: string;
  registrationIp?: string;
  lastLoginIp?: string;
  isBanned?: boolean;
  bannedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}) {
  return {
    fullName: u.fullName,
    email: u.email,
    phone: u.phone,
    addressLine: u.addressLine ?? '',
    city: u.city ?? '',
    postalCode: u.postalCode ?? '',
    registrationIp: u.registrationIp ?? '—',
    lastLoginIp: u.lastLoginIp ?? '—',
    isBanned: Boolean(u.isBanned),
    bannedAt: u.bannedAt ?? null,
    joinedAt: u.createdAt,
    lastActiveAt: u.updatedAt,
  };
}

export async function listCustomers(req: AdminRequest, res: Response) {
  const { search } = req.query;
  const filter: Record<string, unknown> = {};

  if (typeof search === 'string' && search.trim()) {
    const term = search.trim();
    filter.$or = [
      { fullName: { $regex: term, $options: 'i' } },
      { email: { $regex: term, $options: 'i' } },
      { phone: { $regex: term, $options: 'i' } },
      { registrationIp: { $regex: term, $options: 'i' } },
      { lastLoginIp: { $regex: term, $options: 'i' } },
    ];
  }

  const users = await User.find(filter).sort({ createdAt: -1 }).lean();
  res.json({
    success: true,
    data: users.map((u) => toAdminUser(u)),
  });
}

export async function toggleCustomerBan(req: AdminRequest, res: Response) {
  const email = req.params.email.toLowerCase();
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, 'User not found');

  const banned = req.body.banned !== undefined ? Boolean(req.body.banned) : !user.isBanned;
  user.isBanned = banned;
  user.bannedAt = banned ? new Date() : null;
  await user.save();

  res.json({
    success: true,
    message: banned ? 'User banned successfully' : 'User unbanned successfully',
    data: toAdminUser(user),
  });
}

export async function deleteCustomer(req: AdminRequest, res: Response) {
  const user = await User.findOneAndDelete({ email: req.params.email.toLowerCase() });
  if (!user) throw new ApiError(404, 'Customer not found');
  res.json({ success: true, message: 'Customer deleted' });
}

export async function getCustomerOrders(req: AdminRequest, res: Response) {
  const user = await User.findOne({ email: req.params.email.toLowerCase() });
  if (!user) throw new ApiError(404, 'Customer not found');

  const orders = await Order.find({ userId: user._id }).sort({ createdAt: -1 }).lean();
  res.json({
    success: true,
    data: orders.map((o) => ({
      id: o.orderId,
      date: o.date,
      total: o.total,
      status: o.status,
    })),
  });
}
