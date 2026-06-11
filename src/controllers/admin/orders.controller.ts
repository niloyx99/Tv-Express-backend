import type { Response } from 'express';
import { Order, toPublicOrder } from '../../models/Order.js';
import { User } from '../../models/User.js';
import { ApiError } from '../../utils/ApiError.js';
import type { AdminRequest } from '../../middleware/adminAuth.middleware.js';

async function resolveClientIp(order: {
  clientIp?: string;
  userId?: { toString(): string } | null;
}) {
  if (order.clientIp?.trim()) return order.clientIp.trim();
  if (!order.userId) return '';
  const user = await User.findById(order.userId).select('lastLoginIp registrationIp').lean();
  return user?.lastLoginIp?.trim() || user?.registrationIp?.trim() || '';
}

export async function listOrders(req: AdminRequest, res: Response) {
  const { status, search } = req.query;
  const filter: Record<string, unknown> = {};

  if (typeof status === 'string' && status !== 'all') {
    if (status === 'Confirmed') filter.status = { $in: ['Confirmed', 'Processing'] };
    else if (status === 'Received') filter.status = { $in: ['Received', 'Delivered'] };
    else if (status === 'Placed') filter.status = { $in: ['Placed', 'Pending'] };
    else filter.status = status;
  }
  if (typeof search === 'string' && search.trim()) {
    const term = search.trim();
    filter.$or = [
      { orderId: { $regex: term, $options: 'i' } },
      { 'shippingAddress.fullName': { $regex: term, $options: 'i' } },
      { 'shippingAddress.phone': { $regex: term, $options: 'i' } },
      { 'shippingAddress.email': { $regex: term, $options: 'i' } },
      { clientIp: { $regex: term, $options: 'i' } },
    ];
  }

  const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();
  const data = await Promise.all(
    orders.map(async (o) => ({
      ...toPublicOrder(o as Parameters<typeof toPublicOrder>[0]),
      customerEmail: o.shippingAddress?.email,
      customerPhone: o.shippingAddress?.phone,
      userId: o.userId?.toString() ?? '',
      clientIp: await resolveClientIp(o),
      createdAt: o.createdAt,
    }))
  );

  res.json({ success: true, data });
}

export async function updateOrderStatus(req: AdminRequest, res: Response) {
  const { status } = req.body;
  const allowed = ['Placed', 'Confirmed', 'Shipped', 'Received', 'Cancelled'];
  if (!allowed.includes(status)) throw new ApiError(400, 'Invalid order status');

  const order = await Order.findOne({ orderId: req.params.id });
  if (!order) throw new ApiError(404, 'Order not found');

  order.status = status;
  await order.save();

  res.json({ success: true, data: toPublicOrder(order) });
}

export async function deleteOrder(req: AdminRequest, res: Response) {
  const order = await Order.findOneAndDelete({ orderId: req.params.id });
  if (!order) throw new ApiError(404, 'Order not found');
  res.json({ success: true, message: 'Order deleted' });
}
