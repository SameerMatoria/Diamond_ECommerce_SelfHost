# API Docs (Modules A - C)

## Health

`GET /api/health`

Response:

```json
{ "status": "ok", "service": "diamond-electronics-api" }
```

## Whoami

`GET /api/whoami`

Headers:
`Authorization: Bearer <accessToken>`

Response:

```json
{ "user": { "id": "...", "email": "...", "name": "...", "role": "USER" } }
```

## Auth: Google Login

`POST /api/auth/google`

Body:

```json
{ "idToken": "google-id-token" }
```

Response:

```json
{ "accessToken": "...", "user": { "id": "...", "email": "...", "name": "...", "role": "USER" } }
```

Sets `refreshToken` httpOnly cookie.

## Auth: Refresh

`POST /api/auth/refresh`

Uses `refreshToken` cookie.

Response:

```json
{ "accessToken": "...", "user": { "id": "...", "email": "...", "name": "...", "role": "USER" } }
```

## Auth: Logout

`POST /api/auth/logout`

Clears `refreshToken` cookie.

Response:

```json
{ "status": "ok" }
```

## Products (public)

`GET /api/products`

Query params: `page`, `limit`, `search`, `category`, `minPrice`, `maxPrice`

Response:

```json
{ "items": [], "page": 1, "limit": 12, "total": 0, "pages": 0 }
```

`GET /api/products/:slug`

Response:

```json
{ "product": {} }
```

## Categories (public)

`GET /api/categories`

Response:

```json
{ "categories": [] }
```

## Admin: Categories

`GET /api/admin/categories`
`POST /api/admin/categories`
`PUT /api/admin/categories/:id`
`DELETE /api/admin/categories/:id`

## Admin: Products

`GET /api/admin/products`
`GET /api/admin/products/:id`
`POST /api/admin/products`
`PUT /api/admin/products/:id`
`DELETE /api/admin/products/:id`

## Admin: Product Images

`POST /api/admin/products/:id/images`
`DELETE /api/admin/products/:id/images/:imageId`

## Admin: Uploads

`POST /api/admin/uploads/presign`

Body:

```json
{ "filename": "image.jpg", "contentType": "image/jpeg" }
```

Response:

```json
{ "url": "...", "key": "...", "publicUrl": "..." }
```

## Cart (auth required)

`GET /api/cart`
`POST /api/cart/items`
`PUT /api/cart/items/:itemId`
`DELETE /api/cart/items/:itemId`

Add item body:

```json
{ "productId": "prod-id", "qty": 2 }
```

Update item body:

```json
{ "qty": 3 }
```

Response:

```json
{ "cart": {}, "totals": { "subtotal": 0, "totalItems": 0 } }
```

## Checkout (auth required)

`POST /api/checkout`

Body:

```json
{
  "address": {
    "fullName": "Name",
    "phone": "9999999999",
    "line1": "Street",
    "line2": "Optional",
    "city": "City",
    "state": "State",
    "postalCode": "123456",
    "country": "IN"
  },
  "shippingFee": 0
}
```

Response:

```json
{ "order": {} }
```

## Orders (auth required)

`GET /api/orders`
`GET /api/orders/:id`

Response list:

```json
{ "items": [], "page": 1, "limit": 10, "total": 0, "pages": 0 }
```

Response detail:

```json
{ "order": {} }
```

## Admin: Orders

`GET /api/admin/orders`
`GET /api/admin/orders/:id`
`PUT /api/admin/orders/:id/status`
`PUT /api/admin/orders/:id/payment-status`

Status body:

```json
{ "status": "SHIPPED" }
```

Payment body:

```json
{ "paymentStatus": "PAID" }
```

## Admin: Users

`GET /api/admin/users`
`PUT /api/admin/users/:id/role`

Role body:

```json
{ "role": "ADMIN" }
```
