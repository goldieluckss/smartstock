const mysql = require("mysql2/promise");
const env = require("./env");

const pool = mysql.createPool({
  host: env.dbHost,
  port: env.dbPort,
  user: env.dbUser,
  password: env.dbPassword,
  database: env.dbName,
  waitForConnections: true,
  connectionLimit: 10,
});

async function checkDatabaseConnection() {
  const connection = await pool.getConnection();
  connection.release();
}

module.exports = {
  pool,
  checkDatabaseConnection,
};
