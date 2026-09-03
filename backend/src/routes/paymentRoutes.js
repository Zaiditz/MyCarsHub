const express = require("express");
const protect = require("../middleware/authMiddleware");
const {
  getBillingInfo,
  createProSubscription,
  verifyProSubscription,
  createVerificationOrder,
  verifyVerificationPayment,
  cancelProSubscription,
} = require("../controllers/paymentController");

const router = express.Router();

router.get("/billing", protect, getBillingInfo);
router.post("/subscription/create", protect, createProSubscription);
router.post("/subscription/verify", protect, verifyProSubscription);
router.post("/subscription/cancel", protect, cancelProSubscription);
router.post("/verification/order", protect, createVerificationOrder);
router.post("/verification/verify", protect, verifyVerificationPayment);

module.exports = router;
