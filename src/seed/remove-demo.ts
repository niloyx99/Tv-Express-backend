import { connectDatabase } from '../config/database.js';
import { Order } from '../models/Order.js';
import { User } from '../models/User.js';

const DEMO_ORDER_IDS = ['PM-749202'];
const DEMO_USER_EMAILS = ['traderaldifx@gmail.com', 'traderalfx@gmail.com'];
const DEMO_USER_NAMES = ['Aldi Trader FX'];

async function removeDemoData() {
  await connectDatabase();

  const orderResult = await Order.deleteMany({
    $or: [
      { orderId: { $in: DEMO_ORDER_IDS } },
      { 'shippingAddress.fullName': { $in: DEMO_USER_NAMES } },
    ],
  });

  const userResult = await User.deleteMany({
    $or: [
      { email: { $in: DEMO_USER_EMAILS.map((e) => e.toLowerCase()) } },
      { fullName: { $in: DEMO_USER_NAMES } },
    ],
  });

  console.log(`Removed ${orderResult.deletedCount} demo order(s).`);
  console.log(`Removed ${userResult.deletedCount} demo user(s).`);
  process.exit(0);
}

removeDemoData().catch((err) => {
  console.error('Demo cleanup failed:', err);
  process.exit(1);
});
