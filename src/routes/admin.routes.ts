import { Router } from 'express';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { requireAdmin } from '../middleware/adminAuth.middleware.js';
import * as adminAuth from '../controllers/admin/auth.controller.js';
import * as dashboard from '../controllers/admin/dashboard.controller.js';
import * as products from '../controllers/admin/products.controller.js';
import * as orders from '../controllers/admin/orders.controller.js';
import * as customers from '../controllers/admin/customers.controller.js';
import * as blogs from '../controllers/admin/blogs.controller.js';
import * as content from '../controllers/admin/content.controller.js';
import * as categories from '../controllers/admin/categories.controller.js';
import * as settings from '../controllers/admin/settings.controller.js';
import * as upload from '../controllers/admin/upload.controller.js';

const router = Router();

router.post('/auth/login', asyncHandler(adminAuth.adminLogin));
router.get('/auth/me', requireAdmin, asyncHandler(adminAuth.adminMe));

router.use(requireAdmin);

router.post('/upload', (req, res, next) => {
  upload.uploadImageMiddleware(req, res, (err) => {
    if (err) return upload.handleUploadError(err, req, res, next);
    next();
  });
}, asyncHandler(upload.handleUploadImage));

router.get('/dashboard', asyncHandler(dashboard.getDashboardStats));

router.get('/content/home', asyncHandler(content.getHomeContentAdmin));
router.post('/content/banners', asyncHandler(content.updateBanners));
router.put('/content/promo/:id', asyncHandler(content.updatePromoCard));
router.put('/content/weekly-deals', asyncHandler(content.updateWeeklyDealsSettings));
router.put('/content/category-strip', asyncHandler(content.updateCategoryStripSettings));

router.get('/categories', asyncHandler(categories.listCategories));
router.post('/categories', asyncHandler(categories.createCategory));
router.put('/categories/:id', asyncHandler(categories.updateCategory));
router.delete('/categories/:id', asyncHandler(categories.deleteCategory));

router.get('/settings/email', asyncHandler(settings.getEmailSettings));
router.put('/settings/email', asyncHandler(settings.updateEmailSettings));

router.get('/products', asyncHandler(products.listProducts));
router.post('/products', asyncHandler(products.createProduct));
router.put('/products/:id', asyncHandler(products.updateProduct));
router.delete('/products/:id', asyncHandler(products.deleteProduct));

router.get('/blogs', asyncHandler(blogs.listBlogs));
router.post('/blogs', asyncHandler(blogs.createBlog));
router.put('/blogs/:id', asyncHandler(blogs.updateBlog));
router.delete('/blogs/:id', asyncHandler(blogs.deleteBlog));

router.get('/orders', asyncHandler(orders.listOrders));
router.patch('/orders/:id/status', asyncHandler(orders.updateOrderStatus));
router.delete('/orders/:id', asyncHandler(orders.deleteOrder));

router.get('/customers', asyncHandler(customers.listCustomers));
router.patch('/customers/:email/ban', asyncHandler(customers.toggleCustomerBan));
router.get('/customers/:email/orders', asyncHandler(customers.getCustomerOrders));
router.delete('/customers/:email', asyncHandler(customers.deleteCustomer));

export default router;
