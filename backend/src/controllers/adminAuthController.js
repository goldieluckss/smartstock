const { validateLoginPayload } = require("../utils/validators");
const { createToken } = require("../utils/jwt");
const { authenticateAdmin } = require("../services/adminService");
const { logActivity } = require("../services/activityLogService");

async function loginAdmin(req, res, next) {
  try {
    const validationError = validateLoginPayload(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const admin = await authenticateAdmin(req.body);
    if (!admin) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = createToken({
      role: "admin",
      adminId: admin.id,
      email: admin.email,
      name: admin.name,
    });

    await logActivity({
      actorType: "admin",
      actorId: admin.id,
      action: "admin.login",
      targetType: "admin",
      targetId: admin.id,
    });

    return res.status(200).json({ message: "Admin login successful.", admin, token });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  loginAdmin,
};
