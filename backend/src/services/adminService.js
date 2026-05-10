const { pool } = require("../config/db");
const { comparePassword } = require("../utils/password");
const { hashPassword } = require("../utils/password");

function mapAdmin(admin) {
  return {
    id: Number(admin.id),
    name: admin.name,
    email: admin.email,
    createdAt: admin.created_at,
  };
}

async function authenticateAdmin({ email, password }) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const [rows] = await pool.execute(
    "SELECT id, name, email, password_hash, created_at FROM admins WHERE email = ? LIMIT 1",
    [normalizedEmail],
  );
  const admin = rows[0];
  if (!admin) return null;
  const ok = await comparePassword(password, admin.password_hash);
  if (!ok) return null;
  return mapAdmin(admin);
}

async function listUsersWithSubscription() {
  const [rows] = await pool.execute(
    `SELECT u.id, u.name, u.email, u.is_active, u.created_at,
            us.id AS subscription_id, us.plan, us.status, us.started_at, us.ends_at
     FROM users u
     LEFT JOIN user_subscriptions us ON us.user_id = u.id
     ORDER BY u.created_at DESC`,
  );
  return rows.map((row) => ({
    id: Number(row.id),
    name: row.name,
    email: row.email,
    is_active: Boolean(row.is_active),
    created_at: row.created_at,
    subscription: row.subscription_id
      ? {
          id: Number(row.subscription_id),
          plan: row.plan,
          status: row.status,
          started_at: row.started_at,
          ends_at: row.ends_at,
        }
      : null,
  }));
}

async function setUserActive(userId, isActive) {
  const [result] = await pool.execute(
    "UPDATE users SET is_active = ? WHERE id = ?",
    [isActive ? 1 : 0, userId],
  );
  return result.affectedRows > 0;
}

async function createManagedUser({ name, email, password, isActive = true }) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const cleanedName = String(name || "").trim();
  if (!cleanedName || !normalizedEmail || !String(password || "").trim()) {
    const error = new Error("name, email, and password are required.");
    error.status = 400;
    throw error;
  }

  const [existing] = await pool.execute(
    "SELECT id FROM users WHERE email = ? LIMIT 1",
    [normalizedEmail],
  );
  if (existing.length > 0) {
    const error = new Error("Email already exists.");
    error.status = 409;
    throw error;
  }

  const passwordHash = await hashPassword(password);
  const [result] = await pool.execute(
    "INSERT INTO users (name, email, password_hash, is_active) VALUES (?, ?, ?, ?)",
    [cleanedName, normalizedEmail, passwordHash, isActive ? 1 : 0],
  );

  await pool.execute(
    `INSERT INTO user_subscriptions (user_id, plan, status, started_at)
     VALUES (?, 'starter', 'active', CURDATE())
     ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP`,
    [result.insertId],
  );

  const [rows] = await pool.execute(
    "SELECT id, name, email, is_active, created_at FROM users WHERE id = ? LIMIT 1",
    [result.insertId],
  );
  return rows[0] || null;
}

async function updateManagedUser(userId, payload) {
  const [rows] = await pool.execute(
    "SELECT id, name, email, is_active FROM users WHERE id = ? LIMIT 1",
    [userId],
  );
  const existing = rows[0];
  if (!existing) return null;

  const nextName =
    payload.name !== undefined ? String(payload.name || "").trim() : existing.name;
  const nextEmail =
    payload.email !== undefined
      ? String(payload.email || "").trim().toLowerCase()
      : existing.email;
  const nextIsActive =
    payload.is_active !== undefined ? (payload.is_active ? 1 : 0) : existing.is_active;

  if (!nextName || !nextEmail) {
    const error = new Error("name and email cannot be empty.");
    error.status = 400;
    throw error;
  }

  const [emailRows] = await pool.execute(
    "SELECT id FROM users WHERE email = ? AND id <> ? LIMIT 1",
    [nextEmail, userId],
  );
  if (emailRows.length > 0) {
    const error = new Error("Email already exists.");
    error.status = 409;
    throw error;
  }

  await pool.execute(
    "UPDATE users SET name = ?, email = ?, is_active = ? WHERE id = ?",
    [nextName, nextEmail, nextIsActive, userId],
  );

  if (payload.password !== undefined && String(payload.password).trim().length > 0) {
    const passwordHash = await hashPassword(String(payload.password));
    await pool.execute("UPDATE users SET password_hash = ? WHERE id = ?", [
      passwordHash,
      userId,
    ]);
  }

  const [updatedRows] = await pool.execute(
    "SELECT id, name, email, is_active, created_at FROM users WHERE id = ? LIMIT 1",
    [userId],
  );
  return updatedRows[0] || null;
}

async function deleteManagedUser(userId) {
  const [result] = await pool.execute("DELETE FROM users WHERE id = ?", [userId]);
  return result.affectedRows > 0;
}

