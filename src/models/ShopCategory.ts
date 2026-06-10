import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const shopCategorySchema = new Schema(
  {
    id: { type: String, required: true, unique: true },
    label: { type: String, required: true, trim: true },
    image: { type: String, default: '' },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false }
);

export type ShopCategoryDocument = InferSchemaType<typeof shopCategorySchema> & {
  _id: mongoose.Types.ObjectId;
};

export const ShopCategory = mongoose.model('ShopCategory', shopCategorySchema);
