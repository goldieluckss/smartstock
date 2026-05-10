# Techno-Mobile-APP-Backend

Node.js + Express backend with JWT authentication for `Techno-Mobile-APP`.

## Features

- User signup and login
- Password hashing with bcrypt
- JWT token authentication
- Protected current user endpoint
- MySQL database support (XAMPP)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from `.env.example`:

```bash
copy .env.example .env
```

3. Create database in XAMPP MySQL:

- Open XAMPP and start `Apache` and `MySQL`.
- Open [http://localhost/phpmyadmin](http://localhost/phpmyadmin).
- Run:

```bash
npm run db:init
```

- Optional: if you prefer manual setup, run `sql/init.sql` in phpMyAdmin.

4. Update `.env` values for your MySQL setup:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=techno_mobile_app
```

5. Start development server:

```bash
npm run dev
```

## API Endpoints

- `GET /` - Basic status
- `GET /api/health` - Health check
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user (Bearer token required)

### Inventory (Bearer token required)

- `GET /api/products` - List products (`?search=` `&category=`)
- `GET /api/products/movements/recent` - Recent stock movements (`?limit=15`)
- `GET /api/products/alerts/summary` - Low stock, out of stock, and expiry groupings
- `GET /api/products/movements` - All stock movements (`?type=stock_in|stock_out|sold|return|adjustment`; omit for all)
- `POST /api/products/:id/movements` - Record a movement and update `products.quantity` (JSON: `movement_type`, `quantity`)

**Stock vs `stock_movements`:** `products.quantity` is the current on-hand count. Each change should be reflected in `stock_movements` (audit log). Creating or editing quantity via the API already writes movements where applicable; `POST .../movements` applies an increment or decrement and appends one row.
- `POST /api/products` - Create product
- `GET /api/products/:id` - Get one product
- `PATCH /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/:id/movements` - Movements for a product

After pulling changes, run `npm run db:init` once so MySQL creates `products` and `stock_movements` tables.

### Sample data (demo login + products)

```bash
npm run db:seed
```

This creates (or reuses) a demo account and inserts sample products so Inventory, Dashboard, and Alerts show real rows:

- **Email:** `demo@smartstock.local`
- **Password:** `demo123`

Running `db:seed` again clears that user’s products and re-inserts the sample list (movements are recreated for the first items). It also **resets the demo account password** to `demo123`, so login works even if that email was used before with a different password.

If login still returns 401, confirm MySQL is running, `.env` points at the same database as the app, the API is on port **5000**, and run `npm run db:seed` again from `Techno-Mobile-APP-Backend`.

## Example requests

### Signup

```http
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "123456"
}
```

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "123456"
}
```
