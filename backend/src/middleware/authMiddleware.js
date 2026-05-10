const { verifyToken } = require("../utils/jwt");

function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    req.user = {
      id: decoded.userId,
      email: decoded.email,
    };

    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

module.exports = authMiddleware;