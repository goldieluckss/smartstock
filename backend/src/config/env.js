require("dotenv").config();

function parseCorsOrigins(value) {
  if (!value) {
    return ["http://localhost:5173"];
  }

  return value.split(",").map((origin) => origin.trim());
}

const env = {
  port: Number(process.env.PORT) || 5000,
  host: process.env.HOST || "localhost",

  dbHost: process.env.DB_HOST || "localhost",
  dbPort: Number(process.env.DB_PORT) || 3306,
  dbUser: process.env.DB_USER || "root",
  dbPassword: process.env.DB_PASSWORD || "",
  dbName: process.env.DB_NAME || "techno_mobile_app",

  corsOrigins: parseCorsOrigins(process.env.CORS_ORIGINS),

  jwtSecret:
    process.env.JWT_SECRET ||
    process.env.JWT_SECRET_KEY ||
    "smartstock_secret_key",

  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
};

module.exports = env;