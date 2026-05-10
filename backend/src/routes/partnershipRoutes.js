const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const { submitPartnershipInquiry } = require("../controllers/partnershipController");

const router = express.Router();

router.use(authMiddleware);
router.post("/", submitPartnershipInquiry);

module.exports = router;
