const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    subscriptionPlan: { type: String, enum: ["free", "pro"], default: "free" },
    subscriptionStatus: {
      type: String,
      enum: ["inactive", "active", "cancelled", "halted"],
      default: "inactive",
    },
    subscriptionId: { type: String, default: null },
    subscriptionExpiresAt: { type: Date, default: null },
    subscriptionCancelAtCycleEnd: { type: Boolean, default: false },
    verificationStatus: {
      type: String,
      enum: ["unverified", "pending", "verified", "rejected"],
      default: "unverified",
    },
    verifiedAt: { type: Date, default: null },
    savedCars: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Car",
      },
    ],

    compareCars: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Car",
      },
    ],
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
