import type { Response } from 'express';
import { Product } from '../../models/Product.js';
import { ApiError } from '../../utils/ApiError.js';
import { computeReviewStats, normalizeReviews } from '../../utils/productReviews.js';
import type { AdminRequest } from '../../middleware/adminAuth.middleware.js';

const MAX_GALLERY = 4;

function normalizeGallery(image?: string, images?: string[]) {
  const cleaned = (images ?? []).map((url) => String(url).trim()).filter(Boolean).slice(0, MAX_GALLERY);
  const main = image?.trim() || cleaned[0] || '';
  const merged = main ? [main, ...cleaned.filter((url) => url !== main)] : cleaned;
  return {
    image: merged[0] ?? '',
    images: merged.slice(0, MAX_GALLERY),
  };
}

export async function listProducts(req: AdminRequest, res: Response) {
  const { search, category } = req.query;
  const filter: Record<string, unknown> = {};

  if (typeof category === 'string' && category !== 'all') filter.category = category;
  if (typeof search === 'string' && search.trim()) {
    const term = search.trim();
    filter.$or = [
      { name: { $regex: term, $options: 'i' } },
      { id: { $regex: term, $options: 'i' } },
    ];
  }

  const products = await Product.find(filter).sort({ createdAt: -1 }).lean();
  res.json({ success: true, data: products });
}

export async function createProduct(req: AdminRequest, res: Response) {
  const body = req.body;
  if (!body.id || !body.name || !body.category || body.price == null) {
    throw new ApiError(400, 'id, name, category and price are required');
  }

  const exists = await Product.findOne({ id: body.id });
  if (exists) throw new ApiError(409, 'Product ID already exists');

  const gallery = normalizeGallery(body.image, body.images);
  const reviews = normalizeReviews(body.reviews);
  const reviewStats = computeReviewStats(reviews);

  const product = await Product.create({
    id: body.id,
    name: body.name,
    category: body.category,
    price: Number(body.price),
    originalPrice: Number(body.originalPrice ?? body.price),
    rating: reviews.length ? reviewStats.rating : Number(body.rating ?? 4.5),
    reviewsCount: reviews.length ? reviewStats.reviewsCount : Number(body.reviewsCount ?? 0),
    image: gallery.image,
    images: gallery.images,
    badge: body.badge || '',
    description: body.description || '',
    features: body.features || [],
    colors: body.colors || [],
    sizes: body.sizes || [],
    stock: Number(body.stock ?? 0),
    detailTab: body.detailTab || {},
    specificationTab: body.specificationTab || {},
    shippingTab: body.shippingTab || {},
    reviews,
  });

  res.status(201).json({ success: true, data: product });
}

export async function updateProduct(req: AdminRequest, res: Response) {
  const product = await Product.findOne({ id: req.params.id });
  if (!product) throw new ApiError(404, 'Product not found');

  if (req.body.name !== undefined) product.name = req.body.name;
  if (req.body.category !== undefined) product.category = req.body.category;
  if (req.body.price !== undefined) product.price = Number(req.body.price);
  if (req.body.originalPrice !== undefined) product.originalPrice = Number(req.body.originalPrice);
  if (req.body.rating !== undefined) product.rating = Number(req.body.rating);
  if (req.body.reviewsCount !== undefined) product.reviewsCount = Number(req.body.reviewsCount);
  if (req.body.image !== undefined || req.body.images !== undefined) {
    const gallery = normalizeGallery(
      req.body.image !== undefined ? req.body.image : product.image,
      req.body.images !== undefined ? req.body.images : product.images
    );
    product.image = gallery.image;
    product.images = gallery.images;
  }
  if (req.body.badge !== undefined) product.badge = req.body.badge;
  if (req.body.description !== undefined) product.description = req.body.description;
  if (req.body.features !== undefined) product.features = req.body.features;
  if (req.body.colors !== undefined) product.colors = req.body.colors;
  if (req.body.sizes !== undefined) product.sizes = req.body.sizes;
  if (req.body.stock !== undefined) product.stock = Number(req.body.stock);
  if (req.body.detailTab !== undefined) product.detailTab = req.body.detailTab;
  if (req.body.specificationTab !== undefined) product.specificationTab = req.body.specificationTab;
  if (req.body.shippingTab !== undefined) product.shippingTab = req.body.shippingTab;
  if (req.body.reviews !== undefined) {
    const reviews = normalizeReviews(req.body.reviews);
    const reviewStats = computeReviewStats(reviews);
    product.set('reviews', reviews);
    product.rating = reviewStats.rating;
    product.reviewsCount = reviewStats.reviewsCount;
  }

  await product.save();
  res.json({ success: true, data: product });
}

export async function deleteProduct(req: AdminRequest, res: Response) {
  const product = await Product.findOneAndDelete({ id: req.params.id });
  if (!product) throw new ApiError(404, 'Product not found');
  res.json({ success: true, message: 'Product deleted' });
}
