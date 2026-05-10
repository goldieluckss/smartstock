const { pool } = require("../config/db");
const { hashPassword } = require("../utils/password");

const DEMO_EMAIL = "demo@smartstock.local";
const DEMO_PASSWORD = "demo123";
const DEMO_NAME = "Demo User";
const ADMIN_EMAIL = "admin@smartstock.local";
const ADMIN_PASSWORD = "admin123";
const ADMIN_NAME = "System Admin";

function addDays(base, days) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

async function ensureDemoUser() {
  const passwordHash = await hashPassword(DEMO_PASSWORD);
  const [existing] = await pool.execute(
    "SELECT id FROM users WHERE email = ? LIMIT 1",
    [DEMO_EMAIL],
  );
  if (existing.length) {
    await pool.execute(
      "UPDATE users SET password_hash = ?, name = ? WHERE id = ?",
      [passwordHash, DEMO_NAME, existing[0].id],
    );
    return existing[0].id;
  }

  const [result] = await pool.execute(
    "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
    [DEMO_NAME, DEMO_EMAIL, passwordHash],
  );
  return result.insertId;
}

async function ensureAdminUser() {
  const passwordHash = await hashPassword(ADMIN_PASSWORD);
  const [existing] = await pool.execute(
    "SELECT id FROM admins WHERE email = ? LIMIT 1",
    [ADMIN_EMAIL],
  );
  if (existing.length) {
    await pool.execute(
      "UPDATE admins SET password_hash = ?, name = ? WHERE id = ?",
      [passwordHash, ADMIN_NAME, existing[0].id],
    );
    return existing[0].id;
  }
  const [result] = await pool.execute(
    "INSERT INTO admins (name, email, password_hash) VALUES (?, ?, ?)",
    [ADMIN_NAME, ADMIN_EMAIL, passwordHash],
  );
  return result.insertId;
}

