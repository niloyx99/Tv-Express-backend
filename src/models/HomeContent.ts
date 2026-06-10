import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const heroMainSchema = new Schema(
  {
    badge: { type: String, default: '' },
    titleLine1: { type: String, default: '' },
    titleAccent: { type: String, default: '' },
    description: { type: String, default: '' },
    buttonText: { type: String, default: '' },
    image: { type: String, default: '' },
    category: { type: String, default: 'all' },
  },
  { _id: false }
);

const slideSchema = new Schema(
  {
    image: { type: String, required: true },
    alt: { type: String, default: '' },
    category: { type: String, default: 'electronics' },
  },
  { _id: false }
);

const promoSchema = new Schema(
  {
    id: { type: String, required: true },
    badge: { type: String, default: '' },
    title: { type: String, default: '' },
    titleHighlight: { type: String, default: '' },
    buttonText: { type: String, default: '' },
    image: { type: String, default: '' },
    category: { type: String, default: 'all' },
    tone: { type: String, enum: ['emerald', 'amber', 'cyan'], default: 'emerald' },
  },
  { _id: false }
);

const weeklyDealsSettingsSchema = new Schema(
  {
    eyebrow: { type: String, default: 'Exclusive limited time offers' },
    title: { type: String, default: 'Weekly Best Deals' },
    offerEndsAt: { type: Date, default: () => new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
  },
  { _id: false }
);

const categoryStripSettingsSchema = new Schema(
  {
    eyebrow: { type: String, default: 'Quick Discovery' },
    title: { type: String, default: 'Shop Deals by Category' },
    subtitle: {
      type: String,
      default: 'Premium home refrigerators, smart 4K TVs, super quiet inverter air conds, and modern kitchen gadgets.',
    },
  },
  { _id: false }
);

const homeContentSchema = new Schema(
  {
    key: { type: String, default: 'main', unique: true },
    heroMain: { type: heroMainSchema, required: true },
    sliderSlides: { type: [slideSchema], default: [] },
    promoCards: { type: [promoSchema], default: [] },
    weeklyDealsSettings: { type: weeklyDealsSettingsSchema, default: () => ({}) },
    categoryStripSettings: { type: categoryStripSettingsSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export type HomeContentDocument = InferSchemaType<typeof homeContentSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const HomeContent = mongoose.model('HomeContent', homeContentSchema);
