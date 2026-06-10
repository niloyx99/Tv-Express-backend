# TV EXPRESS Backend

Express + MongoDB API for the TV EXPRESS storefront.

## Local setup

1. Create `backend/.env` with your variables (see Render env list below).
2. `npm install`
3. `npm run seed` (first time only — loads products & home content)
4. `npm run dev`

API: `http://localhost:5000/api`

## Render.com deploy

| Setting | Value |
|---|---|
| Root Directory | `backend` |
| Build Command | `npm run render:build` |
| Start Command | `npm start` |
| Health Check | `/api/health` |

Or connect the repo and use the root `render.yaml` Blueprint.

### Required environment variables (Render dashboard)

| Variable | Description |
|---|---|
| `NODE_ENV` | `production` |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Long random secret |
| `ADMIN_PASSWORD` | Admin panel login password |
| `FRONTEND_URL` | Vercel storefront URL (no trailing slash) |
| `ADMIN_URL` | Render admin URL (no trailing slash) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `CLOUDINARY_FOLDER` | `tvexpress` |

`PORT` is set automatically by Render.

## Main endpoints

- `GET /api/health`
- `GET /api/products`
- `GET /api/categories`
- `POST /api/admin/auth/login`
