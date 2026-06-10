import type { Response } from 'express';
import { Blog } from '../../models/Blog.js';
import { ApiError } from '../../utils/ApiError.js';
import type { AdminRequest } from '../../middleware/adminAuth.middleware.js';

export async function listBlogs(_req: AdminRequest, res: Response) {
  const blogs = await Blog.find().sort({ sortOrder: 1, createdAt: -1 }).lean();
  res.json({ success: true, data: blogs });
}

export async function createBlog(req: AdminRequest, res: Response) {
  const body = req.body;
  if (!body.id || !body.title || !body.image || !body.category) {
    throw new ApiError(400, 'id, title, image and category are required');
  }

  const exists = await Blog.findOne({ id: body.id });
  if (exists) throw new ApiError(409, 'Blog ID already exists');

  const blog = await Blog.create({
    id: body.id,
    image: body.image,
    alt: body.alt || '',
    tag: body.tag || 'Blog',
    tagColor: body.tagColor || 'bg-[#083A32]',
    date: body.date || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }),
    title: body.title,
    excerpt: body.excerpt || '',
    category: body.category,
    published: body.published !== false,
    sortOrder: Number(body.sortOrder ?? 0),
  });

  res.status(201).json({ success: true, data: blog });
}

export async function updateBlog(req: AdminRequest, res: Response) {
  const blog = await Blog.findOne({ id: req.params.id });
  if (!blog) throw new ApiError(404, 'Blog not found');

  const fields = ['image', 'alt', 'tag', 'tagColor', 'date', 'title', 'excerpt', 'category', 'published'] as const;
  for (const key of fields) {
    if (req.body[key] !== undefined) blog.set(key, req.body[key]);
  }
  if (req.body.sortOrder !== undefined) blog.sortOrder = Number(req.body.sortOrder);

  await blog.save();
  res.json({ success: true, data: blog });
}

export async function deleteBlog(req: AdminRequest, res: Response) {
  const blog = await Blog.findOneAndDelete({ id: req.params.id });
  if (!blog) throw new ApiError(404, 'Blog not found');
  res.json({ success: true, message: 'Blog deleted' });
}
