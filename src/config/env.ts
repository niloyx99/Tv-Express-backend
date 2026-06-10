import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const DEV_JWT_SECRET = 'tvexpress-dev-secret-change-in-production';

function normalizeOrigin(url?: string): string | null {
  const trimmed = url?.trim();
  if (!trimmed) return null;
  return trimmed.replace(/\/$/, '');
}

function resolveJwtSecret(isDev: boolean, adminPassword: string): string {
  const fromEnv = process.env.JWT_SECRET?.trim();
  if (fromEnv && fromEnv !== DEV_JWT_SECRET) return fromEnv;

  if (!isDev && adminPassword) {
    return crypto.createHash('sha256').update(`tvexpress-jwt:${adminPassword}`).digest('hex');
  }

  return fromEnv || DEV_JWT_SECRET;
}

const nodeEnv = process.env.NODE_ENV || 'development';
const isDev = nodeEnv !== 'production';
const adminPassword = process.env.ADMIN_PASSWORD?.trim() || '';
const jwtSecret = resolveJwtSecret(isDev, adminPassword);

const frontendUrl = normalizeOrigin(process.env.FRONTEND_URL) ?? 'http://localhost:5566';
const adminUrl = normalizeOrigin(process.env.ADMIN_URL) ?? 'http://localhost:3001';

export const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tvexpress',
  jwtSecret,
  jwtSecretFromEnv: Boolean(process.env.JWT_SECRET?.trim() && process.env.JWT_SECRET.trim() !== DEV_JWT_SECRET),
  frontendUrl,
  adminUrl,
  allowedOrigins: [frontendUrl, adminUrl],
  isDev,
  adminPassword,
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || '',
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || '',
  cloudinaryFolder: process.env.CLOUDINARY_FOLDER || 'tvexpress',
};

export { DEV_JWT_SECRET };
