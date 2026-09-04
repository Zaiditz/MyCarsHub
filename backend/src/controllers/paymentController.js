const crypto = require("crypto");
const Razorpay = require("razorpay");
const User = require("../models/User");
const Payment = require("../models/Payment");
const VerificationRequest = require("../models/VerificationRequest");

const razorpay =
  process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
    ? new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET,
      })
    : null;

const PRO_PLAN_NAME = "MyCarsHub Pro";
const PRO_AMOUNT = Number(process.env.PRO_MONTHLY_AMOUNT || 299);
const VERIFICATION_AMOUNT = Number(process.env.VERIFICATION_AMOUNT || 149);

function requireRazorpay(res) {
  if (!razorpay) {
    res
      .status(503)
      .json({
        message:
          "Payments are not configured yet. Add Razorpay test keys to the backend environment.",
      });
    return false;
  }
  return true;
}

function verifyHmac(payload, signature, secret) {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  const received = Buffer.from(signature || "", "utf8");
  const generated = Buffer.from(expected, "utf8");
  return (
    received.length === generated.length &&
    crypto.timingSafeEqual(received, generated)
  );
}

const getBillingInfo = async (req, res) => {
  const user = await User.findById(req.user.userId).select(
    "name email role createdAt subscriptionPlan subscriptionStatus subscriptionId subscriptionExpiresAt subscriptionCancelAtCycleEnd verificationStatus verifiedAt",
  );
  if (!user) return res.status(404).json({ message: "User not found" });
  if (
    user.subscriptionPlan === "pro" &&
    user.subscriptionExpiresAt &&
    user.subscriptionExpiresAt <= new Date()
  ) {
    user.subscriptionPlan = "free";
    user.subscriptionStatus = "inactive";
    user.subscriptionId = null;
    user.subscriptionCancelAtCycleEnd = false;
    await user.save();
  }
  res.json({
    user,
    plans: {
      pro: { amount: PRO_AMOUNT, currency: "INR", name: PRO_PLAN_NAME },
      verification: {
        amount: VERIFICATION_AMOUNT,
        currency: "INR",
        name: "Seller Verification",
      },
    },
  });
};

