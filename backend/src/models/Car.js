const mongoose = require("mongoose");

const carSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    brand: {
      type: String,
      required: true,
      trim: true,
    },

    model: {
      type: String,
      required: true,
      trim: true,
    },

    variant: {
      type: String,
      trim: true,
    },

    year: {
      type: Number,
      required: true,
      min: 1900,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    fuelType: {
      type: String,
      enum: ["Petrol", "Diesel", "Electric", "Hybrid", "CNG"],
      required: true,
    },

    transmission: {
      type: String,
      enum: ["Manual", "Automatic"],
      required: true,
    },

    mileage: {
      type: Number,
      min: 0,
    },

    kilometersDriven: {
      type: Number,
      min: 0,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    images: [
      {
        type: String,
      },
    ],

    status: {
      type: String,
      enum: ["active", "sold", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  },
);

carSchema.index({ brand: 1, model: 1 });
carSchema.index({ city: 1, price: 1 });
carSchema.index({ fuelType: 1, transmission: 1 });
carSchema.index({ seller: 1 });
carSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Car", carSchema);
