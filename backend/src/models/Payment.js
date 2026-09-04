const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["verification", "subscription"],
      required: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    orderId: { type: String, unique: true, sparse: true },
    subscriptionId: { type: String, sparse: true },
    paymentId: { type: String, unique: true, sparse: true },
    status: {
      type: String,
      enum: ["created", "paid", "failed", "cancelled"],
      default: "created",
    },
    metadata: { type: Object, default: {} },
  },
  { timestamps: true },
);

paymentSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Payment", paymentSchema);