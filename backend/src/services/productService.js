const { pool } = require("../config/db");

function slugifyCodePart(value) {
  return String(value || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 16);
}

function buildAutoQrCode({ name, sku }) {
  const namePart = slugifyCodePart(name).slice(0, 8) || "ITEM";
  const skuPart = slugifyCodePart(sku).slice(0, 8) || "GEN";
  const timePart = Date.now().toString(36).toUpperCase();
  const randPart = Math.random().toString(36).slice(2, 6).toUpperCase();

  return `${namePart}-${skuPart}-${timePart}-${randPart}`;
}

async function ensureUniqueQrCode(userId, requestedQrCode, context = {}) {
  const safeUserId = Number(userId);
  const { name = "", sku = "", excludeProductId = null } = context;

  const base =
    slugifyCodePart(requestedQrCode) ||
    buildAutoQrCode({
      name,
      sku,
    });

  for (let i = 0; i < 10; i += 1) {
    const candidate = i === 0 ? base : `${base}-${i + 1}`;

    const sql = `
      SELECT id FROM products
      WHERE user_id = ? AND qr_code = ?
      ${excludeProductId ? "AND id <> ?" : ""}
      LIMIT 1
    `;

    const params = excludeProductId
      ? [safeUserId, candidate, Number(excludeProductId)]
      : [safeUserId, candidate];

    const [rows] = await pool.execute(sql, params);

    if (rows.length === 0) {
      return candidate;
    }
  }

  return `${base}-${Date.now().toString(36).toUpperCase()}`;
}

