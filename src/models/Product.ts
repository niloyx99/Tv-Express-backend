import mongoose, { Schema, type InferSchemaType } from 'mongoose';

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
  },
  { timestamps: true, versionKey: false }
);

export type ProductDocument = InferSchemaType<typeof productSchema> & { _id: mongoose.Types.ObjectId };

export const Product = mongoose.model('Product', productSchema);
