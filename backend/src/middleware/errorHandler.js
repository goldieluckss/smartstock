function notFoundHandler(req, res, next) {
  return res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}

function errorHandler(error, req, res, next) {
  console.error("Backend Error:", error);

  if (error.code === "ER_DUP_ENTRY") {
    return res.status(409).json({
      message: "Email already exists.",
    });
  }

  if (error.code === "ER_NO_SUCH_TABLE") {
    return res.status(500).json({
      message: "Database table is missing. Please import init.sql.",
      error: error.message,
    });
  }

  if (error.code === "ER_BAD_FIELD_ERROR") {
    return res.status(500).json({
      message: "Database column mismatch.",
      error: error.message,
    });
  }

  return res.status(error.statusCode || 500).json({
    message: error.message || "Internal Server Error",
    error: error.code || "UNKNOWN_ERROR",
  });
}

module.exports = {
  notFoundHandler,
  errorHandler,
};