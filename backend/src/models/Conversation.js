const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    car: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Car",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

conversationSchema.index({ buyer: 1, seller: 1, car: 1 }, { unique: true });

module.exports = mongoose.model("Conversation", conversationSchema);