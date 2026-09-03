const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  role: user.role,
  subscriptionPlan: user.subscriptionPlan,
  subscriptionStatus: user.subscriptionStatus,
  subscriptionCancelAtCycleEnd: user.subscriptionCancelAtCycleEnd,
  verificationStatus: user.verificationStatus,
});

const authCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const setAuthCookie = (res, token) => {
  res.cookie("token", token, authCookieOptions);
};

const syncAdminRole = async (user) => {
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();

  if (adminEmail && user.email === adminEmail && user.role !== "admin") {
    user.role = "admin";
    await user.save();
  }
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password || password.length < 6) {
      return res.status(400).json({
        message: "Please provide valid signup details",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const isAdmin = process.env.ADMIN_EMAIL?.toLowerCase() === normalizedEmail;

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: isAdmin ? "admin" : "user",
    });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    setAuthCookie(res, token);

    res.status(201).json({
      message: "User registered successfully",
      user: publicUser(user),
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);

    res.status(500).json({
      message: "Failed to register user",
    });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({
      email: email?.trim().toLowerCase(),
    });

    if (!user || !(await bcrypt.compare(password || "", user.password))) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    await syncAdminRole(user);

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    setAuthCookie(res, token);

    res.status(200).json({
      message: "Login successful",
      user: publicUser(user),
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    res.status(500).json({
      message: "Failed to login",
    });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select(
      "name email role subscriptionPlan subscriptionStatus subscriptionId subscriptionExpiresAt subscriptionCancelAtCycleEnd verificationStatus verifiedAt createdAt",
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    await syncAdminRole(user);

    res.json({ user });
  } catch (error) {
    console.error("GET ME ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch profile",
    });
  }
};

const logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  });

  res.status(200).json({
    message: "Logout successful",
  });
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
};