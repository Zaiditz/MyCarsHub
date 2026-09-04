const mongoose = require("mongoose");
const User = require("../models/User");
const Car = require("../models/Car");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const getSavedCars = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate({
        path: "savedCars",
        match: { status: "active" },
        populate: {
          path: "seller",
          select:
            "name createdAt verificationStatus subscriptionPlan subscriptionStatus",
        },
      })
      .lean();

    res.json({
      cars: user?.savedCars || [],
    });
  } catch (error) {
    console.error("GET SAVED CARS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch saved cars" });
  }
};

const saveCar = async (req, res) => {
  try {
    const { carId } = req.params;

    if (!isValidId(carId)) {
      return res.status(400).json({ message: "Invalid car ID" });
    }

    const car = await Car.findOne({
      _id: carId,
      status: "active",
    });

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    await User.findByIdAndUpdate(req.user.userId, {
      $addToSet: { savedCars: carId },
    });

    res.json({ message: "Car saved successfully" });
  } catch (error) {
    console.error("SAVE CAR ERROR:", error);
    res.status(500).json({ message: "Failed to save car" });
  }
};

const removeSavedCar = async (req, res) => {
  try {
    const { carId } = req.params;

    if (!isValidId(carId)) {
      return res.status(400).json({ message: "Invalid car ID" });
    }

    await User.findByIdAndUpdate(req.user.userId, {
      $pull: { savedCars: carId },
    });

    res.json({ message: "Car removed from saved cars" });
  } catch (error) {
    console.error("REMOVE SAVED CAR ERROR:", error);
    res.status(500).json({ message: "Failed to remove saved car" });
  }
};

const getCompareCars = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate({
        path: "compareCars",
        match: { status: "active" },
        populate: {
          path: "seller",
          select:
            "name createdAt verificationStatus subscriptionPlan subscriptionStatus",
        },
      })
      .lean();

    res.json({
      cars: user?.compareCars || [],
    });
  } catch (error) {
    console.error("GET COMPARE CARS ERROR:", error);
    res.status(500).json({ message: "Failed to fetch comparison cars" });
  }
};

const addCompareCar = async (req, res) => {
  try {
    const { carId } = req.params;

    if (!isValidId(carId)) {
      return res.status(400).json({ message: "Invalid car ID" });
    }

    const car = await Car.findOne({
      _id: carId,
      status: "active",
    });

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    const user = await User.findById(req.user.userId);

    const alreadyCompared = (user.compareCars || []).some(
      (id) => id.toString() === carId,
    );

    if ((user.compareCars || []).length >= 4 && !alreadyCompared) {
      return res.status(400).json({
        message: "You can compare a maximum of 4 cars",
      });
    }

    await User.findByIdAndUpdate(req.user.userId, {
      $addToSet: { compareCars: carId },
    });

    res.json({ message: "Car added to comparison" });
  } catch (error) {
    console.error("ADD COMPARE CAR ERROR:", error);
    res.status(500).json({ message: "Failed to add car to comparison" });
  }
};

const removeCompareCar = async (req, res) => {
  try {
    const { carId } = req.params;

    if (!isValidId(carId)) {
      return res.status(400).json({ message: "Invalid car ID" });
    }

    await User.findByIdAndUpdate(req.user.userId, {
      $pull: { compareCars: carId },
    });

    res.json({ message: "Car removed from comparison" });
  } catch (error) {
    console.error("REMOVE COMPARE CAR ERROR:", error);
    res.status(500).json({ message: "Failed to remove comparison car" });
  }
};

const clearCompareCars = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.userId, {
      $set: { compareCars: [] },
    });

    res.json({ message: "Comparison cleared" });
  } catch (error) {
    console.error("CLEAR COMPARE ERROR:", error);
    res.status(500).json({ message: "Failed to clear comparison" });
  }
};

module.exports = {
  getSavedCars,
  saveCar,
  removeSavedCar,
  getCompareCars,
  addCompareCar,
  removeCompareCar,
  clearCompareCars,
};