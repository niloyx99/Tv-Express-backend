import type { Request, Response } from 'express';
import { Blog } from '../models/Blog.js';

export async function getBlogs(_req: Request, res: Response) {
  const blogs = await Blog.find({ published: true }).sort({ sortOrder: 1, createdAt: -1 }).lean();
  res.json({ success: true, data: blogs });
}
