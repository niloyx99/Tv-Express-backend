import dotenv from 'dotenv';

dotenv.config();

function normalizeOrigin(url?: string): string | null {
  const trimmed = url?.trim();
  if (!trimmed) return null;
  return trimmed.replace(/\/$/, '');
}

const frontendUrl = normalizeOrigin(process.env.FRONTEND_URL) ?? 'http://localhost:5566';
const adminUrl = normalizeOrigin(process.env.ADMIN_URL) ?? 'http://localhost:3001';

export const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tvexpress',
  jwtSecret: process.env.JWT_SECRET || 'tvexpress-dev-secret-change-in-production',
  frontendUrl,
  adminUrl,
  allowedOrigins: [frontendUrl, adminUrl],
  isDev: process.env.NODE_ENV !== 'production',
  adminPassword: process.env.ADMIN_PASSWORD || '',
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || '',
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || '',
  cloudinaryFolder: process.env.CLOUDINARY_FOLDER || 'tvexpress',
};
