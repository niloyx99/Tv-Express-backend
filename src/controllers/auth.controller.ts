import type { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, toPublicUser } from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';
import { getClientIp } from '../utils/getClientIp.js';
import { env } from '../config/env.js';
import type { AuthRequest } from '../middleware/auth.middleware.js';

function signToken(userId: string) {
  return jwt.sign({ userId }, env.jwtSecret, { expiresIn: '7d' });
}

export async function register(req: AuthRequest, res: Response) {
  const { fullName, email, phone, password, addressLine, city, postalCode } = req.body;

  if (!fullName || !email || !phone || !password) {
    throw new ApiError(400, 'Full name, email, phone and password are required');
  }

  if (password.length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters');
  }

  const cleanPhone = String(phone).replace(/[^0-9]/g, '');
  if (cleanPhone.length !== 11 || !cleanPhone.startsWith('01')) {
    throw new ApiError(400, 'Please enter a valid 11-digit mobile number starting with 01');
  }

  const exists = await User.findOne({ email: String(email).toLowerCase() });
  if (exists) throw new ApiError(409, 'This email is already registered');

  const hashed = await bcrypt.hash(password, 10);
  const clientIp = getClientIp(req);
  const user = await User.create({
    fullName,
    email: String(email).toLowerCase(),
    phone: cleanPhone,
    password: hashed,
    addressLine: addressLine || '',
    city: city || '',
    postalCode: postalCode || '',
    registrationIp: clientIp,
    lastLoginIp: clientIp,
  });

  const token = signToken(user.id);
  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    data: { user: toPublicUser(user), token },
  });
}

export async function login(req: AuthRequest, res: Response) {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');
  if (!user) throw new ApiError(401, 'Invalid email or password');
  if (user.isBanned) throw new ApiError(403, 'Your account has been banned. Contact support.');

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new ApiError(401, 'Invalid email or password');

  user.lastLoginIp = getClientIp(req);
  await user.save();

  const token = signToken(user.id);
  res.json({
    success: true,
    message: 'Login successful',
    data: { user: toPublicUser(user), token },
  });
}

export async function getProfile(req: AuthRequest, res: Response) {
  const user = await User.findById(req.userId);
  if (!user) throw new ApiError(404, 'User not found');
  res.json({ success: true, data: toPublicUser(user) });
}

export async function updateProfile(req: AuthRequest, res: Response) {
  const user = await User.findById(req.userId);
  if (!user) throw new ApiError(404, 'User not found');

  const { fullName, phone, addressLine, city, postalCode } = req.body;
  if (fullName) user.fullName = fullName;
  if (phone) user.phone = String(phone).replace(/[^0-9]/g, '');
  if (addressLine !== undefined) user.addressLine = addressLine;
  if (city !== undefined) user.city = city;
  if (postalCode !== undefined) user.postalCode = postalCode;

  await user.save();
  res.json({ success: true, message: 'Profile updated', data: toPublicUser(user) });
}
