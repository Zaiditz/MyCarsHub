const User = require("../models/User");
const Car = require("../models/Car");
const Report = require("../models/Report");
const VerificationRequest = require("../models/VerificationRequest");
const Payment = require("../models/Payment");

const getStats = async (req, res) => {
  try {
    const [users, cars, activeCars, pendingReports, pendingVerification, paidRevenue] = await Promise.all([
      User.countDocuments(),
      Car.countDocuments(),
      Car.countDocuments({ status: "active" }),
      Report.countDocuments({ status: "pending" }),
      VerificationRequest.countDocuments({ status: "pending", paymentStatus: "paid" }),
      Payment.aggregate([{ $match: { status: "paid" } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
    ]);

    const proUsers = await User.countDocuments({ subscriptionPlan: "pro", subscriptionStatus: "active" });
    const verifiedSellers = await User.countDocuments({ verificationStatus: "verified" });

    res.json({
      stats: {
        users,
        cars,
        activeCars,
        proUsers,
        verifiedSellers,
        pendingReports,
        pendingVerification,
        revenue: paidRevenue[0]?.total || 0,
      },
    });
  } catch (error) {
    console.error("ADMIN STATS ERROR:", error);
    res.status(500).json({ message: "Failed to load admin statistics" });
  }
};

const getVerificationRequests = async (req, res) => {
  try {
    const requests = await VerificationRequest.find({ status: "pending", paymentStatus: "paid" })
      .populate("user", "name email createdAt verificationStatus")
      .sort({ createdAt: 1 })
      .lean();
    res.json({ requests });
  } catch (error) {
    console.error("ADMIN VERIFICATION LIST ERROR:", error);
    res.status(500).json({ message: "Failed to load verification requests" });
  }
};

const reviewVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const { decision, reason } = req.body;
    if (!['approved', 'rejected'].includes(decision)) return res.status(400).json({ message: "Invalid verification decision" });

    const request = await VerificationRequest.findById(id);
    if (!request) return res.status(404).json({ message: "Verification request not found" });
    if (request.paymentStatus !== "paid") return res.status(400).json({ message: "Verification payment has not been confirmed" });

    request.status = decision;
    request.reviewedBy = req.user.userId;
    request.reviewedAt = new Date();
    request.rejectionReason = decision === "rejected" ? reason?.trim() || "Verification details could not be approved" : undefined;
    await request.save();

    const user = await User.findById(request.user);
    if (user) {
      user.verificationStatus = decision === "approved" ? "verified" : "rejected";
      user.verifiedAt = decision === "approved" ? new Date() : null;
      await user.save();
    }

    res.json({ message: `Verification ${decision}`, user: user ? { id: user._id, verificationStatus: user.verificationStatus } : null });
  } catch (error) {
    console.error("ADMIN REVIEW VERIFICATION ERROR:", error);
    res.status(500).json({ message: "Failed to review verification request" });
  }
};

const getReports = async (req, res) => {
  try {
    const reports = await Report.find({ status: { $ne: "resolved" } })
      .populate("car", "brand model variant price status seller")
      .populate("reporter", "name")
      .sort({ createdAt: -1 })
      .lean();
    res.json({ reports });
  } catch (error) {
    console.error("ADMIN REPORT LIST ERROR:", error);
    res.status(500).json({ message: "Failed to load reports" });
  }
};

const updateReport = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'reviewed', 'resolved'].includes(status)) return res.status(400).json({ message: "Invalid report status" });
    const report = await Report.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!report) return res.status(404).json({ message: "Report not found" });
    res.json({ report });
  } catch (error) {
    console.error("ADMIN REPORT UPDATE ERROR:", error);
    res.status(500).json({ message: "Failed to update report" });
  }
};

const getRecentPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate("user", "name").sort({ createdAt: -1 }).limit(25).lean();
    res.json({ payments });
  } catch (error) {
    console.error("ADMIN PAYMENTS ERROR:", error);
    res.status(500).json({ message: "Failed to load payments" });
  }
};

module.exports = {
  getStats,
  getVerificationRequests,
  reviewVerification,
  getReports,
  updateReport,
  getRecentPayments,
};
