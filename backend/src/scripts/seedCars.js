require("dotenv").config();

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Car = require("../models/Car");

const demoSellers = [
  {
    name: "Rahul Sharma",
    email: "demo.rahul@mycarshub.com",
    password: "Demo@12345",
  },
  {
    name: "Arjun Mehta",
    email: "demo.arjun@mycarshub.com",
    password: "Demo@12345",
  },
  {
    name: "Karan Verma",
    email: "demo.karan@mycarshub.com",
    password: "Demo@12345",
  },
  {
    name: "Neha Kapoor",
    email: "demo.neha@mycarshub.com",
    password: "Demo@12345",
  },
  {
    name: "Aman Gupta",
    email: "demo.aman@mycarshub.com",
    password: "Demo@12345",
  },
];

const cars = [
  {
    brand: "Hyundai",
    model: "Creta",
    variant: "SX Petrol IVT",
    year: 2022,
    price: 1350000,
    fuelType: "Petrol",
    transmission: "Automatic",
    mileage: 17.2,
    kilometersDriven: 28000,
    city: "Delhi",
    description:
      "Well maintained Hyundai Creta with automatic transmission and a clean interior. Regularly serviced and ready for daily use.",
  },
  {
    brand: "Kia",
    model: "Seltos",
    variant: "HTX Diesel AT",
    year: 2021,
    price: 1280000,
    fuelType: "Diesel",
    transmission: "Automatic",
    mileage: 19.0,
    kilometersDriven: 41000,
    city: "Gurgaon",
    description:
      "Comfortable and feature-rich Seltos with diesel automatic powertrain. Service history available.",
  },
  {
    brand: "Honda",
    model: "City",
    variant: "ZX CVT",
    year: 2023,
    price: 1420000,
    fuelType: "Petrol",
    transmission: "Automatic",
    mileage: 17.8,
    kilometersDriven: 19000,
    city: "Noida",
    description:
      "Single-owner Honda City in excellent condition with low kilometres and smooth CVT transmission.",
  },
  {
    brand: "Volkswagen",
    model: "Virtus",
    variant: "Topline 1.0 TSI",
    year: 2023,
    price: 1390000,
    fuelType: "Petrol",
    transmission: "Automatic",
    mileage: 18.5,
    kilometersDriven: 22000,
    city: "Delhi",
    description:
      "Sporty and refined Volkswagen Virtus with excellent highway performance and premium interiors.",
  },
  {
    brand: "Skoda",
    model: "Slavia",
    variant: "Style 1.0 TSI",
    year: 2022,
    price: 1160000,
    fuelType: "Petrol",
    transmission: "Manual",
    mileage: 19.2,
    kilometersDriven: 31000,
    city: "Ghaziabad",
    description:
      "Well maintained Slavia with strong performance, spacious cabin and good fuel efficiency.",
  },
  {
    brand: "Tata",
    model: "Nexon",
    variant: "XZ Plus Petrol",
    year: 2022,
    price: 820000,
    fuelType: "Petrol",
    transmission: "Manual",
    mileage: 17.4,
    kilometersDriven: 26000,
    city: "Faridabad",
    description:
      "Reliable Tata Nexon in good condition. Comfortable compact SUV suitable for city and highway driving.",
  },
  {
    brand: "Maruti Suzuki",
    model: "Brezza",
    variant: "Zxi AT",
    year: 2023,
    price: 1080000,
    fuelType: "Petrol",
    transmission: "Automatic",
    mileage: 19.8,
    kilometersDriven: 17000,
    city: "Noida",
    description:
      "Low kilometre Brezza with automatic transmission. Clean interiors and well maintained exterior.",
  },
  {
    brand: "Hyundai",
    model: "Venue",
    variant: "SX Turbo DCT",
    year: 2021,
    price: 890000,
    fuelType: "Petrol",
    transmission: "Automatic",
    mileage: 18.0,
    kilometersDriven: 35000,
    city: "Delhi",
    description:
      "Compact SUV with turbo petrol engine and DCT automatic gearbox. Regularly serviced.",
  },
  {
    brand: "Kia",
    model: "Sonet",
    variant: "HTX Turbo iMT",
    year: 2022,
    price: 940000,
    fuelType: "Petrol",
    transmission: "Manual",
    mileage: 18.8,
    kilometersDriven: 24000,
    city: "Gurgaon",
    description:
      "Feature-packed Kia Sonet with turbo petrol engine. Excellent city car with comfortable interiors.",
  },
  {
    brand: "Honda",
    model: "Amaze",
    variant: "VX CVT",
    year: 2022,
    price: 780000,
    fuelType: "Petrol",
    transmission: "Automatic",
    mileage: 18.3,
    kilometersDriven: 29000,
    city: "Delhi",
    description:
      "Comfortable Honda Amaze automatic with spacious boot and low running costs.",
  },
  {
    brand: "Hyundai",
    model: "Verna",
    variant: "SX Turbo DCT",
    year: 2023,
    price: 1490000,
    fuelType: "Petrol",
    transmission: "Automatic",
    mileage: 20.0,
    kilometersDriven: 16000,
    city: "Noida",
    description:
      "Modern Verna with turbo petrol engine and DCT gearbox. Low kilometres and excellent condition.",
  },
  {
    brand: "Tata",
    model: "Harrier",
    variant: "XZA Plus Diesel AT",
    year: 2021,
    price: 1580000,
    fuelType: "Diesel",
    transmission: "Automatic",
    mileage: 16.8,
    kilometersDriven: 46000,
    city: "Gurgaon",
    description:
      "Spacious Tata Harrier automatic with powerful diesel engine. Suitable for both family and highway use.",
  },
  {
    brand: "Mahindra",
    model: "XUV700",
    variant: "AX5 Diesel",
    year: 2022,
    price: 1740000,
    fuelType: "Diesel",
    transmission: "Manual",
    mileage: 17.0,
    kilometersDriven: 33000,
    city: "Delhi",
    description:
      "Well maintained XUV700 with strong diesel performance and spacious cabin. Family-friendly SUV.",
  },
  {
    brand: "Toyota",
    model: "Hyryder",
    variant: "V Hybrid e-CVT",
    year: 2023,
    price: 1790000,
    fuelType: "Hybrid",
    transmission: "Automatic",
    mileage: 25.0,
    kilometersDriven: 21000,
    city: "Noida",
    description:
      "Efficient Toyota Hyryder hybrid with automatic transmission and excellent fuel economy.",
  },
  {
    brand: "Toyota",
    model: "Innova Crysta",
    variant: "GX Diesel",
    year: 2020,
    price: 1795000,
    fuelType: "Diesel",
    transmission: "Manual",
    mileage: 15.6,
    kilometersDriven: 58000,
    city: "Delhi",
    description:
      "Spacious and dependable Innova Crysta with diesel engine. Ideal for long-distance family travel.",
  },
  {
    brand: "Jeep",
    model: "Compass",
    variant: "Limited Plus Diesel",
    year: 2021,
    price: 1690000,
    fuelType: "Diesel",
    transmission: "Manual",
    mileage: 17.1,
    kilometersDriven: 39000,
    city: "Gurgaon",
    description:
      "Premium Jeep Compass with diesel engine, comfortable cabin and strong road presence.",
  },
  {
    brand: "BMW",
    model: "3 Series",
    variant: "320d Sport Line",
    year: 2019,
    price: 1950000,
    fuelType: "Diesel",
    transmission: "Automatic",
    mileage: 18.5,
    kilometersDriven: 52000,
    city: "Delhi",
    description:
      "Well maintained BMW 3 Series with automatic transmission. Premium sedan with strong performance.",
  },
  {
    brand: "Mercedes-Benz",
    model: "A-Class",
    variant: "A180 Sport",
    year: 2020,
    price: 1980000,
    fuelType: "Petrol",
    transmission: "Automatic",
    mileage: 16.9,
    kilometersDriven: 38000,
    city: "Gurgaon",
    description:
      "Premium Mercedes-Benz hatchback in good condition with a refined automatic powertrain.",
  },
  {
    brand: "MG",
    model: "Hector",
    variant: "Sharp Diesel",
    year: 2021,
    price: 1475000,
    fuelType: "Diesel",
    transmission: "Manual",
    mileage: 16.2,
    kilometersDriven: 43000,
    city: "Ghaziabad",
    description:
      "Spacious MG Hector with premium cabin and comfortable ride quality. Regularly serviced.",
  },
  {
    brand: "Maruti Suzuki",
    model: "Ciaz",
    variant: "Alpha AT",
    year: 2021,
    price: 760000,
    fuelType: "Petrol",
    transmission: "Automatic",
    mileage: 20.4,
    kilometersDriven: 32000,
    city: "Faridabad",
    description:
      "Comfortable and economical Ciaz automatic with spacious interiors and excellent fuel efficiency.",
  },
];

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected");

    const sellerIds = [];

    for (const seller of demoSellers) {
      let existingSeller = await User.findOne({ email: seller.email });

      if (!existingSeller) {
        const hashedPassword = await bcrypt.hash(seller.password, 10);

        existingSeller = await User.create({
          name: seller.name,
          email: seller.email,
          password: hashedPassword,
          role: "user",
          subscriptionPlan: "free",
          subscriptionStatus: "inactive",
          verificationStatus: "unverified",
        });

        console.log(`Created seller: ${seller.name}`);
      } else {
        console.log(`Seller already exists: ${seller.name}`);
      }

      sellerIds.push(existingSeller._id);
    }

    const existingDemoCars = await Car.countDocuments({
      description: { $regex: /^MyCarsHub Demo Listing/ },
    });

    if (existingDemoCars > 0) {
      console.log(
        `Demo cars already exist (${existingDemoCars}). Nothing to add.`,
      );
      await mongoose.disconnect();
      return;
    }

    const carsToInsert = cars.map((car, index) => ({
      ...car,
      seller: sellerIds[index % sellerIds.length],
      status: "active",
      description: `MyCarsHub Demo Listing — ${car.description}`,
    }));

    await Car.insertMany(carsToInsert);

    console.log(`Successfully added ${carsToInsert.length} demo cars.`);
    console.log("All demo cars are active and visible on the marketplace.");

    await mongoose.disconnect();
  } catch (error) {
    console.error("SEED CARS ERROR:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
};
run();