async function listProductsAdmin({ search = "" } = {}) {
  const term = `%${String(search || "").trim()}%`;
  const hasSearch = String(search || "").trim().length > 0;
  const [rows] = await pool.execute(
    `SELECT p.id, p.name, p.sku, p.category, p.quantity, p.selling_price, p.created_at,
            u.id AS user_id, u.name AS owner_name, u.email AS owner_email
     FROM products p
     INNER JOIN users u ON u.id = p.user_id
     ${hasSearch ? "WHERE p.name LIKE ? OR IFNULL(p.sku, '') LIKE ? OR u.email LIKE ?" : ""}
     ORDER BY p.created_at DESC`,
    hasSearch ? [term, term, term] : [],
  );
  return rows.map((row) => ({
    id: Number(row.id),
    name: row.name,
    sku: row.sku || "",
    category: row.category,
    quantity: Number(row.quantity),
    selling_price: Number(row.selling_price),
    owner: {
      id: Number(row.user_id),
      name: row.owner_name,
      email: row.owner_email,
    },
    created_at: row.created_at,
  }));
}

async function createManagedProduct(payload) {
  const userId = Number(payload.user_id);
  const name = String(payload.name || "").trim();
  const category = String(payload.category || "Other").trim() || "Other";
  const sku = String(payload.sku || "").trim() || null;
  const quantity = Math.max(0, Math.floor(Number(payload.quantity)) || 0);
  const sellingPrice = Number(payload.selling_price) || 0;
  const costPrice = Number(payload.cost_price) || 0;
  const qrCode =
    String(payload.qr_code || "").trim().toUpperCase() ||
    `ADMIN-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  if (!userId || !name) {
    const error = new Error("user_id and name are required.");
    error.status = 400;
    throw error;
  }

  const [result] = await pool.execute(
    `INSERT INTO products (
      user_id, name, sku, qr_code, category, unit, quantity,
      cost_price, selling_price, low_stock_threshold, expiry_date, supplier, location, image
    ) VALUES (?, ?, ?, ?, ?, 'pcs', ?, ?, ?, 5, NULL, NULL, NULL, NULL)`,
    [userId, name, sku, qrCode, category, quantity, costPrice, sellingPrice],
  );

  if (quantity > 0) {
    await pool.execute(
      `INSERT INTO stock_movements (user_id, product_id, movement_type, quantity)
       VALUES (?, ?, 'stock_in', ?)`,
      [userId, result.insertId, quantity],
    );
  }

  const [rows] = await pool.execute(
    `SELECT p.id, p.name, p.sku, p.category, p.quantity, p.selling_price, p.created_at,
            u.id AS user_id, u.name AS owner_name, u.email AS owner_email
     FROM products p
     INNER JOIN users u ON u.id = p.user_id
     WHERE p.id = ? LIMIT 1`,
    [result.insertId],
  );
  return rows[0] || null;
}

async function updateManagedProduct(productId, payload) {
  const [currentRows] = await pool.execute(
    "SELECT id, user_id, name, sku, category, quantity, selling_price, cost_price FROM products WHERE id = ? LIMIT 1",
    [productId],
  );
  const current = currentRows[0];
  if (!current) return null;

  const nextUserId =
    payload.user_id !== undefined ? Number(payload.user_id) : Number(current.user_id);
  const nextName =
    payload.name !== undefined ? String(payload.name || "").trim() : current.name;
  const nextSku =
    payload.sku !== undefined ? (String(payload.sku || "").trim() || null) : current.sku;
  const nextCategory =
    payload.category !== undefined
      ? String(payload.category || "Other").trim() || "Other"
      : current.category;
  const nextQty =
    payload.quantity !== undefined
      ? Math.max(0, Math.floor(Number(payload.quantity)) || 0)
      : Number(current.quantity);
  const nextSellingPrice =
    payload.selling_price !== undefined
      ? Number(payload.selling_price) || 0
      : Number(current.selling_price);
  const nextCostPrice =
    payload.cost_price !== undefined
      ? Number(payload.cost_price) || 0
      : Number(current.cost_price || 0);

  if (!nextUserId || !nextName) {
    const error = new Error("user_id and name are required.");
    error.status = 400;
    throw error;
  }

  await pool.execute(
    `UPDATE products
     SET user_id = ?, name = ?, sku = ?, category = ?, quantity = ?, selling_price = ?, cost_price = ?
     WHERE id = ?`,
    [
      nextUserId,
      nextName,
      nextSku,
      nextCategory,
      nextQty,
      nextSellingPrice,
      nextCostPrice,
      productId,
    ],
  );

  const [rows] = await pool.execute(
    `SELECT p.id, p.name, p.sku, p.category, p.quantity, p.selling_price, p.created_at,
            u.id AS user_id, u.name AS owner_name, u.email AS owner_email
     FROM products p
     INNER JOIN users u ON u.id = p.user_id
     WHERE p.id = ? LIMIT 1`,
    [productId],
  );
  return rows[0] || null;
}

async function deleteProductAdmin(productId) {
  const [result] = await pool.execute("DELETE FROM products WHERE id = ?", [productId]);
  return result.affectedRows > 0;
}

async function listSubscriptions() {
  const [rows] = await pool.execute(
    `SELECT us.id, us.user_id, us.plan, us.status, us.started_at, us.ends_at, us.updated_at,
            u.name, u.email
     FROM user_subscriptions us
     INNER JOIN users u ON u.id = us.user_id
     ORDER BY us.updated_at DESC`,
  );
  return rows.map((row) => ({
    id: Number(row.id),
    user_id: Number(row.user_id),
    user_name: row.name,
    user_email: row.email,
    plan: row.plan,
    status: row.status,
    started_at: row.started_at,
    ends_at: row.ends_at,
    updated_at: row.updated_at,
  }));
}

async function upsertSubscription(userId, payload) {
  const plan = String(payload.plan || "starter").toLowerCase();
  const status = String(payload.status || "active").toLowerCase();
  const startedAt = payload.started_at ? String(payload.started_at).slice(0, 10) : null;
  const endsAt = payload.ends_at ? String(payload.ends_at).slice(0, 10) : null;

  await pool.execute(
    `INSERT INTO user_subscriptions (user_id, plan, status, started_at, ends_at)
     VALUES (?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       plan = VALUES(plan),
       status = VALUES(status),
       started_at = VALUES(started_at),
       ends_at = VALUES(ends_at)`,
    [userId, plan, status, startedAt, endsAt],
  );

  const [rows] = await pool.execute(
    "SELECT id, user_id, plan, status, started_at, ends_at, updated_at FROM user_subscriptions WHERE user_id = ? LIMIT 1",
    [userId],
  );
  return rows[0] || null;
}

async function listActivityLogs({ limit = 200 } = {}) {
  const safeLimit = Math.min(500, Math.max(1, Number(limit) || 200));
  const [rows] = await pool.execute(
    `SELECT id, actor_type, actor_id, action, target_type, target_id, metadata, created_at
     FROM activity_logs
     ORDER BY created_at DESC
     LIMIT ?`,
    [safeLimit],
  );
  return rows.map((row) => ({
    id: Number(row.id),
    actor_type: row.actor_type,
    actor_id: row.actor_id ? Number(row.actor_id) : null,
    action: row.action,
    target_type: row.target_type,
    target_id: row.target_id,
    metadata: row.metadata ? JSON.parse(row.metadata) : null,
    created_at: row.created_at,
  }));
}

async function createPartnershipInquiry({
  userId,
  companyName,
  contactName,
  email,
  message,
}) {
  const [result] = await pool.execute(
    `INSERT INTO partnership_inquiries
      (user_id, company_name, contact_name, email, message, status)
     VALUES (?, ?, ?, ?, ?, 'new')`,
    [userId, companyName, contactName, email, message || null],
  );
  const [rows] = await pool.execute(
    `SELECT id, user_id, company_name, contact_name, email, message, status, created_at, updated_at
     FROM partnership_inquiries
     WHERE id = ? LIMIT 1`,
    [result.insertId],
  );
  return rows[0] || null;
}

async function listPartnerships() {
  const [rows] = await pool.execute(
    `SELECT p.id, p.user_id, p.company_name, p.contact_name, p.email, p.message, p.status, p.admin_note, p.created_at, p.updated_at,
            u.name AS user_name, u.email AS user_email
     FROM partnership_inquiries p
     LEFT JOIN users u ON u.id = p.user_id
     ORDER BY p.updated_at DESC, p.created_at DESC`,
  );
  return rows.map((row) => ({
    id: Number(row.id),
    user_id: row.user_id ? Number(row.user_id) : null,
    user_name: row.user_name || null,
    user_email: row.user_email || null,
    company_name: row.company_name,
    contact_name: row.contact_name,
    email: row.email,
    message: row.message || "",
    status: row.status,
    admin_note: row.admin_note || "",
    created_at: row.created_at,
    updated_at: row.updated_at,
  }));
}

async function updatePartnership(partnershipId, payload) {
  const status = payload.status ? String(payload.status).toLowerCase() : "new";
  const adminNote =
    payload.admin_note !== undefined && payload.admin_note !== null
      ? String(payload.admin_note)
      : null;
  await pool.execute(
    "UPDATE partnership_inquiries SET status = ?, admin_note = ? WHERE id = ?",
    [status, adminNote, partnershipId],
  );
  const [rows] = await pool.execute(
    `SELECT id, user_id, company_name, contact_name, email, message, status, admin_note, created_at, updated_at
     FROM partnership_inquiries
     WHERE id = ? LIMIT 1`,
    [partnershipId],
  );
  return rows[0] || null;
}

module.exports = {
  authenticateAdmin,
  listUsersWithSubscription,
  createManagedUser,
  updateManagedUser,
  deleteManagedUser,
  setUserActive,
  listProductsAdmin,
  createManagedProduct,
  updateManagedProduct,
  deleteProductAdmin,
  listSubscriptions,
  upsertSubscription,
  createPartnershipInquiry,
  listPartnerships,
  updatePartnership,
  listActivityLogs,
};