const createProSubscription = async (req, res) => {
  try {
    if (!requireRazorpay(res)) return;
    if (!process.env.RAZORPAY_PLAN_ID) {
      return res
        .status(503)
        .json({
          message:
            "Razorpay subscription plan is not configured. Add RAZORPAY_PLAN_ID to the backend environment.",
        });
    }

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (
      user.subscriptionPlan === "pro" &&
      user.subscriptionStatus === "active" &&
      user.subscriptionExpiresAt &&
      user.subscriptionExpiresAt > new Date()
    ) {
      return res
        .status(409)
        .json({ message: "You already have an active Pro subscription" });
    }

    const subscription = await razorpay.subscriptions.create({
      plan_id: process.env.RAZORPAY_PLAN_ID,
      total_count: Number(process.env.RAZORPAY_TOTAL_COUNT || 12),
      customer_notify: 1,
      notes: { userId: user._id.toString(), plan: "pro" },
    });

    await Payment.create({
      user: user._id,
      type: "subscription",
      amount: PRO_AMOUNT,
      currency: "INR",
      subscriptionId: subscription.id,
      status: "created",
    });

    res.status(201).json({
      keyId: process.env.RAZORPAY_KEY_ID,
      subscriptionId: subscription.id,
      amount: PRO_AMOUNT,
      currency: "INR",
      name: PRO_PLAN_NAME,
      prefill: { name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("CREATE PRO SUBSCRIPTION ERROR:", error);
    res.status(500).json({ message: "Failed to start Pro subscription" });
  }
};

const verifyProSubscription = async (req, res) => {
  try {
    const {
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
    } = req.body;
    if (
      !razorpay_payment_id ||
      !razorpay_subscription_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({ message: "Incomplete payment response" });
    }

    const payment = await Payment.findOne({
      subscriptionId: razorpay_subscription_id,
      user: req.user.userId,
    });
    if (!payment)
      return res.status(404).json({ message: "Subscription record not found" });

    const valid = verifyHmac(
      `${razorpay_payment_id}|${razorpay_subscription_id}`,
      razorpay_signature,
      process.env.RAZORPAY_KEY_SECRET,
    );
    if (!valid)
      return res.status(400).json({ message: "Invalid payment signature" });

    const user = await User.findById(req.user.userId);
    const subscription = await razorpay.subscriptions.fetch(
      razorpay_subscription_id,
    );
    const currentEnd = subscription.current_end
      ? new Date(subscription.current_end * 1000)
      : new Date(Date.now() + 31 * 24 * 60 * 60 * 1000);

    user.subscriptionPlan = "pro";
    user.subscriptionStatus =
      subscription.status === "active" ? "active" : "inactive";
    user.subscriptionId = razorpay_subscription_id;
    user.subscriptionExpiresAt = currentEnd;
    await user.save();

    payment.paymentId = razorpay_payment_id;
    payment.status = "paid";
    await payment.save();

    res.json({
      message: "Pro subscription activated",
      user: {
        subscriptionPlan: user.subscriptionPlan,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionExpiresAt: user.subscriptionExpiresAt,
      },
    });
  } catch (error) {
    console.error("VERIFY PRO SUBSCRIPTION ERROR:", error);
    res.status(500).json({ message: "Failed to verify subscription" });
  }
};

const createVerificationOrder = async (req, res) => {
  try {
    if (!requireRazorpay(res)) return;

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.verificationStatus === "verified")
      return res
        .status(409)
        .json({ message: "Your seller account is already verified" });

    const pending = await VerificationRequest.findOne({
      user: user._id,
      status: "pending",
      paymentStatus: "paid",
    });
    if (pending)
      return res
        .status(409)
        .json({
          message: "You already have a verification request under review",
        });

    const { fullName, phone, idType, idLast4, note } = req.body;
    if (
      !fullName?.trim() ||
      !phone?.trim() ||
      !idType ||
      !/^\d{4}$/.test(idLast4 || "")
    ) {
      return res
        .status(400)
        .json({ message: "Please provide valid verification details" });
    }

    const request = await VerificationRequest.create({
      user: user._id,
      fullName: fullName.trim(),
      phone: phone.trim(),
      idType,
      idLast4,
      note: note?.trim(),
    });

    const order = await razorpay.orders.create({
      amount: VERIFICATION_AMOUNT * 100,
      currency: "INR",
      receipt: `verify_${request._id}`,
      notes: {
        userId: user._id.toString(),
        type: "verification",
        verificationRequestId: request._id.toString(),
      },
    });

    request.paymentOrderId = order.id;
    await request.save();

    await Payment.create({
      user: user._id,
      type: "verification",
      amount: VERIFICATION_AMOUNT,
      currency: "INR",
      orderId: order.id,
      status: "created",
      metadata: { verificationRequestId: request._id.toString() },
    });

    user.verificationStatus = "pending";
    await user.save();

    res.status(201).json({
      keyId: process.env.RAZORPAY_KEY_ID,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      name: "MyCarsHub Seller Verification",
      prefill: { name: user.name, email: user.email },
    });
  } catch (error) {
    console.error("CREATE VERIFICATION ORDER ERROR:", error);
    res.status(500).json({ message: "Failed to start seller verification" });
  }
};

const verifyVerificationPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature)
      return res.status(400).json({ message: "Incomplete payment response" });

    const payment = await Payment.findOne({
      orderId: razorpay_order_id,
      user: req.user.userId,
      type: "verification",
    });
    if (!payment)
      return res
        .status(404)
        .json({ message: "Verification payment not found" });

    const valid = verifyHmac(
      `${razorpay_order_id}|${razorpay_payment_id}`,
      razorpay_signature,
      process.env.RAZORPAY_KEY_SECRET,
    );
    if (!valid)
      return res.status(400).json({ message: "Invalid payment signature" });

    payment.paymentId = razorpay_payment_id;
    payment.status = "paid";
    await payment.save();

    await VerificationRequest.findOneAndUpdate(
      { paymentOrderId: razorpay_order_id, user: req.user.userId },
      { paymentStatus: "paid" },
    );

    res.json({
      message:
        "Verification payment received. Your request is now waiting for admin review.",
    });
  } catch (error) {
    console.error("VERIFY VERIFICATION PAYMENT ERROR:", error);
    res.status(500).json({ message: "Failed to verify verification payment" });
  }
};

