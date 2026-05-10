const express = require("express");
const authRoutes = require("./authRoutes");
const productRoutes = require("./productRoutes");
const adminAuthRoutes = require("./adminAuthRoutes");
const adminRoutes = require("./adminRoutes");
const partnershipRoutes = require("./partnershipRoutes");
const settingsRoutes = require("./settingsRoutes");
const { getHealth } = require("../controllers/userController");

const router = express.Router();

router.get("/health", getHealth);

router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/partnerships", partnershipRoutes);
router.use("/settings", settingsRoutes);
router.use("/admin/auth", adminAuthRoutes);
router.use("/admin", adminRoutes);

module.exports = router;