const express = require("express");
const adminAuthMiddleware = require("../middleware/adminAuthMiddleware");
const {
  users,
  createUser,
  updateUser,
  removeUser,
  updateUserStatus,
  products,
  createProduct,
  updateProduct,
  removeProduct,
  subscriptions,
  saveSubscription,
  partnerships,
  savePartnership,
  logs,
} = require("../controllers/adminController");

const router = express.Router();

router.use(adminAuthMiddleware);
router.get("/users", users);
router.post("/users", createUser);
router.patch("/users/:userId", updateUser);
router.delete("/users/:userId", removeUser);
router.patch("/users/:userId/status", updateUserStatus);
router.get("/products", products);
router.post("/products", createProduct);
router.patch("/products/:productId", updateProduct);
router.delete("/products/:productId", removeProduct);
router.get("/subscriptions", subscriptions);
router.put("/subscriptions/:userId", saveSubscription);
router.get("/partnerships", partnerships);
router.patch("/partnerships/:partnershipId", savePartnership);
router.get("/activity-logs", logs);

module.exports = router;
