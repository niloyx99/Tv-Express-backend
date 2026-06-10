import type { Response } from 'express';
import { StoreSettings, DEFAULT_STORE_SETTINGS, migrateLegacyEmailSettings } from '../../models/StoreSettings.js';
import type { AdminRequest } from '../../middleware/adminAuth.middleware.js';

function toEmailSettingsPayload(doc: {
  supportEmail: string;
  orderNotificationEmail: string;
  senderName: string;
  replyToEmail: string;
  orderConfirmTemplate: string;
}) {
  return {
    supportEmail: doc.supportEmail,
    orderNotificationEmail: doc.orderNotificationEmail,
    senderName: doc.senderName,
    replyToEmail: doc.replyToEmail,
    orderConfirmTemplate: doc.orderConfirmTemplate,
  };
}

async function getOrCreateSettings() {
  let doc = await StoreSettings.findOne({ key: 'main' });
  if (!doc) {
    doc = await StoreSettings.create(DEFAULT_STORE_SETTINGS);
  } else if (migrateLegacyEmailSettings(doc)) {
    await doc.save();
  }
  return doc;
}

export async function getEmailSettings(_req: AdminRequest, res: Response) {
  const doc = await getOrCreateSettings();
  res.json({ success: true, data: toEmailSettingsPayload(doc) });
}

export async function updateEmailSettings(req: AdminRequest, res: Response) {
  const doc = await getOrCreateSettings();
  const fields = ['supportEmail', 'orderNotificationEmail', 'senderName', 'replyToEmail', 'orderConfirmTemplate'] as const;
  for (const key of fields) {
    if (req.body[key] !== undefined) doc.set(key, req.body[key]);
  }
  await doc.save();
  res.json({ success: true, data: toEmailSettingsPayload(doc), message: 'Email settings updated' });
}
