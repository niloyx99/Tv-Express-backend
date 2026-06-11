import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const highlightSchema = new Schema(
  {
    title: { type: String, default: '' },
    text: { type: String, default: '' },
  },
  { _id: false }
);

const detailTabSchema = new Schema(
  {
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    body: { type: String, default: '' },
    highlights: { type: [highlightSchema], default: [] },
    footerNote: { type: String, default: '' },
  },
  { _id: false }
);

const specificationTabSchema = new Schema(
  {
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    brand: { type: String, default: '' },
    warranty: { type: String, default: '' },
    origin: { type: String, default: '' },
  },
  { _id: false }
);

const shippingTabSchema = new Schema(
  {
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    insideTitle: { type: String, default: '' },
    insideText: { type: String, default: '' },
    outsideTitle: { type: String, default: '' },
    outsideText: { type: String, default: '' },
    replacementTitle: { type: String, default: '' },
    replacementText: { type: String, default: '' },
  },
  { _id: false }
);

const productReviewSchema = new Schema(
  {
    id: { type: String, required: true },
    userName: { type: String, required: true },
    rating: { type: Number, default: 5, min: 1, max: 5 },
    date: { type: String, required: true },
    comment: { type: String, required: true },
  },
  { _id: false }
);

const productSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    category: { type: String, required: true, index: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    rating: { type: Number, default: 4.5 },
    reviewsCount: { type: Number, default: 0 },
    image: { type: String, required: true },
    images: { type: [String], default: [] },
    badge: { type: String },
    description: { type: String, required: true },
    features: [{ type: String }],
    colors: [{ type: String }],
    sizes: [{ type: String }],
    stock: { type: Number, default: 0 },
    detailTab: { type: detailTabSchema, default: () => ({}) },
    specificationTab: { type: specificationTabSchema, default: () => ({}) },
    shippingTab: { type: shippingTabSchema, default: () => ({}) },
    reviews: { type: [productReviewSchema], default: [] },
  },
  { timestamps: true, versionKey: false }
);

export type ProductDocument = InferSchemaType<typeof productSchema> & { _id: mongoose.Types.ObjectId };

export const Product = mongoose.model('Product', productSchema);
