import type { Request, Response } from 'express';
import { Product } from '../models/Product.js';
import { ShopCategory } from '../models/ShopCategory.js';
import { DEFAULT_SHOP_CATEGORIES } from '../seed/categories.data.js';
import { ApiError } from '../utils/ApiError.js';

export async function getProducts(req: Request, res: Response) {
  const { category, search } = req.query;
  const filter: Record<string, unknown> = {};

  if (typeof category === 'string' && category !== 'all') {
    filter.category = category;
  }

  if (typeof search === 'string' && search.trim()) {
    const term = search.trim();
    filter.$or = [
      { name: { $regex: term, $options: 'i' } },
      { description: { $regex: term, $options: 'i' } },
      { category: { $regex: term, $options: 'i' } },
    ];
  }

  const products = await Product.find(filter).sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: products });
}

export async function getProductById(req: Request, res: Response) {
  const product = await Product.findOne({ id: req.params.id }).lean();
  if (!product) throw new ApiError(404, 'Product not found');
  res.json({ success: true, data: product });
}

export async function getCategories(_req: Request, res: Response) {
  let categories = await ShopCategory.find().sort({ sortOrder: 1, createdAt: 1 }).lean();
  if (categories.length === 0) {
    await ShopCategory.insertMany(DEFAULT_SHOP_CATEGORIES);
    categories = await ShopCategory.find().sort({ sortOrder: 1, createdAt: 1 }).lean();
  }

  const counts = await Product.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]);
  const countMap = Object.fromEntries(counts.map((c) => [c._id, c.count]));
  const total = counts.reduce((sum, c) => sum + c.count, 0);

  const data = categories.map((cat) => ({
    id: cat.id,
    name: cat.label,
    label: cat.label,
    image: cat.image,
    count: cat.id === 'all' ? total : countMap[cat.id] || 0,
  }));

  res.json({ success: true, data });
}
