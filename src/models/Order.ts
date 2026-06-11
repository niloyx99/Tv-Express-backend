import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const cartItemSchema = new Schema(
  {
    product: { type: Schema.Types.Mixed, required: true },
    quantity: { type: Number, required: true, min: 1 },
    selectedColor: { type: String },
    selectedSize: { type: String },
  },
  { _id: false }
);

const shippingSchema = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    addressLine: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    division: { type: String, required: true },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    orderId: { type: String, required: true, unique: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    date: { type: String, required: true },
    items: { type: [cartItemSchema], required: true },
    total: { type: Number, required: true },
    shippingAddress: { type: shippingSchema, required: true },
    paymentMethod: { type: String, required: true },
    status: {
      type: String,
      enum: ['Placed', 'Confirmed', 'Shipped', 'Received', 'Cancelled', 'Processing', 'Delivered'],
      default: 'Placed',
    },
    deliveryArea: { type: String, enum: ['inside', 'outside'], default: 'inside' },
    deliveryCharge: { type: Number, default: 80 },
    subtotal: { type: Number, default: 0 },
    clientIp: { type: String, default: '' },
  },
  { timestamps: true, versionKey: false }
);

export type OrderDocument = InferSchemaType<typeof orderSchema> & { _id: mongoose.Types.ObjectId };

export const Order = mongoose.model('Order', orderSchema);

function normalizeStatus(status: string) {
  const legacy: Record<string, string> = {
    Processing: 'Confirmed',
    Delivered: 'Received',
    Pending: 'Placed',
  };
  return legacy[status] ?? status;
}

export function toPublicOrder(order: OrderDocument) {
  const city = order.shippingAddress?.city?.toLowerCase() ?? '';
  const deliveryArea =
    order.deliveryArea ||
    (city.includes('outside') ? 'outside' : city.includes('dhaka') ? 'inside' : 'inside');
  const deliveryCharge = order.deliveryCharge ?? (deliveryArea === 'inside' ? 80 : 150);

  return {
    id: order.orderId,
    date: order.date,
    items: order.items,
    total: order.total,
    shippingAddress: order.shippingAddress,
    paymentMethod: order.paymentMethod,
    status: normalizeStatus(order.status),
    deliveryArea,
    deliveryCharge,
    subtotal: order.subtotal ?? Math.max(0, order.total - deliveryCharge),
  };
}
