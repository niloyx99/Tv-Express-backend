import bcrypt from 'bcryptjs';
import { Admin } from '../models/Admin.js';
import { env } from './env.js';

/** Creates the default admin record if the database has none (Render first boot). */
export async function ensureAdminAccount() {
  const existing = await Admin.findOne();
  if (existing) return;

  if (!env.adminPassword) {
    console.warn('[bootstrap] No ADMIN_PASSWORD — skipping admin account creation.');
    return;
  }

  const hashed = await bcrypt.hash(env.adminPassword, 10);
  await Admin.create({
    name: 'TV EXPRESS Admin',
    email: 'admin@tvexpress.com',
    password: hashed,
    role: 'superadmin',
  });

  console.log('[bootstrap] Created default admin account (login uses ADMIN_PASSWORD from env).');
}
