import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const blogSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    image: { type: String, required: true },
    alt: { type: String, default: '' },
    tag: { type: String, required: true },
    tagColor: { type: String, default: 'bg-[#083A32]' },
    date: { type: String, required: true },
    title: { type: String, required: true },
    excerpt: { type: String, required: true },
    category: { type: String, required: true, index: true },
    published: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export type BlogDocument = InferSchemaType<typeof blogSchema> & { _id: mongoose.Types.ObjectId };

export const Blog = mongoose.model('Blog', blogSchema);
