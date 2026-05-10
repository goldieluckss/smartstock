const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const env = require("./config/env");
const routes = require("./routes");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

const app = express();

app.use(helmet());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.corsOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Backend is running.",
    api: "/api",
  });
});

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;