import type { Response } from 'express';
import { Order, toPublicOrder } from '../../models/Order.js';
import { ApiError } from '../../utils/ApiError.js';
import type { AdminRequest } from '../../middleware/adminAuth.middleware.js';

export async function listOrders(req: AdminRequest, res: Response) {
  const { status, search } = req.query;
  const filter: Record<string, unknown> = {};

  if (typeof status === 'string' && status !== 'all') filter.status = status;
  if (typeof search === 'string' && search.trim()) {
    const term = search.trim();
    filter.$or = [
      { orderId: { $regex: term, $options: 'i' } },
      { 'shippingAddress.fullName': { $regex: term, $options: 'i' } },
      { 'shippingAddress.phone': { $regex: term, $options: 'i' } },
    ];
  }

  const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();
  res.json({
    success: true,
    data: orders.map((o) => ({
      ...toPublicOrder(o as Parameters<typeof toPublicOrder>[0]),
      customerEmail: o.shippingAddress?.email,
      customerPhone: o.shippingAddress?.phone,
    })),
  });
}

export async function updateOrderStatus(req: AdminRequest, res: Response) {
  const { status } = req.body;
  const allowed = ['Processing', 'Shipped', 'Delivered'];
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
