import mongoose, { Schema, type InferSchemaType } from 'mongoose';

const siteAnalyticsSchema = new Schema(
  {
    key: { type: String, default: 'main', unique: true },
    totalVisits: { type: Number, default: 0 },
    todayVisits: { type: Number, default: 0 },
    lastVisitDate: { type: String, default: '' },
  },
  { timestamps: true, versionKey: false }
);

export type SiteAnalyticsDocument = InferSchemaType<typeof siteAnalyticsSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const SiteAnalytics = mongoose.model('SiteAnalytics', siteAnalyticsSchema);

export async function recordSiteVisit() {
  const today = new Date().toISOString().slice(0, 10);
  let doc = await SiteAnalytics.findOne({ key: 'main' });
  if (!doc) {
    doc = await SiteAnalytics.create({ key: 'main', totalVisits: 1, todayVisits: 1, lastVisitDate: today });
    return doc;
  }
  if (doc.lastVisitDate !== today) {
    doc.todayVisits = 0;
    doc.lastVisitDate = today;
  }
  doc.totalVisits += 1;
  doc.todayVisits += 1;
  await doc.save();
  return doc;
}
