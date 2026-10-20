# Run locally (frontend + backend)

## Architecture

```text
React SPA (http://localhost:1122)
   │  POST/GET/PATCH/DELETE /api/v1/*  (Bearer JWT)
   ▼
Fastify API (http://localhost:3000)
   │  service-role key
   ▼
Supabase Postgres (users, products, cart_items, orders, order_items, favorites)
```

In development Vite proxies `/api` to `http://localhost:3000`, so the browser sees a single origin and CORS is not involved.

---

## 1. Supabase setup

1. Open your project: https://supabase.com/dashboard
2. Go to **SQL Editor**.
3. Run the full contents of:
   `supabase/migrations/20261020000000_backend_integration.sql`
4. Go to **Project Settings → API** and copy:
   - **Project URL**
   - **Secret key** (`sb_secret_...` or the legacy `service_role` key)

> Do not use the publishable/anon key (`sb_publishable_...`) for `SUPABASE_SERVICE_KEY`.
> It cannot write to the tables and protected reads will fail.

---

## 2. Backend

```bash
cd backend
npm install
cp .env.example .env   # only if .env does not exist
```

Edit `backend/.env`:

```env
PORT=3000
NODE_ENV=development

DATABASE_URL=postgresql://unused:unused@localhost:5432/unused
SUPABASE_URL=https://<your-project-ref>.supabase.co
SUPABASE_SERVICE_KEY=<sb_secret_...>

JWT_SECRET=<at least 32 random characters>
JWT_EXPIRES_IN=7d

CORS_ORIGINS=http://localhost:1122
RATE_LIMIT_MAX=100
RATE_LIMIT_TIMEWINDOW=60000
```

Generate a JWT secret:

```bash
openssl rand -hex 32
```

Start:

```bash
npm run dev
```

Verify:

```bash
curl http://localhost:3000/api/v1/health
curl http://localhost:3000/api/v1/products
```

The second command should return six seeded products.

---

## 3. Frontend

From the repository root:

```bash
npm install
npm run dev
```

Open http://localhost:1122.

The API base URL defaults to `/api/v1`, which the Vite proxy forwards to the backend. To point at a different API, copy `.env.example` to `.env.local` and set:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

---

## 4. End-to-end test

1. Open http://localhost:1122.
2. Register a new account (`/auth`). Passwords must be at least 8 characters.
3. The homepage products should come from Supabase.
4. Open a product, add it to the cart.
5. Change quantity / remove items on `/cart`.
6. Add/remove favorites.
7. Click **Passer la commande** on `/cart`.
8. Check `/orders` and `/profile`.

All business data is now stored in Supabase. The only browser storage is the JWT session under `plg:auth`.

---

## 5. Useful commands

```bash
# Frontend
npm run build
npm run lint
npx tsc -p tsconfig.app.json --noEmit

# Backend
cd backend
npm run build
npm run dev
```

---

## 6. Troubleshooting

| Error | Cause / fix |
|---|---|
| `PGRST205 Could not find the table 'public.products'` | Migration not run in the new Supabase project |
| `SUPABASE_SERVICE_KEY is a publishable/placeholder key` warning | Replace with the secret key `sb_secret_...` |
| `Invalid environment variables` | Missing `backend/.env` value; `JWT_SECRET` must be 32+ chars |
| CORS error in the browser | Use the Vite proxy (`/api`) or set `CORS_ORIGINS=http://localhost:1122` and restart the backend |
| 401 on cart/favorites/orders | Missing/expired token; log in again |
| Frontend shows “Impossible de charger…” | Backend is not running or the database is not migrated |
| `bcrypt` install error | Use Node 20 LTS and reinstall backend dependencies |

---

## 7. Old Supabase credentials

The root `.env` still contains `VITE_SUPABASE_*` variables from the original demo. The frontend no longer uses Supabase directly, so they can be removed. Never commit a `service_role` or `sb_secret_` key.
