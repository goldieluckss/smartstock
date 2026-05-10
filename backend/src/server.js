const app = require("./app");
const env = require("./config/env");
const { checkDatabaseConnection } = require("./config/db");

async function startServer() {
  try {
    await checkDatabaseConnection();

    app.listen(env.port, env.host, () => {
      console.log(`Server listening on http://${env.host}:${env.port}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
}

startServer();