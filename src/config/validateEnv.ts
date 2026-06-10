import { env } from './env.js';

const DEV_JWT_SECRET = 'tvexpress-dev-secret-change-in-production';

export function validateEnv() {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!env.mongoUri || env.mongoUri.includes('127.0.0.1')) {
    if (env.isDev) {
      warnings.push('MONGODB_URI is using local fallback — set Atlas URI for production.');
    } else {
      errors.push('MONGODB_URI is required in production (MongoDB Atlas connection string).');
    }
  }

  if (!env.jwtSecret || env.jwtSecret === DEV_JWT_SECRET) {
    if (env.isDev) {
      warnings.push('JWT_SECRET is using dev fallback — set a strong secret for production.');
    } else {
      errors.push('JWT_SECRET must be set to a long random value in production.');
    }
  }

  if (!env.adminPassword) {
    if (env.isDev) {
      warnings.push('ADMIN_PASSWORD is not set — admin login will fail.');
    } else {
      errors.push('ADMIN_PASSWORD is required in production.');
    }
  }

  if (!env.isDev) {
    if (env.frontendUrl.includes('localhost')) {
      warnings.push('FRONTEND_URL still points to localhost — update after Vercel deploy.');
    }
    if (env.adminUrl.includes('localhost')) {
      warnings.push('ADMIN_URL still points to localhost — update after Admin deploy.');
    }
    if (!env.cloudinaryCloudName || !env.cloudinaryApiKey || !env.cloudinaryApiSecret) {
      warnings.push('Cloudinary is not fully configured — image uploads will fail.');
    }
  }

  for (const warning of warnings) {
    console.warn(`[env] ${warning}`);
  }

  if (errors.length > 0) {
    console.error('');
    console.error('========================================');
    console.error('  ✗  ENVIRONMENT CONFIGURATION ERROR');
    console.error('========================================');
    for (const error of errors) {
      console.error(`  • ${error}`);
    }
    console.error('');
    console.error('  Set missing variables in the Render dashboard → Environment.');
    console.error('========================================');
    console.error('');
    process.exit(1);
  }
}
