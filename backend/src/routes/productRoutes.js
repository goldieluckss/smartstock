const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const productController = require("../controllers/productController");

const router = express.Router();

router.use(authMiddleware);

router.get("/movements/recent", productController.recentMovements);
router.get("/movements", productController.listAllMovements);
router.get("/alerts/summary", productController.alertsSummary);
router.get("/by-qr/:qrCode", productController.getProductByQr);
router.get("/", productController.listProducts);
router.post("/", productController.createProduct);
router.get("/:id/movements", productController.listMovements);
router.post("/:id/movements", productController.recordMovement);
router.get("/:id", productController.getProduct);
router.patch("/:id", productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

module.exports = router;
