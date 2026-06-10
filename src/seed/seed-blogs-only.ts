import { connectDatabase } from '../config/database.js';
import { Blog } from '../models/Blog.js';
import { BLOGS } from './blogs.data.js';

async function main() {
  await connectDatabase();
  const count = await Blog.countDocuments();
  if (count === 0) {
    await Blog.insertMany(BLOGS);
    console.log(`Inserted ${BLOGS.length} blog posts.`);
  } else {
    console.log(`Blogs already exist (${count}). Skipped.`);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
