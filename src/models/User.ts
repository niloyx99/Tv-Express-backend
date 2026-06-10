import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const userSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    password: { type: String, required: true, select: false },
    addressLine: { type: String, default: '' },
    city: { type: String, default: '' },
    postalCode: { type: String, default: '' },
    registrationIp: { type: String, default: '' },
    lastLoginIp: { type: String, default: '' },
    isBanned: { type: Boolean, default: false },
    bannedAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false }
);

export type UserDocument = InferSchemaType<typeof userSchema> & { _id: mongoose.Types.ObjectId };

export const User = mongoose.model('User', userSchema);

export function toPublicUser(user: UserDocument) {
  return {
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    addressLine: user.addressLine,
    city: user.city,
    postalCode: user.postalCode,
  };
}
