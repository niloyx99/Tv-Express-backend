import { getApiRuntimeStatus, markApiRunning } from './config/serverRuntime.js';
import { createApp } from './app.js';
import { connectDatabase } from './config/database.js';
import { bootstrapDatabase } from './config/bootstrapDatabase.js';
import { env } from './config/env.js';
import { validateEnv } from './config/validateEnv.js';

async function start() {
  validateEnv();
  await connectDatabase();
  await bootstrapDatabase();
  const app = createApp();

  app.listen(env.port, '0.0.0.0', () => {
    markApiRunning();
    const base = env.isDev ? `http://localhost:${env.port}` : `port ${env.port}`;
    console.log('');
    console.log('========================================');
    console.log('  ✓  API RUNNING');
    console.log('========================================');
    console.log(`  Server : ${base}`);
    console.log(`  CORS   : ${env.allowedOrigins.join(', ')}`);
    console.log(`  Health : /api/health`);
    console.log('========================================');
    console.log('');
  });
}

start().catch((err) => {
  console.error('');
  console.error('========================================');
  console.error('  ✗  BACKEND FAILED TO START');
  console.error('========================================');
  if (err instanceof Error) {
    console.error(`  ${err.message}`);
    if (err.message.includes('ECONNREFUSED') || err.message.includes('MongoServerSelectionError')) {
      console.error('  → Check MONGODB_URI and Atlas Network Access (allow 0.0.0.0/0).');
    }
  } else {
    console.error(err);
  }
  console.error('========================================');
  console.error('');
  process.exit(1);
});
