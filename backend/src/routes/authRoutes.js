const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");

const {
  signup,
  login,
  getCurrentUser,
  updateCurrentUser,
  getCurrentSubscription,
} = require("../controllers/authController");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

router.get("/me", authMiddleware, getCurrentUser);
router.patch("/me", authMiddleware, updateCurrentUser);

router.get("/subscription", authMiddleware, getCurrentSubscription);

module.exports = router;