# Diamond Electronics API

Modules A-C provide the base Express API, Prisma, Google OAuth + JWT auth, and catalog/admin endpoints.

## Routes
- `GET /api/health`
- `GET /api/whoami`
- `POST /api/auth/google`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/products`
- `GET /api/products/:slug`
- `GET /api/categories`
- `GET /api/admin/products`
- `POST /api/admin/products`
- `GET /api/admin/categories`
- `GET /api/cart`
- `POST /api/cart/items`
- `POST /api/checkout`
- `GET /api/orders`
- `GET /api/admin/orders`

## Local dev
1. Copy `.env.example` to `.env` and update values.
2. Run `npm install`.
3. Run `npm run dev`.

## Prisma
- `npm run prisma:generate`
- `npm run prisma:migrate`
- `npm run prisma:seed`
