const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const settingsController = require("../controllers/settingsController");

const router = express.Router();

router.use(authMiddleware);

router.get("/", settingsController.getSettings);
router.patch("/", settingsController.updateSettings);

module.exports = router;