function mapProductRow(row) {
  if (!row) return null;

  let expiry = row.expiry_date;

  if (expiry instanceof Date) {
    expiry = expiry.toISOString().slice(0, 10);
  } else if (typeof expiry === "string" && expiry.length > 10) {
    expiry = expiry.slice(0, 10);
  }

  return {
    id: row.id,
    name: row.name,
    sku: row.sku || "",
    qr_code: row.qr_code,
    category: row.category,
    unit: row.unit || "pcs",
    quantity: Number(row.quantity),
    cost_price: Number(row.cost_price),
    selling_price: Number(row.selling_price),
    low_stock_threshold: Number(row.low_stock_threshold),
    expiry_date: expiry || "",
    supplier: row.supplier || "",
    location: row.location || "",
    image: row.image || null,
    qr_scan_count: Number(row.qr_scan_count || 0),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function listProducts(userId, { search = "", category = "All" } = {}) {
  const safeUserId = Number(userId);

  if (!safeUserId) {
    return [];
  }

  let sql = `
    SELECT * FROM products
    WHERE user_id = ?
  `;

  const params = [safeUserId];

  if (category && category !== "All") {
    sql += " AND category = ?";
    params.push(category);
  }

  if (search && String(search).trim()) {
    const term = `%${String(search).trim()}%`;
    sql += " AND (name LIKE ? OR IFNULL(sku, '') LIKE ? OR qr_code LIKE ?)";
    params.push(term, term, term);
  }

  sql += " ORDER BY created_at DESC";

  const [rows] = await pool.execute(sql, params);
  return rows.map(mapProductRow);
}

async function getProductById(userId, productId) {
  const safeUserId = Number(userId);
  const safeProductId = Number(productId);

  if (!safeUserId || !safeProductId) {
    return null;
  }

  const [rows] = await pool.execute(
    "SELECT * FROM products WHERE id = ? AND user_id = ? LIMIT 1",
    [safeProductId, safeUserId]
  );

  return mapProductRow(rows[0]);
}

async function getProductByQrCode(userId, qrCode) {
  const safeUserId = Number(userId);
  const normalized = String(qrCode || "").trim().toUpperCase();

  if (!safeUserId || !normalized) {
    return null;
  }

  const [rows] = await pool.execute(
    "SELECT * FROM products WHERE user_id = ? AND UPPER(qr_code) = ? LIMIT 1",
    [safeUserId, normalized]
  );

  return mapProductRow(rows[0]);
}

async function createProduct(userId, payload) {
  const safeUserId = Number(userId);

  if (!safeUserId) {
    const error = new Error("Unauthorized.");
    error.status = 401;
    throw error;
  }

  const {
    name,
    sku = "",
    qr_code,
    category,
    unit = "pcs",
    quantity = 0,
    cost_price = 0,
    selling_price = 0,
    low_stock_threshold = 5,
    expiry_date = null,
    supplier = "",
    location = "",
    image = null,
  } = payload;

  const qty = Math.max(0, Math.floor(Number(quantity)) || 0);

  const resolvedQrCode = await ensureUniqueQrCode(safeUserId, qr_code, {
    name,
    sku,
  });

  const [result] = await pool.execute(
    `INSERT INTO products (
      user_id, name, sku, qr_code, category, unit, quantity,
      cost_price, selling_price, low_stock_threshold, expiry_date, supplier, location, image
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      safeUserId,
      String(name).trim(),
      sku ? String(sku).trim() : null,
      resolvedQrCode,
      String(category).trim(),
      String(unit).trim(),
      qty,
      Number(cost_price) || 0,
      Number(selling_price) || 0,
      Math.floor(Number(low_stock_threshold)) || 5,
      expiry_date ? String(expiry_date).slice(0, 10) : null,
      supplier ? String(supplier).trim() : null,
      location ? String(location).trim() : null,
      image || null,
    ]
  );

  const productId = result.insertId;

  if (qty > 0) {
    await pool.execute(
      `INSERT INTO stock_movements (user_id, product_id, movement_type, quantity)
       VALUES (?, ?, 'stock_in', ?)`,
      [safeUserId, productId, qty]
    );
  }

  return getProductById(safeUserId, productId);
}

async function updateProduct(userId, productId, payload) {
  const safeUserId = Number(userId);
  const safeProductId = Number(productId);

  if (!safeUserId || !safeProductId) {
    return null;
  }

  const existing = await getProductById(safeUserId, safeProductId);

  if (!existing) {
    return null;
  }

  const next = {
    name:
      payload.name !== undefined
        ? String(payload.name).trim()
        : existing.name,

    sku:
      payload.sku !== undefined
        ? payload.sku
          ? String(payload.sku).trim()
          : ""
        : existing.sku,

    qr_code: existing.qr_code,

    category:
      payload.category !== undefined
        ? String(payload.category).trim()
        : existing.category,

    unit:
      payload.unit !== undefined
        ? String(payload.unit).trim()
        : existing.unit,

    quantity:
      payload.quantity !== undefined
        ? Math.max(0, Math.floor(Number(payload.quantity)) || 0)
        : existing.quantity,

    cost_price:
      payload.cost_price !== undefined
        ? Number(payload.cost_price) || 0
        : existing.cost_price,

    selling_price:
      payload.selling_price !== undefined
        ? Number(payload.selling_price) || 0
        : existing.selling_price,

    low_stock_threshold:
      payload.low_stock_threshold !== undefined
        ? Math.floor(Number(payload.low_stock_threshold)) || 0
        : existing.low_stock_threshold,

    expiry_date:
      payload.expiry_date !== undefined
        ? payload.expiry_date
          ? String(payload.expiry_date).slice(0, 10)
          : null
        : existing.expiry_date || null,

    supplier:
      payload.supplier !== undefined
        ? payload.supplier
          ? String(payload.supplier).trim()
          : ""
        : existing.supplier,

    location:
      payload.location !== undefined
        ? payload.location
          ? String(payload.location).trim()
          : ""
        : existing.location,

    image: payload.image !== undefined ? payload.image : existing.image,
  };

  next.qr_code = await ensureUniqueQrCode(
    safeUserId,
    payload.qr_code !== undefined ? payload.qr_code : existing.qr_code,
    {
      name: next.name,
      sku: next.sku,
      excludeProductId: safeProductId,
    }
  );

  const oldQty = Number(existing.quantity);
  const newQty = Number(next.quantity);

  if (newQty !== oldQty) {
    const delta = newQty - oldQty;
    const type = delta >= 0 ? "stock_in" : "stock_out";
    const absQty = Math.abs(delta);

    await pool.execute(
      `INSERT INTO stock_movements (user_id, product_id, movement_type, quantity)
       VALUES (?, ?, ?, ?)`,
      [safeUserId, safeProductId, type, absQty]
    );
  }

  await pool.execute(
    `UPDATE products SET
      name = ?, sku = ?, qr_code = ?, category = ?, unit = ?, quantity = ?,
      cost_price = ?, selling_price = ?, low_stock_threshold = ?, expiry_date = ?,
      supplier = ?, location = ?, image = ?
    WHERE id = ? AND user_id = ?`,
    [
      next.name,
      next.sku || null,
      next.qr_code,
      next.category,
      next.unit,
      newQty,
      next.cost_price,
      next.selling_price,
      next.low_stock_threshold,
      next.expiry_date,
      next.supplier || null,
      next.location || null,
      next.image,
      safeProductId,
      safeUserId,
    ]
  );

  return getProductById(safeUserId, safeProductId);
}

async function deleteProduct(userId, productId) {
  const safeUserId = Number(userId);
  const safeProductId = Number(productId);

  if (!safeUserId || !safeProductId) {
    return false;
  }

  const [result] = await pool.execute(
    "DELETE FROM products WHERE id = ? AND user_id = ?",
    [safeProductId, safeUserId]
  );

  return result.affectedRows > 0;
}

async function listMovements(userId, productId) {
  const safeUserId = Number(userId);
  const safeProductId = Number(productId);

  if (!safeUserId || !safeProductId) {
    return [];
  }

  const [rows] = await pool.execute(
    `SELECT id, movement_type AS type, quantity, created_at
     FROM stock_movements
     WHERE user_id = ? AND product_id = ?
     ORDER BY created_at DESC`,
    [safeUserId, safeProductId]
  );

  return rows.map((row) => ({
    id: String(row.id),
    type: row.type,
    quantity: Number(row.quantity),
    created_date: row.created_at
      ? new Date(row.created_at).toISOString()
      : new Date().toISOString(),
  }));
}

async function listAllMovements(userId, { movementType } = {}) {
  const safeUserId = Number(userId);

  if (!safeUserId) {
    return [];
  }

  let sql = `
    SELECT sm.id, sm.product_id, sm.movement_type AS type, sm.quantity, sm.created_at,
           p.name AS product_name
    FROM stock_movements sm
    INNER JOIN products p ON p.id = sm.product_id AND p.user_id = sm.user_id
    WHERE sm.user_id = ?
  `;

  const params = [safeUserId];

  if (movementType && movementType !== "all") {
    sql += " AND sm.movement_type = ?";
    params.push(movementType);
  }

  sql += " ORDER BY sm.created_at DESC LIMIT 500";

  const [rows] = await pool.execute(sql, params);

  return rows.map((row) => ({
    id: row.id,
    product_id: Number(row.product_id),
    type: row.type,
    quantity: Number(row.quantity),
    created_date: row.created_at
      ? new Date(row.created_at).toISOString()
      : new Date().toISOString(),
    product_name: row.product_name,
  }));
}

const RECORDABLE_MOVEMENTS = new Set([
  "stock_in",
  "stock_out",
  "sold",
  "adjustment",
  "return",
]);

async function recordMovement(userId, productId, body) {
  const safeUserId = Number(userId);
  const safeProductId = Number(productId);

  if (!safeUserId || !safeProductId) {
    const error = new Error("Unauthorized.");
    error.status = 401;
    throw error;
  }

  const movement_type = String(body.movement_type || "").trim();

  if (!RECORDABLE_MOVEMENTS.has(movement_type)) {
    const error = new Error(
      "movement_type must be stock_in, stock_out, sold, adjustment, or return."
    );
    error.status = 400;
    throw error;
  }

  const qty = Math.max(1, Math.floor(Number(body.quantity)) || 1);

  const direction =
    String(body.direction || "in").toLowerCase() === "out" ? "out" : "in";

  const product = await getProductById(safeUserId, safeProductId);

  if (!product) {
    const error = new Error("Product not found.");
    error.status = 404;
    throw error;
  }

  let newQty = Number(product.quantity);

  if (movement_type === "stock_in" || movement_type === "return") {
    newQty += qty;
  } else if (movement_type === "adjustment") {
    newQty = direction === "out" ? Math.max(0, newQty - qty) : newQty + qty;
  } else if (movement_type === "stock_out" || movement_type === "sold") {
    newQty = Math.max(0, newQty - qty);
  }

  await pool.execute(
    `INSERT INTO stock_movements (user_id, product_id, movement_type, quantity)
     VALUES (?, ?, ?, ?)`,
    [safeUserId, safeProductId, movement_type, qty]
  );

  await pool.execute(
    "UPDATE products SET quantity = ? WHERE id = ? AND user_id = ?",
    [newQty, safeProductId, safeUserId]
  );

  return getProductById(safeUserId, safeProductId);
}

function addDays(date, days) {
  const d = new Date(date.getTime());
  d.setDate(d.getDate() + days);
  return d;
}

function isAfterDate(a, b) {
  return a.getTime() > b.getTime();
}

function isBeforeDate(a, b) {
  return a.getTime() < b.getTime();
}

async function getAlertsSummary(userId) {
  const safeUserId = Number(userId);

  if (!safeUserId) {
    return {
      outOfStock: [],
      lowStock: [],
      expired: [],
      expiringSoon: [],
      expiringLater: [],
      counts: {
        lowStockTab: 0,
        expiringTab: 0,
      },
    };
  }

  const products = await listProducts(safeUserId, {});
  const now = new Date();
  const sevenDays = addDays(now, 7);
  const thirtyDays = addDays(now, 30);

  const lowStock = products.filter(
    (p) =>
      Number(p.quantity) > 0 &&
      Number(p.quantity) <= Number(p.low_stock_threshold || 5)
  );

  const outOfStock = products.filter((p) => Number(p.quantity) === 0);

  const expired = [];
  const expiringSoon = [];
  const expiringLater = [];

  for (const p of products) {
    if (!p.expiry_date) continue;

    const exp = new Date(p.expiry_date);

    if (Number.isNaN(exp.getTime())) continue;

    if (isBeforeDate(exp, now)) {
      expired.push(p);
      continue;
    }

    if (isAfterDate(exp, now) && isBeforeDate(exp, sevenDays)) {
      expiringSoon.push(p);
    } else if (isAfterDate(exp, sevenDays) && isBeforeDate(exp, thirtyDays)) {
      expiringLater.push(p);
    }
  }

  return {
    outOfStock,
    lowStock,
    expired,
    expiringSoon,
    expiringLater,
    counts: {
      lowStockTab: outOfStock.length + lowStock.length,
      expiringTab: expired.length + expiringSoon.length + expiringLater.length,
    },
  };
}

async function listRecentMovements(userId, limit = 15) {
  const safeUserId = Number(userId);
  const safeLimit = Math.min(100, Math.max(1, Number(limit) || 15));

  if (!safeUserId) {
    return [];
  }

  const [rows] = await pool.execute(
    `SELECT sm.id, sm.product_id, sm.movement_type AS type, sm.quantity, sm.created_at,
            p.name AS product_name
     FROM stock_movements sm
     INNER JOIN products p ON p.id = sm.product_id AND p.user_id = sm.user_id
     WHERE sm.user_id = ?
     ORDER BY sm.created_at DESC
     LIMIT ${safeLimit}`,
    [safeUserId]
  );

  return rows.map((row) => ({
    id: row.id,
    product_id: Number(row.product_id),
    type: row.type,
    quantity: Number(row.quantity),
    created_date: row.created_at
      ? new Date(row.created_at).toISOString()
      : new Date().toISOString(),
    product_name: row.product_name,
  }));
}

module.exports = {
  listProducts,
  getProductById,
  getProductByQrCode,
  createProduct,
  updateProduct,
  deleteProduct,
  listMovements,
  listAllMovements,
  recordMovement,
  listRecentMovements,
  getAlertsSummary,
};