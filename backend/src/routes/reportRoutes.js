const express = require("express");
const protect = require("../middleware/authMiddleware");
const { reportCar } = require("../controllers/reportController");

const router = express.Router();

router.post("/cars/:id/report", protect, reportCar);

module.exports = router;
