import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const adminSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['superadmin', 'manager'], default: 'superadmin' },
  },
  { timestamps: true, versionKey: false }
);

export type AdminDocument = InferSchemaType<typeof adminSchema> & { _id: mongoose.Types.ObjectId };

export const Admin = mongoose.model('Admin', adminSchema);
