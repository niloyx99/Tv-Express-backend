import type { Response } from 'express';
import { Product } from '../../models/Product.js';
import { Order } from '../../models/Order.js';
import { User } from '../../models/User.js';
import { SiteAnalytics } from '../../models/SiteAnalytics.js';
import type { AdminRequest } from '../../middleware/adminAuth.middleware.js';

export async function getDashboardStats(_req: AdminRequest, res: Response) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [productCount, orderCount, customerCount, newRegistrations, revenueAgg, recentOrders, lowStock, analytics] =
    await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Order.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.find().sort({ createdAt: -1 }).limit(5).lean(),
      Product.find({ stock: { $lte: 5 } }).sort({ stock: 1 }).limit(6).lean(),
      SiteAnalytics.findOne({ key: 'main' }).lean(),
    ]);

  const ordersByStatus = await Order.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const categoryBreakdown = await Product.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  res.json({
    success: true,
    data: {
      stats: {
        products: productCount,
        orders: orderCount,
        customers: customerCount,
        registeredUsers: customerCount,
        newRegistrations,
        totalVisits: analytics?.totalVisits ?? 0,
        todayVisits: analytics?.todayVisits ?? 0,
        revenue: revenueAgg[0]?.total ?? 0,
        processing: ordersByStatus.find((s) => s._id === 'Processing')?.count ?? 0,
        shipped: ordersByStatus.find((s) => s._id === 'Shipped')?.count ?? 0,
        delivered: ordersByStatus.find((s) => s._id === 'Delivered')?.count ?? 0,
      },
      recentOrders: recentOrders.map((o) => ({
        id: o.orderId,
        date: o.date,
        total: o.total,
        status: o.status,
        customer: o.shippingAddress?.fullName,
      })),
      lowStock,
      categoryBreakdown,
    },
  });
}
