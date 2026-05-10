const { pool } = require("../config/db");

const DEFAULT_SETTINGS = {
  low_stock_default: 5,
  currency: "PHP",
};

async function getSettings(userId) {
  const [rows] = await pool.execute(
    `SELECT user_id, low_stock_default, currency, updated_at
     FROM user_settings
     WHERE user_id = ?
     LIMIT 1`,
    [userId]
  );

  if (rows.length > 0) {
    return {
      user_id: rows[0].user_id,
      low_stock_default: Number(rows[0].low_stock_default),
      currency: rows[0].currency,
      updated_at: rows[0].updated_at,
    };
  }

  await pool.execute(
    `INSERT INTO user_settings (user_id, low_stock_default, currency)
     VALUES (?, ?, ?)`,
    [userId, DEFAULT_SETTINGS.low_stock_default, DEFAULT_SETTINGS.currency]
  );

  return {
    user_id: userId,
    ...DEFAULT_SETTINGS,
  };
}

async function updateSettings(userId, payload) {
  const lowStockDefault =
    payload.low_stock_default !== undefined
      ? Math.max(0, Math.floor(Number(payload.low_stock_default)) || 0)
      : DEFAULT_SETTINGS.low_stock_default;

  const currency = String(payload.currency || DEFAULT_SETTINGS.currency)
    .trim()
    .toUpperCase();

  const allowedCurrencies = ["PHP", "USD", "EUR"];

  const safeCurrency = allowedCurrencies.includes(currency)
    ? currency
    : DEFAULT_SETTINGS.currency;

  await pool.execute(
    `INSERT INTO user_settings (user_id, low_stock_default, currency)
     VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE
       low_stock_default = VALUES(low_stock_default),
       currency = VALUES(currency)`,
    [userId, lowStockDefault, safeCurrency]
  );

  return getSettings(userId);
}

module.exports = {
  getSettings,
  updateSettings,
};