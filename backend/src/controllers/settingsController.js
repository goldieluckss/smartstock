const settingsService = require("../services/settingsService");

function getAuthUserId(req) {
  return req.user?.userId || req.user?.id;
}

async function getSettings(req, res, next) {
  try {
    const userId = getAuthUserId(req);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const settings = await settingsService.getSettings(userId);

    return res.status(200).json({ settings });
  } catch (error) {
    return next(error);
  }
}

async function updateSettings(req, res, next) {
  try {
    const userId = getAuthUserId(req);

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized." });
    }

    const settings = await settingsService.updateSettings(userId, req.body || {});

    return res.status(200).json({
      message: "Settings saved.",
      settings,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  getSettings,
  updateSettings,
};