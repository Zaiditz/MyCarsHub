const protect = require("./authMiddleware");
const User = require("../models/User");

const adminOnly = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select("role");

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    req.admin = user;
    next();
  } catch (error) {
    console.error("ADMIN AUTH ERROR:", error);
    res.status(500).json({ message: "Failed to verify admin access" });
  }
};

module.exports = [protect, adminOnly];