const razorpayWebhook = async (req, res) => {
  try {
    const signature = req.headers["x-razorpay-signature"];
    if (!signature || !process.env.RAZORPAY_WEBHOOK_SECRET)
      return res.status(400).json({ message: "Webhook is not configured" });

    const rawBody = req.body.toString("utf8");
    if (!verifyHmac(rawBody, signature, process.env.RAZORPAY_WEBHOOK_SECRET)) {
      return res.status(400).json({ message: "Invalid webhook signature" });
    }

    const event = JSON.parse(rawBody);
    const entity =
      event.payload?.subscription?.entity ||
      event.payload?.payment?.entity ||
      event.payload?.order?.entity;

    if (
      event.event === "subscription.charged" ||
      event.event === "subscription.activated"
    ) {
      const subscriptionId = entity?.id;
      if (subscriptionId) {
        const initialPayment = await Payment.findOne({ subscriptionId }).sort({
          createdAt: 1,
        });
        if (initialPayment) {
          if (event.event === "subscription.activated") {
            initialPayment.status = "paid";
            await initialPayment.save();
          }

          if (entity?.payment_id) {
            const existingCharge = await Payment.findOne({
              paymentId: entity.payment_id,
            });
            if (!existingCharge) {
              await Payment.create({
                user: initialPayment.user,
                type: "subscription",
                amount: Number(entity.amount || PRO_AMOUNT * 100) / 100,
                currency: entity.currency || "INR",
                subscriptionId,
                paymentId: entity.payment_id,
                status: "paid",
                metadata: { event: event.event },
              });
            }
          }

          const user = await User.findById(initialPayment.user);
          if (user) {
            user.subscriptionPlan = "pro";
            user.subscriptionStatus = "active";
            user.subscriptionCancelAtCycleEnd = false;
            user.subscriptionId = subscriptionId;
            if (entity.current_end)
              user.subscriptionExpiresAt = new Date(entity.current_end * 1000);
            await user.save();
          }
        }
      }
    }

    if (
      event.event === "subscription.cancelled" ||
      event.event === "subscription.halted"
    ) {
      const subscriptionId = entity?.id;
      const payment = await Payment.findOne({ subscriptionId });
      if (payment) {
        const user = await User.findById(payment.user);
        if (user) {
          user.subscriptionStatus =
            event.event === "subscription.halted" ? "halted" : "cancelled";
          user.subscriptionCancelAtCycleEnd = false;
          if (event.event === "subscription.cancelled")
            user.subscriptionPlan = "free";
          await user.save();
        }
      }
    }

    if (event.event === "order.paid") {
      const orderId = entity?.id;
      const payment = await Payment.findOne({ orderId, type: "verification" });
      if (payment) {
        payment.status = "paid";
        const paymentEntity = event.payload?.payment?.entity;
        if (paymentEntity?.id) payment.paymentId = paymentEntity.id;
        await payment.save();
        await VerificationRequest.findOneAndUpdate(
          { paymentOrderId: orderId },
          { paymentStatus: "paid" },
        );
      }
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("RAZORPAY WEBHOOK ERROR:", error);
    res.status(200).json({ received: true });
  }
};

const cancelProSubscription = async (req, res) => {
  try {
    if (!requireRazorpay(res)) return;
    const user = await User.findById(req.user.userId);
    if (!user?.subscriptionId)
      return res
        .status(400)
        .json({ message: "No active Pro subscription found" });

    await razorpay.subscriptions.cancel(user.subscriptionId, {
      cancel_at_cycle_end: true,
    });
    user.subscriptionCancelAtCycleEnd = true;
    await user.save();

    res.json({
      message:
        "Pro subscription scheduled for cancellation at the end of the current billing cycle",
      subscriptionStatus: user.subscriptionStatus,
    });
  } catch (error) {
    console.error("CANCEL PRO SUBSCRIPTION ERROR:", error);
    res.status(500).json({ message: "Failed to cancel Pro subscription" });
  }
};

module.exports = {
  getBillingInfo,
  createProSubscription,
  verifyProSubscription,
  createVerificationOrder,
  verifyVerificationPayment,
  cancelProSubscription,
  razorpayWebhook,
  PRO_AMOUNT,
  VERIFICATION_AMOUNT,
};