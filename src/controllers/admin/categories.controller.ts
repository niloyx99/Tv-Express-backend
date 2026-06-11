import type { Response } from 'express';
import { Product } from '../../models/Product.js';
import { ShopCategory } from '../../models/ShopCategory.js';
import { ApiError } from '../../utils/ApiError.js';
import { DEFAULT_SHOP_CATEGORIES } from '../../seed/categories.data.js';
import type { AdminRequest } from '../../middleware/adminAuth.middleware.js';

async function ensureCategories() {
  const count = await ShopCategory.countDocuments();
  if (count === 0) {
    await ShopCategory.insertMany(DEFAULT_SHOP_CATEGORIES);
  }
}

async function attachCounts(categories: Array<{ id: string; label: string; image: string; sortOrder?: number }>) {
  const counts = await Product.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]);
  const countMap = Object.fromEntries(counts.map((c) => [c._id, c.count]));
  const total = counts.reduce((sum, c) => sum + c.count, 0);

  return categories.map((cat) => ({
    ...cat,
    count: cat.id === 'all' ? total : countMap[cat.id] || 0,
  }));
}

export async function listCategories(_req: AdminRequest, res: Response) {
  await ensureCategories();
  const categories = await ShopCategory.find().sort({ sortOrder: 1, createdAt: 1 }).lean();
  const withCounts = await attachCounts(categories);
  res.json({ success: true, data: withCounts });
}

export async function createCategory(req: AdminRequest, res: Response) {
  await ensureCategories();
  const { id, label, image, sortOrder } = req.body;

  if (!id || !label) throw new ApiError(400, 'id and label are required');
  if (id === 'all') throw new ApiError(400, 'Cannot create a category with id "all"');

  const slug = String(id).trim().toLowerCase().replace(/\s+/g, '-');
  const exists = await ShopCategory.findOne({ id: slug });
  if (exists) throw new ApiError(409, 'Category ID already exists');

  const category = await ShopCategory.create({
    id: slug,
    label: String(label).trim(),
    image: image || '',
    sortOrder: Number(sortOrder ?? (await ShopCategory.countDocuments())),
  });

  const [withCount] = await attachCounts([category.toObject()]);
  res.status(201).json({ success: true, data: withCount });
}

export async function updateCategory(req: AdminRequest, res: Response) {
  await ensureCategories();
  const category = await ShopCategory.findOne({ id: req.params.id });
  if (!category) throw new ApiError(404, 'Category not found');

  if (req.body.label !== undefined) category.label = String(req.body.label).trim();
  if (req.body.image !== undefined) category.image = req.body.image;
  if (req.body.sortOrder !== undefined) category.sortOrder = Number(req.body.sortOrder);

  await category.save();
  const [withCount] = await attachCounts([category.toObject()]);
  res.json({ success: true, data: withCount });
}

export async function deleteCategory(req: AdminRequest, res: Response) {
  const categoryId = req.params.id;
  if (categoryId === 'all') throw new ApiError(400, 'Cannot delete the "All Products" category');

  const category = await ShopCategory.findOne({ id: categoryId });
  if (!category) throw new ApiError(404, 'Category not found');

  const productCount = await Product.countDocuments({ category: categoryId });
  let reassignedTo = '';

  if (productCount > 0) {
    const requested = typeof req.query.reassignTo === 'string' ? req.query.reassignTo.trim() : '';
    let targetId = requested && requested !== categoryId ? requested : '';

    if (!targetId) {
      const fallback = await ShopCategory.findOne({ id: { $nin: ['all', categoryId] } })
        .sort({ sortOrder: 1, createdAt: 1 })
        .lean();
      if (!fallback) throw new ApiError(409, 'Cannot delete category: no other category exists to move products');
      targetId = fallback.id;
    } else {
      const exists = await ShopCategory.findOne({ id: targetId });
      if (!exists) throw new ApiError(400, 'Invalid reassignTo category');
    }

    await Product.updateMany({ category: categoryId }, { $set: { category: targetId } });
    reassignedTo = targetId;
  }

  await ShopCategory.deleteOne({ id: categoryId });
  res.json({
    success: true,
    message: 'Category deleted',
    reassignedTo: reassignedTo || undefined,
    reassignedCount: productCount,
  });
}
