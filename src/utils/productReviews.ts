export interface ProductReviewInput {
  id: string;
  userName: string;
  rating: number;
  date: string;
  comment: string;
}

export function normalizeReviews(raw: unknown): ProductReviewInput[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const row = item as Record<string, unknown>;
      const comment = String(row.comment ?? '').trim();
      if (!comment) return null;
      const rating = Math.min(5, Math.max(1, Number(row.rating ?? 5)));
      return {
        id: String(row.id ?? `rev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`),
        userName: String(row.userName ?? 'Verified Customer').trim() || 'Verified Customer',
        rating,
        date: String(row.date ?? 'Today').trim() || 'Today',
        comment,
      };
    })
    .filter((item): item is ProductReviewInput => item !== null);
}

export function computeReviewStats(reviews: ProductReviewInput[]) {
  if (!reviews.length) return { rating: 4.5, reviewsCount: 0 };
  const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  return { rating: Math.round(avg * 10) / 10, reviewsCount: reviews.length };
}
