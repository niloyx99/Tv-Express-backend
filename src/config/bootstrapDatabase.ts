import os from 'os';
import mongoose from 'mongoose';
import { Admin } from '../models/Admin.js';
import { Blog } from '../models/Blog.js';
import { HomeContent } from '../models/HomeContent.js';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { ServerBootLog } from '../models/ServerBootLog.js';
import { ShopCategory } from '../models/ShopCategory.js';
import { SiteAnalytics } from '../models/SiteAnalytics.js';
import { StoreSettings, DEFAULT_STORE_SETTINGS, migrateLegacyEmailSettings } from '../models/StoreSettings.js';
import { User } from '../models/User.js';
import { ensureAdminAccount } from './ensureAdmin.js';

const APP_MODELS = [
  Product,
  User,
  Order,
  Admin,
  Blog,
  HomeContent,
  ShopCategory,
  SiteAnalytics,
  StoreSettings,
  ServerBootLog,
] as const;

async function ensureCollection(model: (typeof APP_MODELS)[number]) {
  const collectionName = model.collection.name;
  const exists = (await mongoose.connection.db!.listCollections({ name: collectionName }).toArray()).length > 0;
  if (!exists) {
    await model.createCollection();
    console.log(`Created MongoDB collection: ${collectionName}`);
  }
  await model.syncIndexes();
}

async function ensureDefaultDocuments() {
  const analytics = await SiteAnalytics.findOne({ key: 'main' });
  if (!analytics) {
    await SiteAnalytics.create({ key: 'main', totalVisits: 0, todayVisits: 0, lastVisitDate: '' });
    console.log('Initialized siteanalytics collection document');
  }

  const settings = await StoreSettings.findOne({ key: 'main' });
  if (!settings) {
    await StoreSettings.create(DEFAULT_STORE_SETTINGS);
    console.log('Initialized storesettings collection document');
  } else if (migrateLegacyEmailSettings(settings)) {
    await settings.save();
    console.log('Updated legacy placeholder email settings to tvexpressbd@gmail.com');
  }
}

async function recordBootLog() {
  const entry = await ServerBootLog.create({
    bootedAt: new Date(),
    hostname: os.hostname(),
    nodeVersion: process.version,
    pid: process.pid,
    mongoDb: mongoose.connection.name,
    appVersion: '1.0.0',
    status: 'API running',
    message: 'API running — backend started, collections ready',
  });
  console.log(`Boot logged: API running → server_boot_logs (${entry._id.toString()})`);
}

/** Run once when the API server starts (e.g. after laptop boot + npm run dev). */
export async function bootstrapDatabase() {
  if (mongoose.connection.readyState !== 1) {
    throw new Error('MongoDB must be connected before bootstrap');
  }

  console.log('Ensuring MongoDB collections...');
  for (const model of APP_MODELS) {
    await ensureCollection(model);
  }

  await ensureDefaultDocuments();
  await ensureAdminAccount();

  await recordBootLog();
  console.log(`Database bootstrap complete (${APP_MODELS.length} collections checked)`);
}
