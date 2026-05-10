const { pool } = require("../config/db");
const { hashPassword, comparePassword } = require("../utils/password");

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    is_active: user.is_active === undefined ? true : Boolean(user.is_active),
    createdAt: user.created_at || user.createdAt,
  };
}

async function createUser({ name, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  const [existingRows] = await pool.execute(
    "SELECT id FROM users WHERE email = ? LIMIT 1",
    [normalizedEmail]
  );

  const existing = existingRows[0];

  if (existing) {
    const error = new Error("Email already exists.");
    error.status = 409;
    error.statusCode = 409;
    throw error;
  }

  const passwordHash = await hashPassword(password);

  const [result] = await pool.execute(
    "INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)",
    [name.trim(), normalizedEmail, passwordHash]
  );

  await pool.execute(
    `INSERT INTO user_subscriptions (user_id, plan, status, started_at)
     VALUES (?, 'starter', 'active', CURDATE())
     ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP`,
    [result.insertId]
  );

  const [rows] = await pool.execute(
    "SELECT id, name, email, is_active, created_at FROM users WHERE id = ? LIMIT 1",
    [result.insertId]
  );

  return sanitizeUser(rows[0]);
}

async function authenticateUser({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  const [rows] = await pool.execute(
    "SELECT id, name, email, is_active, password_hash, created_at FROM users WHERE email = ? LIMIT 1",
    [normalizedEmail]
  );

  const user = rows[0];

  if (!user) {
    return null;
  }

  if (!Boolean(user.is_active)) {
    const error = new Error("This account is inactive. Contact administrator.");
    error.status = 403;
    error.statusCode = 403;
    throw error;
  }

  const isMatch = await comparePassword(password, user.password_hash);

  if (!isMatch) {
    return null;
  }

  return sanitizeUser(user);
}

async function getUserById(userId) {
  const [rows] = await pool.execute(
    "SELECT id, name, email, is_active, created_at FROM users WHERE id = ? LIMIT 1",
    [userId]
  );

  const user = rows[0];

  return user ? sanitizeUser(user) : null;
}

async function updateUserProfile(userId, payload) {
  const name = String(payload.name || "").trim();

  if (!name) {
    const error = new Error("Name is required.");
    error.status = 400;
    error.statusCode = 400;
    throw error;
  }

  await pool.execute(
    `UPDATE users
     SET name = ?
     WHERE id = ?`,
    [name, userId]
  );

  return getUserById(userId);
}

async function getUserSubscription(userId) {
  const [rows] = await pool.execute(
    `SELECT plan, status, started_at, ends_at, updated_at
     FROM user_subscriptions
     WHERE user_id = ?
     LIMIT 1`,
    [userId]
  );

  const row = rows[0];

  if (!row) {
    return {
      plan: "starter",
      status: "active",
      started_at: null,
      ends_at: null,
      updated_at: null,
    };
  }

  return row;
}

module.exports = {
  createUser,
  authenticateUser,
  getUserById,
  updateUserProfile,
  getUserSubscription,
};