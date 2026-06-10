import { getApiRuntimeStatus } from './config/serverRuntime.js';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { env } from './config/env.js';
import routes from './routes/index.js';
import adminRoutes from './routes/admin.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

export function createApp() {
  const app = express();

  // Whitelist FRONTEND_URL (Vercel) and ADMIN_URL (Render) for cross-origin API access
  const allowedOrigins = [
    process.env.FRONTEND_URL?.trim().replace(/\/$/, '') || env.frontendUrl,
    process.env.ADMIN_URL?.trim().replace(/\/$/, '') || env.adminUrl,
  ];

  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    })
  );
  app.use(express.json({ limit: '2mb' }));
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  app.get('/', (_req, res) => {
    const runtime = getApiRuntimeStatus();
    res.json({
      name: 'TV EXPRESS API',
      version: '1.0.0',
      status: runtime.running ? 'API running' : 'API starting',
      health: '/api/health',
      uptime: runtime.uptime,
    });
  });

  app.use('/api', routes);
  app.use('/api/admin', adminRoutes);
  app.use(errorHandler);

  return app;
}
