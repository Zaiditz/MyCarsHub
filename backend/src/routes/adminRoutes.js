const express = require("express");
const adminOnly = require("../middleware/adminMiddleware");
const {
  getStats,
  getVerificationRequests,
  reviewVerification,
  getReports,
  updateReport,
  getRecentPayments,
} = require("../controllers/adminController");

const router = express.Router();

router.get("/stats", adminOnly, getStats);
router.get("/verifications", adminOnly, getVerificationRequests);
router.patch("/verifications/:id", adminOnly, reviewVerification);
router.get("/reports", adminOnly, getReports);
router.patch("/reports/:id", adminOnly, updateReport);
router.get("/payments", adminOnly, getRecentPayments);

module.exports = router;
