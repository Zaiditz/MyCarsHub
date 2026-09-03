const Car = require("../models/Car");
const cloudinary = require("../config/cloudinary");
const User = require("../models/User");

const createCar = async (req, res) => {
  try {
    const {
      brand,
      model,
      variant,
      year,
      price,
      fuelType,
      transmission,
      mileage,
      kilometersDriven,
      city,
      description,
    } = req.body;

    const numericYear = Number(year);
    const numericPrice = Number(price);
    const numericMileage = mileage === undefined || mileage === "" ? undefined : Number(mileage);
    const numericKilometers = kilometersDriven === undefined || kilometersDriven === "" ? undefined : Number(kilometersDriven);

    if (!brand?.trim() || !model?.trim() || !city?.trim() || !Number.isFinite(numericYear) || numericYear < 1900 || !Number.isFinite(numericPrice) || numericPrice < 0) {
      return res.status(400).json({ message: "Please provide valid car details" });
    }

    if (numericMileage !== undefined && (!Number.isFinite(numericMileage) || numericMileage < 0)) {
      return res.status(400).json({ message: "Mileage must be a valid non-negative number" });
    }

    if (numericKilometers !== undefined && (!Number.isFinite(numericKilometers) || numericKilometers < 0)) {
      return res.status(400).json({ message: "Kilometers driven must be a valid non-negative number" });
    }

    const seller = await User.findById(req.user.userId).select("subscriptionPlan subscriptionStatus subscriptionExpiresAt");
    if (!seller) {
      return res.status(401).json({ message: "Seller account not found" });
    }

    const isPro = seller.subscriptionPlan === "pro" && seller.subscriptionStatus === "active" && seller.subscriptionExpiresAt && seller.subscriptionExpiresAt > new Date();
    const activeListingLimit = isPro ? 10 : 2;
    const activeListingCount = await Car.countDocuments({ seller: seller._id, status: "active" });

    if (activeListingCount >= activeListingLimit) {
      return res.status(403).json({
        message: isPro
          ? "You have reached the Pro plan limit of 10 active listings."
          : "Free sellers can have up to 2 active listings. Upgrade to Pro for up to 10.",
        code: "LISTING_LIMIT_REACHED",
      });
    }

    const imageUrls = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const imageUrl = await uploadToCloudinary(file.buffer);
        imageUrls.push(imageUrl);
      }
    }

    const car = await Car.create({
      seller: req.user.userId,

      brand,
      model,
      variant,
      year: numericYear,
      price: numericPrice,
      fuelType,
      transmission,
      mileage: numericMileage,
      kilometersDriven: numericKilometers,
      city,
      description,

      images: imageUrls,
    });

    res.status(201).json({
      message: "Car listed successfully",
      car,
    });
  } catch (error) {
    console.error("CREATE CAR ERROR:", error);

    res.status(500).json({
      message: "Failed to create car listing",
    });
  }
};

const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "mycarshub/cars",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result.secure_url);
        }
      },
    );

    stream.end(fileBuffer);
  });
};

const getCars = async (req, res) => {
  try {
    const {
      brand,
      model,
      city,
      fuelType,
      transmission,
      minPrice,
      maxPrice,
      minYear,
      maxYear,
      page = 1,
      limit = 10,
    } = req.query;

    const filter = {
      status: "active",
    };

    if (brand) filter.brand = brand;
    if (model) filter.model = model;
    if (city) filter.city = city;
    if (fuelType) filter.fuelType = fuelType;
    if (transmission) filter.transmission = transmission;

    if (minPrice || maxPrice) {
      filter.price = {};

      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (minYear || maxYear) {
      filter.year = {};

      if (minYear) filter.year.$gte = Number(minYear);
      if (maxYear) filter.year.$lte = Number(maxYear);
    }

    const currentPage = Math.max(Number(page), 1);
    const itemsPerPage = Math.min(Math.max(Number(limit), 1), 50);

    const skip = (currentPage - 1) * itemsPerPage;

    const [cars, totalCars] = await Promise.all([
      Car.find(filter)
        .populate("seller", "name createdAt verificationStatus subscriptionPlan subscriptionStatus")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(itemsPerPage)
        .lean(),

      Car.countDocuments(filter),
    ]);

    res.status(200).json({
      cars,
      pagination: {
        currentPage,
        itemsPerPage,
        totalCars,
        totalPages: Math.ceil(totalCars / itemsPerPage),
      },
    });
  } catch (error) {
    console.error("GET CARS ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch cars",
    });
  }
};

const getMyCars = async (req, res) => {
  try {
    const cars = await Car.find({
      seller: req.user.userId,
    })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      cars,
    });
  } catch (error) {
    console.error("GET MY CARS ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch your cars",
    });
  }
};

const getCarById = async (req, res) => {
  try {
    const { id } = req.params;

    const car = await Car.findOne({ _id: id, status: "active" })
      .populate("seller", "name createdAt verificationStatus subscriptionPlan subscriptionStatus")
      .lean();

    if (!car) {
      return res.status(404).json({
        message: "Car not found",
      });
    }

    res.status(200).json({
      car,
    });
  } catch (error) {
    console.error("GET CAR BY ID ERROR:", error);

    res.status(500).json({
      message: "Failed to fetch car",
    });
  }
};

const getMyCarById = async (req, res) => {
  try {
    const car = await Car.findOne({
      _id: req.params.id,
      seller: req.user.userId,
    }).lean();

    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    res.status(200).json({ car });
  } catch (error) {
    console.error("GET MY CAR BY ID ERROR:", error);
    res.status(500).json({ message: "Failed to fetch your car" });
  }
};

const updateCar = async (req, res) => {
  try {
    const { id } = req.params;

    const car = await Car.findById(id);

    if (!car) {
      return res.status(404).json({
        message: "Car not found",
      });
    }

    if (car.seller.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You are not allowed to update this car",
      });
    }

    const {
      brand,
      model,
      variant,
      year,
      price,
      fuelType,
      transmission,
      mileage,
      kilometersDriven,
      city,
      description,
      images,
      status,
    } = req.body;

    car.brand = brand ?? car.brand;
    car.model = model ?? car.model;
    car.variant = variant ?? car.variant;
    car.year = year ?? car.year;
    car.price = price ?? car.price;
    car.fuelType = fuelType ?? car.fuelType;
    car.transmission = transmission ?? car.transmission;
    car.mileage = mileage ?? car.mileage;
    car.kilometersDriven = kilometersDriven ?? car.kilometersDriven;
    car.city = city ?? car.city;
    car.description = description ?? car.description;
    car.images = images ?? car.images;
    car.status = status ?? car.status;

    await car.save();

    res.status(200).json({
      message: "Car updated successfully",
      car,
    });
  } catch (error) {
    console.error("UPDATE CAR ERROR:", error);

    res.status(500).json({
      message: "Failed to update car",
    });
  }
};

const deleteCar = async (req, res) => {
  try {
    const { id } = req.params;

    const car = await Car.findById(id);

    if (!car) {
      return res.status(404).json({
        message: "Car not found",
      });
    }

    if (car.seller.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You are not allowed to delete this car",
      });
    }

    await car.deleteOne();

    res.status(200).json({
      message: "Car deleted successfully",
    });
  } catch (error) {
    console.error("DELETE CAR ERROR:", error);

    res.status(500).json({
      message: "Failed to delete car",
    });
  }
};

module.exports = {
  createCar,
  getCars,
  updateCar,
  deleteCar,
  uploadToCloudinary,
  getMyCars,
  getCarById,
  getMyCarById,
};