async function seedProducts(userId) {
  await pool.execute("DELETE FROM products WHERE user_id = ?", [userId]);

  const today = new Date();
  const dExpired = addDays(today, -14);
  const dSoon = addDays(today, 3);
  const dLater = addDays(today, 18);
  const dFar = addDays(today, 120);

  const rows = [
    {
      name: "Coke",
      sku: "COKE-001",
      qr: "DEMO-QR-COKE",
      category: "Beverages",
      unit: "pcs",
      qty: 0,
      cost: 45,
      sell: 65,
      low: 5,
      expiry: dFar,
      supplier: "Local Beverages",
      location: "Shelf A1",
    },
    {
      name: "Rice",
      sku: "RICE-5KG",
      qr: "DEMO-QR-RICE",
      category: "Rice & Grains",
      unit: "kg",
      qty: 2,
      cost: 200,
      sell: 260,
      low: 5,
      expiry: dFar,
      supplier: "Grain Co",
      location: "Shelf B2",
    },
    {
      name: "Milk",
      sku: "MLK-1L",
      qr: "DEMO-QR-MILK",
      category: "Dairy",
      unit: "L",
      qty: 10,
      cost: 70,
      sell: 95,
      low: 5,
      expiry: dSoon,
      supplier: "Dairy Fresh",
      location: "Chiller 1",
    },
    {
      name: "Yogurt",
      sku: "YGT-500",
      qr: "DEMO-QR-YOG",
      category: "Dairy",
      unit: "pcs",
      qty: 4,
      cost: 35,
      sell: 55,
      low: 5,
      expiry: dExpired,
      supplier: "Dairy Fresh",
      location: "Chiller 1",
    },
    {
      name: "Canned Beans",
      sku: "CAN-BEAN",
      qr: "DEMO-QR-BEAN",
      category: "Canned Goods",
      unit: "can",
      qty: 8,
      cost: 40,
      sell: 58,
      low: 4,
      expiry: dLater,
      supplier: "Imports Inc",
      location: "Shelf C4",
    },
    {
      name: "Instant Noodles",
      sku: "NOOD-001",
      qr: "DEMO-QR-NOOD",
      category: "Snacks",
      unit: "pack",
      qty: 4,
      cost: 10,
      sell: 15,
      low: 5,
      expiry: dFar,
      supplier: "Snack House",
      location: "Shelf D1",
    },
    {
      name: "Bottled Water",
      sku: "H2O-500",
      qr: "DEMO-QR-H2O",
      category: "Beverages",
      unit: "pcs",
      qty: 24,
      cost: 8,
      sell: 15,
      low: 10,
      expiry: dFar,
      supplier: "Pure Water",
      location: "Shelf A2",
    },
    {
      name: "Eggs",
      sku: "EGG-TRAY",
      qr: "DEMO-QR-EGG",
      category: "Dairy",
      unit: "tray",
      qty: 12,
      cost: 150,
      sell: 210,
      low: 5,
      expiry: dSoon,
      supplier: "Farm Direct",
      location: "Chiller 2",
    },
  ];

  for (const r of rows) {
    await pool.execute(
      `INSERT INTO products (
        user_id, name, sku, qr_code, category, unit, quantity,
        cost_price, selling_price, low_stock_threshold, expiry_date,
        supplier, location
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        r.name,
        r.sku,
        r.qr,
        r.category,
        r.unit,
        r.qty,
        r.cost,
        r.sell,
        r.low,
        r.expiry,
        r.supplier,
        r.location,
      ],
    );
  }

  const [inserted] = await pool.execute(
    "SELECT id, quantity FROM products WHERE user_id = ? ORDER BY id ASC",
    [userId],
  );

  const plans = [
    [
      { type: "stock_in", quantity: 24 },
      { type: "sold", quantity: 24 },
    ],
    [
      { type: "stock_in", quantity: 30 },
      { type: "stock_out", quantity: 28 },
    ],
    [
      { type: "stock_in", quantity: 40 },
      { type: "sold", quantity: 18 },
      { type: "stock_out", quantity: 12 },
    ],
    [
      { type: "stock_in", quantity: 24 },
      { type: "stock_out", quantity: 12 },
      { type: "sold", quantity: 8 },
    ],
    [
      { type: "stock_in", quantity: 22 },
      { type: "stock_out", quantity: 14 },
    ],
    [
      { type: "stock_in", quantity: 22 },
      { type: "stock_out", quantity: 10 },
      { type: "sold", quantity: 8 },
    ],
    [
      { type: "stock_in", quantity: 48 },
      { type: "stock_out", quantity: 24 },
    ],
    [
      { type: "stock_in", quantity: 36 },
      { type: "sold", quantity: 14 },
      { type: "return", quantity: 2 },
      { type: "stock_out", quantity: 12 },
    ],
  ];

  for (let i = 0; i < inserted.length && i < plans.length; i += 1) {
    const productId = inserted[i].id;
    const moves = plans[i];
    let step = moves.length;
    for (const m of moves) {
      const createdAt = new Date(Date.now() - step * 3 * 60 * 60 * 1000);
      await pool.execute(
        `INSERT INTO stock_movements (user_id, product_id, movement_type, quantity, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [userId, productId, m.type, m.quantity, createdAt],
      );
      step -= 1;
    }
  }
}

async function run() {
  await ensureAdminUser();
  const userId = await ensureDemoUser();
  await seedProducts(userId);
  await pool.execute(
    `INSERT INTO user_subscriptions (user_id, plan, status, started_at)
     VALUES (?, 'pro', 'active', CURDATE())
     ON DUPLICATE KEY UPDATE plan = VALUES(plan), status = VALUES(status), started_at = VALUES(started_at)`,
    [userId],
  );
  await pool.end();
  console.log("Sample data ready.");
  console.log(`  Login email:    ${DEMO_EMAIL}`);
  console.log(`  Login password: ${DEMO_PASSWORD}`);
  console.log(`  Admin email:    ${ADMIN_EMAIL}`);
  console.log(`  Admin password: ${ADMIN_PASSWORD}`);
  console.log("  (Use these on the app login screen after npm run dev)");
}

run().catch((error) => {
  console.error("Seed failed:", error.message);
  process.exit(1);
});
