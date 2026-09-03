const express = require("express");

const upload = require("../middleware/uploadMiddleware");
const {
  createCar,
  getCars,
  updateCar,
  deleteCar,
  getMyCars,
  getCarById,
  getMyCarById,
} = require("../controllers/carController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, upload.array("images", 6), createCar);
router.get("/my", protect, getMyCars);
router.get("/my/:id", protect, getMyCarById);
router.get("/", getCars);
router.get("/:id", getCarById);
router.put("/:id", protect, updateCar);
router.delete("/:id", protect, deleteCar);

module.exports = router;