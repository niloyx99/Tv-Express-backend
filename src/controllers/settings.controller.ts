import type { Request, Response } from 'express';
import { StoreSettings, DEFAULT_STORE_SETTINGS, migrateLegacyEmailSettings } from '../models/StoreSettings.js';

async function getOrCreateSettings() {
  let doc = await StoreSettings.findOne({ key: 'main' });
  if (!doc) {
    doc = await StoreSettings.create(DEFAULT_STORE_SETTINGS);
  } else if (migrateLegacyEmailSettings(doc)) {
    await doc.save();
  }
  return doc;
}

export async function getStoreContact(_req: Request, res: Response) {
  const doc = await getOrCreateSettings();
  res.json({
    success: true,
    data: {
      supportEmail: doc.supportEmail,
      storeAddress: doc.storeAddress,
      storePhone: doc.storePhone,
      senderName: doc.senderName,
    },
  });
}
