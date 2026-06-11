import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAuth, optionalAuth } from '../middleware/auth.middleware.js';
import * as productController from '../controllers/product.controller.js';
import * as authController from '../controllers/auth.controller.js';
import * as orderController from '../controllers/order.controller.js';
import * as blogController from '../controllers/blog.controller.js';
import * as homeController from '../controllers/home.controller.js';
import * as settingsController from '../controllers/settings.controller.js';
import { requireAdmin } from '../middleware/adminAuth.middleware.js';
import * as adminContent from '../controllers/admin/content.controller.js';

import { getApiRuntimeStatus } from '../config/serverRuntime.js';

const router = Router();

router.get('/health', (_req, res) => {
  const runtime = getApiRuntimeStatus();
  res.json({
    success: true,
    status: runtime.status,
    message: 'API running',
    running: runtime.running,
    uptime: runtime.uptime,
    startedAt: runtime.startedAt,
    timestamp: new Date().toISOString(),
  });
});

router.get('/status', (_req, res) => {
  const runtime = getApiRuntimeStatus();
  res.json({
    success: true,
    ...runtime,
    service: 'TV EXPRESS API',
    database: 'connected',
    timestamp: new Date().toISOString(),
  });
});

// Products
router.get('/products', asyncHandler(productController.getProducts));
router.get('/products/:id', asyncHandler(productController.getProductById));
router.get('/categories', asyncHandler(productController.getCategories));
router.get('/blogs', asyncHandler(blogController.getBlogs));
router.get('/home', asyncHandler(homeController.getHomeContent));
router.get('/settings/contact', asyncHandler(settingsController.getStoreContact));
router.post('/content/banners', requireAdmin, asyncHandler(adminContent.updateBanners));

// Auth
router.post('/auth/register', asyncHandler(authController.register));
router.post('/auth/login', asyncHandler(authController.login));
router.get('/auth/me', requireAuth, asyncHandler(authController.getProfile));
router.put('/auth/profile', requireAuth, asyncHandler(authController.updateProfile));

// Orders
router.post('/orders', optionalAuth, asyncHandler(orderController.createOrder));
router.get('/orders', optionalAuth, asyncHandler(orderController.getOrders));
router.get('/orders/track/:orderId', asyncHandler(orderController.trackOrder));
router.get('/orders/:id', optionalAuth, asyncHandler(orderController.getOrderById));

export default router;
