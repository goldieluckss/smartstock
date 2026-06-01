const mysql = require("mysql2/promise");
const env = require("./env");

const pool = mysql.createPool({
  host: env.dbHost,
  port: Number(env.dbPort),
  user: env.dbUser,
  password: env.dbPassword,
  database: env.dbName,
  waitForConnections: true,
  connectionLimit: 10,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function checkDatabaseConnection() {
  const connection = await pool.getConnection();
  connection.release();
}

module.exports = {
  pool,
  checkDatabaseConnection,
};