const mongoose = require("mongoose");

const verificationRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    fullName: { type: String, required: true, trim: true, maxlength: 120 },
    phone: { type: String, required: true, trim: true, maxlength: 20 },
    idType: {
      type: String,
      enum: ["Aadhaar", "Driving Licence", "Passport", "Voter ID"],
      required: true,
    },
    idLast4: { type: String, required: true, trim: true, minlength: 4, maxlength: 4 },
    note: { type: String, trim: true, maxlength: 500 },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["unpaid", "paid"],
      default: "unpaid",
    },
    paymentOrderId: { type: String, unique: true, sparse: true },
    paymentId: { type: String },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    rejectionReason: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true },
);

verificationRequestSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("VerificationRequest", verificationRequestSchema);