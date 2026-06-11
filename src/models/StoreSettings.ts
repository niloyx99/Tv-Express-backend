import mongoose, { Schema, type InferSchemaType } from 'mongoose';

export const STORE_SUPPORT_EMAIL = 'tvexpressbd@gmail.com';
export const DEFAULT_STORE_ADDRESS = 'Plot 14, Road 9, Sector 9, Uttara, Dhaka, Bangladesh';
export const DEFAULT_STORE_PHONE = '01734066622';

const storeSettingsSchema = new Schema(
  {
    key: { type: String, default: 'main', unique: true },
    supportEmail: { type: String, default: STORE_SUPPORT_EMAIL },
    orderNotificationEmail: { type: String, default: STORE_SUPPORT_EMAIL },
    senderName: { type: String, default: 'TV EXPRESS' },
    replyToEmail: { type: String, default: STORE_SUPPORT_EMAIL },
    orderConfirmTemplate: {
      type: String,
      default: 'Thank you for your order! We will notify you when it ships.',
    },
    storeAddress: { type: String, default: DEFAULT_STORE_ADDRESS },
    storePhone: { type: String, default: DEFAULT_STORE_PHONE },
  },
  { timestamps: true, versionKey: false }
);

export type StoreSettingsDocument = InferSchemaType<typeof storeSettingsSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const StoreSettings = mongoose.model('StoreSettings', storeSettingsSchema);

export const DEFAULT_STORE_SETTINGS = {
  key: 'main',
  supportEmail: STORE_SUPPORT_EMAIL,
  orderNotificationEmail: STORE_SUPPORT_EMAIL,
  senderName: 'TV EXPRESS',
  replyToEmail: STORE_SUPPORT_EMAIL,
  orderConfirmTemplate: 'Thank you for your order! We will notify you when it ships.',
  storeAddress: DEFAULT_STORE_ADDRESS,
  storePhone: DEFAULT_STORE_PHONE,
};

const LEGACY_PLACEHOLDER_EMAILS = new Set([
  'support@tvexpress.com',
  'orders@tvexpress.com',
  'noreply@tvexpress.com',
]);

export function migrateLegacyEmailSettings(
  settings: Pick<StoreSettingsDocument, 'supportEmail' | 'orderNotificationEmail' | 'replyToEmail'>
) {
  let changed = false;

  if (LEGACY_PLACEHOLDER_EMAILS.has(settings.supportEmail)) {
    settings.supportEmail = STORE_SUPPORT_EMAIL;
    changed = true;
  }
  if (LEGACY_PLACEHOLDER_EMAILS.has(settings.orderNotificationEmail)) {
    settings.orderNotificationEmail = STORE_SUPPORT_EMAIL;
    changed = true;
  }
  if (LEGACY_PLACEHOLDER_EMAILS.has(settings.replyToEmail)) {
    settings.replyToEmail = STORE_SUPPORT_EMAIL;
    changed = true;
  }

  return changed;
}
