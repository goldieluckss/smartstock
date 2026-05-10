const { verifyToken } = require("../utils/jwt");

function adminAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Unauthorized." });
  }

  try {
    const decoded = verifyToken(token);
    if (decoded.role !== "admin" || !decoded.adminId) {
      return res.status(403).json({ message: "Admin access required." });
    }
    req.admin = {
      id: Number(decoded.adminId),
      email: decoded.email,
      name: decoded.name,
    };
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

module.exports = adminAuthMiddleware;
