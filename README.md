# Souqli Backend API

Beginner-friendly Node.js + Express + MySQL backend with JWT auth, RBAC, and clean REST APIs.

## Requirements
- Node.js 18+
- MySQL 8+

## Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create your MySQL database and apply the schema.
   - The repo includes `sql_table.txt`, which is DBML-style. If you already have SQL migrations, run those.
   - If you want to use `sql_table.txt`, convert it to SQL (for example using dbdiagram.io) and then run the SQL in MySQL.
3. Create `.env` from `.env.example` and fill in your values.

## Run
- Development:
  ```bash
  npm run dev
  ```
- Production:
  ```bash
  npm start
  ```

## API Base URL
`http://localhost:3000`

## Auth
- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/auth/me`

## Admin (RBAC protected)
- CRUD Categories: `/api/admin/categories`
- CRUD Products: `/api/admin/products`
- CRUD Attributes + Options: `/api/admin/attributes`
- CRUD Pages: `/api/admin/pages`
- Activity Logs: `/api/admin/activity-logs`

## Store
- GET Categories Tree: `/api/categories`
- GET Products (pagination + search + filter): `/api/products`
- GET Product Details: `/api/products/:id`

## Cart (Auth required)
- POST `/api/cart/items`
- PATCH `/api/cart/items/:id`
- DELETE `/api/cart/items/:id`
- GET `/api/cart`

## Orders (Auth required)
- POST `/api/orders`
- GET `/api/orders/my`

## RBAC Note
Admin endpoints require permissions stored in the database (tables: `roles`, `permissions`, `role_permissions`, `user_roles`).
Create roles/permissions and assign them to your admin users before calling admin endpoints.

## Example cURL
Register:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"full_name":"John Doe","email":"john@example.com","password":"secret123"}'
```

Login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"secret123"}'
```

Create Category (Admin):
```bash
curl -X POST http://localhost:3000/api/admin/categories \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Electronics","slug":"electronics"}'
```

List Products:
```bash
curl "http://localhost:3000/api/products?page=1&limit=10&q=phone&category_id=1"
```

Add to Cart:
```bash
curl -X POST http://localhost:3000/api/cart/items \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"product_id":1,"quantity":2}'
```

Create Order:
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"address_id":1,"notes":"Leave at the door"}'
```

## Admin Panel (React)
The React dashboard lives in `admin-panel/` as a separate app.

```bash
cd admin-panel
npm install
npm run dev
```

If your API runs on a different host or port, create `admin-panel/.env`:
```bash
VITE_API_URL=http://localhost:3000
```

## Seed Data
Use `seed.sql` to quickly populate demo data:
```bash
mysql -u root souqli < seed.sql
```
