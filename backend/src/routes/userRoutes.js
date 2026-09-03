const express = require("express");
const protect = require("../middleware/authMiddleware");

const {
  getSavedCars,
  saveCar,
  removeSavedCar,
  getCompareCars,
  addCompareCar,
  removeCompareCar,
  clearCompareCars,
} = require("../controllers/userController");

const router = express.Router();

router.use(protect);

router.get("/saved", getSavedCars);
router.post("/saved/:carId", saveCar);
router.delete("/saved/:carId", removeSavedCar);

router.get("/compare", getCompareCars);
router.post("/compare/:carId", addCompareCar);
router.delete("/compare/:carId", removeCompareCar);
router.delete("/compare", clearCompareCars);

module.exports = router;