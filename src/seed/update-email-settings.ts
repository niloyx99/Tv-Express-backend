import { connectDatabase } from '../config/database.js';
import { StoreSettings, migrateLegacyEmailSettings } from '../models/StoreSettings.js';

async function updateEmailSettings() {
  await connectDatabase();

  const settings = await StoreSettings.findOne({ key: 'main' });
  if (!settings) {
    console.log('No store settings found — they will be created on next server boot.');
    process.exit(0);
  }

  if (migrateLegacyEmailSettings(settings)) {
    await settings.save();
    console.log('Email settings updated to tvexpressbd@gmail.com');
  } else {
    console.log('Email settings already use real addresses — no changes needed.');
  }

  console.log({
    supportEmail: settings.supportEmail,
    orderNotificationEmail: settings.orderNotificationEmail,
    replyToEmail: settings.replyToEmail,
    senderName: settings.senderName,
  });

  process.exit(0);
}

updateEmailSettings().catch((err) => {
  console.error('Email settings update failed:', err);
  process.exit(1);
});
