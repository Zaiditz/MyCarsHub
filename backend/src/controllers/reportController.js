const Report = require("../models/Report");
const Car = require("../models/Car");

const reportCar = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.userId;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: "A report reason is required" });
    }

    const car = await Car.findById(id);

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    if (car.seller.toString() === userId) {
      return res
        .status(400)
        .json({ message: "You cannot report your own listing" });
    }

    const existingReport = await Report.findOne({ car: id, reporter: userId });

    if (existingReport) {
      return res
        .status(409)
        .json({ message: "You have already reported this listing" });
    }

    await Report.create({ car: id, reporter: userId, reason: reason.trim() });

    res.status(201).json({ message: "Listing reported successfully" });
  } catch (error) {
    console.error("REPORT CAR ERROR:", error);
    res.status(500).json({ message: "Failed to report listing" });
  }
};

module.exports = { reportCar };