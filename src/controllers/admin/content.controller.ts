import type { Response } from 'express';
import { HomeContent } from '../../models/HomeContent.js';
import { DEFAULT_HOME_CONTENT } from '../../seed/home.data.js';
import { ApiError } from '../../utils/ApiError.js';
import type { AdminRequest } from '../../middleware/adminAuth.middleware.js';

const MIN_SLIDER_SLIDES = 1;
const MAX_SLIDER_SLIDES = 10;

async function getOrCreateHomeDoc() {
  let doc = await HomeContent.findOne({ key: 'main' });
  if (!doc) {
    doc = await HomeContent.create(DEFAULT_HOME_CONTENT);
  }
  return doc;
}

export async function getHomeContentAdmin(_req: AdminRequest, res: Response) {
  const doc = await getOrCreateHomeDoc();
  res.json({ success: true, data: doc.toObject() });
}

export async function updateBanners(req: AdminRequest, res: Response) {
  const doc = await getOrCreateHomeDoc();
  const { heroMain, sliderSlides } = req.body;

  if (heroMain && typeof heroMain === 'object') {
    doc.set('heroMain', { ...(doc.heroMain as object), ...heroMain });
  }
  if (Array.isArray(sliderSlides)) {
    const cleaned = sliderSlides
      .map((slide: { image?: string; alt?: string; category?: string }) => ({
        image: String(slide?.image ?? '').trim(),
        alt: String(slide?.alt ?? '').trim(),
        category: String(slide?.category ?? 'electronics').trim() || 'electronics',
      }))
      .filter((slide) => slide.image)
      .slice(0, MAX_SLIDER_SLIDES);

    if (cleaned.length < MIN_SLIDER_SLIDES) {
      throw new ApiError(400, `Carousel needs at least ${MIN_SLIDER_SLIDES} slide with an image (max ${MAX_SLIDER_SLIDES}).`);
    }

    doc.set('sliderSlides', cleaned);
  }

  doc.markModified('heroMain');
  doc.markModified('sliderSlides');

  await doc.save();
  res.json({ success: true, data: doc.toObject(), message: 'Banner content updated' });
}

export async function updatePromoCard(req: AdminRequest, res: Response) {
  const doc = await getOrCreateHomeDoc();
  const promoId = req.params.id;
  const idx = doc.promoCards.findIndex((p) => p.id === promoId);

  if (idx === -1) throw new ApiError(404, 'Promo card not found');

  const current = doc.promoCards[idx];
  const patch = req.body;
  current.set({
    badge: patch.badge ?? current.badge,
    title: patch.title ?? current.title,
    titleHighlight: patch.titleHighlight ?? current.titleHighlight,
    buttonText: patch.buttonText ?? current.buttonText,
    image: patch.image ?? current.image,
    category: patch.category ?? current.category,
    tone: patch.tone ?? current.tone,
  });

  doc.markModified('promoCards');
  await doc.save();
  res.json({ success: true, data: doc.toObject(), message: 'Promo card updated' });
}

export async function updateWeeklyDealsSettings(req: AdminRequest, res: Response) {
  const doc = await getOrCreateHomeDoc();
  const patch = req.body;
  const current = (doc.weeklyDealsSettings as Record<string, unknown>) || {};

  doc.set('weeklyDealsSettings', {
    eyebrow: patch.eyebrow ?? current.eyebrow ?? 'Exclusive limited time offers',
    title: patch.title ?? current.title ?? 'Weekly Best Deals',
    offerEndsAt: patch.offerEndsAt ? new Date(patch.offerEndsAt) : current.offerEndsAt ?? new Date(),
  });

  doc.markModified('weeklyDealsSettings');
  await doc.save();
  res.json({ success: true, data: doc.toObject(), message: 'Weekly deals settings updated' });
}

export async function updateCategoryStripSettings(req: AdminRequest, res: Response) {
  const doc = await getOrCreateHomeDoc();
  const patch = req.body;
  const current = (doc.categoryStripSettings as Record<string, unknown>) || {};

  doc.set('categoryStripSettings', {
    eyebrow: patch.eyebrow ?? current.eyebrow ?? 'Quick Discovery',
    title: patch.title ?? current.title ?? 'Shop Deals by Category',
    subtitle: patch.subtitle ?? current.subtitle ?? '',
  });

  doc.markModified('categoryStripSettings');
  await doc.save();
  res.json({ success: true, data: doc.toObject(), message: 'Category strip updated' });
}
