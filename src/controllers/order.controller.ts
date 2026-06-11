import type { Response } from 'express';
import { Order, toPublicOrder } from '../models/Order.js';
import { ApiError } from '../utils/ApiError.js';
import { getClientIp } from '../utils/getClientIp.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';

function generateOrderId() {
  return `PM-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 90 + 10)}`;
}

export async function createOrder(req: AuthRequest, res: Response) {
  const { items, total, shippingAddress, paymentMethod, deliveryArea, deliveryCharge, subtotal } = req.body;

  if (!items?.length || !total || !shippingAddress || !paymentMethod) {
    throw new ApiError(400, 'Order items, total, shipping address and payment method are required');
  }

  const city = String(shippingAddress.city || '').toLowerCase();
  const resolvedArea =
    deliveryArea === 'outside' || deliveryArea === 'inside'
      ? deliveryArea
      : city.includes('outside')
        ? 'outside'
        : 'inside';
  const resolvedCharge = Number(deliveryCharge ?? (resolvedArea === 'inside' ? 80 : 150));

  const order = await Order.create({
    orderId: generateOrderId(),
    userId: req.userId,
    date: new Date().toLocaleString('en-US', {
      month: 'long',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }),
    items,
    total,
    shippingAddress,
    paymentMethod,
    status: 'Placed',
    deliveryArea: resolvedArea,
    deliveryCharge: resolvedCharge,
    subtotal: Number(subtotal ?? total),
    clientIp: getClientIp(req),
  });

  res.status(201).json({
    success: true,
    message: 'Order placed successfully',
    data: toPublicOrder(order),
  });
}

export async function getOrders(req: AuthRequest, res: Response) {
  if (!req.userId) {
    res.json({ success: true, data: [] });
    return;
  }

  const orders = await Order.find({ userId: req.userId }).sort({ createdAt: -1 }).lean();

  res.json({
    success: true,
    data: orders.map((order) => toPublicOrder(order as Parameters<typeof toPublicOrder>[0])),
  });
}

export async function getOrderById(req: AuthRequest, res: Response) {
  const order = await Order.findOne({ orderId: req.params.id });
  if (!order) throw new ApiError(404, 'Order not found');

  if (req.userId && order.userId && order.userId.toString() !== req.userId) {
    throw new ApiError(403, 'You do not have access to this order');
  }

  res.json({ success: true, data: toPublicOrder(order) });
}

export async function trackOrder(req: AuthRequest, res: Response) {
  const { orderId } = req.params;
  const order = await Order.findOne({ orderId });
  if (!order) throw new ApiError(404, 'Order not found. Please check your order ID.');
  res.json({ success: true, data: toPublicOrder(order) });
}
