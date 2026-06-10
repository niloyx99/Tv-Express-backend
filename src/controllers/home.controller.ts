import type { Request, Response } from 'express';
import { HomeContent } from '../models/HomeContent.js';
import { DEFAULT_HOME_CONTENT } from '../seed/home.data.js';
import { recordSiteVisit } from '../models/SiteAnalytics.js';

export async function getHomeContent(_req: Request, res: Response) {
  recordSiteVisit().catch(() => {});
  let doc = await HomeContent.findOne({ key: 'main' }).lean();
  if (!doc) {
    doc = (await HomeContent.create(DEFAULT_HOME_CONTENT)).toObject();
  }
  res.json({ success: true, data: doc });
}
