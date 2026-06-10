import bcrypt from 'bcryptjs';
import { connectDatabase } from '../config/database.js';
import { Product } from '../models/Product.js';
import { Admin } from '../models/Admin.js';
import { PRODUCTS } from './products.data.js';
import { BLOGS } from './blogs.data.js';
import { Blog } from '../models/Blog.js';
import { HomeContent } from '../models/HomeContent.js';
import { ShopCategory } from '../models/ShopCategory.js';
import { DEFAULT_HOME_CONTENT } from './home.data.js';
import { DEFAULT_SHOP_CATEGORIES } from './categories.data.js';

const DEFAULT_GALLERY_EXTRAS = [
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=600',
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=600',
];

function withGallery<T extends { image: string; images?: string[] }>(product: T) {
  if (product.images?.length) return product;
  return { ...product, images: [product.image, ...DEFAULT_GALLERY_EXTRAS] };
}

async function seed() {
  await connectDatabase();

  console.log('Clearing old data...');
  await Promise.all([
    Product.deleteMany({}),
    Admin.deleteMany({}),
    Blog.deleteMany({}),
    HomeContent.deleteMany({}),
    ShopCategory.deleteMany({}),
  ]);

  console.log('Seeding products...');
  await Product.insertMany(PRODUCTS.map(withGallery));

  console.log('Seeding blogs...');
  await Blog.insertMany(BLOGS);

  console.log('Seeding home content...');
  await HomeContent.create(DEFAULT_HOME_CONTENT);

  console.log('Seeding shop categories...');
  await ShopCategory.insertMany(DEFAULT_SHOP_CATEGORIES);

  console.log('Seeding admin user...');
  const adminPassword = await bcrypt.hash('Admin@123456', 10);
  await Admin.create({
    name: 'TV EXPRESS Admin',
    email: 'admin@tvexpress.com',
    password: adminPassword,
    role: 'superadmin',
  });

  console.log(`Seeded ${PRODUCTS.length} products and 1 admin account.`);
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
