require("dotenv").config();
const Razorpay = require("razorpay");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function main() {
  const amount = Number(process.env.PRO_MONTHLY_AMOUNT || 299) * 100;
  await razorpay.plans.create({
    period: "monthly",
    interval: 1,
    item: {
      name: "MyCarsHub Pro",
      amount,
      currency: "INR",
      description: "MyCarsHub Pro seller plan",
    },
  });
}

main().catch((error) => {
  console.error("Failed to create Razorpay plan:", error.error?.description || error.message);
  console.error(error);
  process.exit(1);
});
