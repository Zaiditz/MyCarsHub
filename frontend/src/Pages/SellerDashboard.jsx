import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  cancelProSubscription,
  createProSubscription,
  createVerificationOrder,
  getBillingInfo,
  verifyProSubscription,
  verifyVerificationPayment,
} from "../api/api";
import { loadRazorpay } from "../utils/razorpay";

export default function SellerDashboard() {
  const [data, setData] = useState(null);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    idType: "Aadhaar",
    idLast4: "",
    note: "",
  });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function load() {
    try {
      setLoading(true);
      const response = await getBillingInfo();
      setData(response.data);
      setForm((prev) => ({
        ...prev,
        fullName: prev.fullName || response.data.user.name,
      }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load seller account");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function updateForm(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function buyPro() {
    try {
      setBusy("pro");
      setError("");
      setMessage("");
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Razorpay Checkout could not be loaded");
      const response = await createProSubscription();
      const details = response.data;

      const options = {
        key: details.keyId,
        subscription_id: details.subscriptionId,
        name: details.name,
        description: "MyCarsHub Pro monthly plan",
        prefill: {
        name: details.prefill?.name || "",
        email: details.prefill?.email || "",
       },
        theme: { color: "#111111" },
        handler: async (paymentResponse) => {
          try {
            await verifyProSubscription(paymentResponse);
            setMessage("Pro is active. Your seller limits have been upgraded.");
            await load();
          } catch (err) {
            setError(
              err.response?.data?.message || "Payment verification failed",
            );
          } finally {
            setBusy("");
          }
        },
        modal: { ondismiss: () => setBusy("") },
      };

      const checkout = new window.Razorpay(options);
      checkout.on("payment.failed", () => {
        setError(
          "Payment failed or was cancelled. No subscription was activated.",
        );
        setBusy("");
      });
      checkout.open();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to start Pro checkout",
      );
      setBusy("");
    }
  }

  async function startVerification(e) {
    e.preventDefault();
    try {
      setBusy("verification");
      setError("");
      setMessage("");
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Razorpay Checkout could not be loaded");
      const response = await createVerificationOrder(form);
      const details = response.data;

      const options = {
        key: details.keyId,
        order_id: details.orderId,
        amount: details.amount,
        currency: details.currency,
        name: details.name,
        description: "MyCarsHub seller verification fee",
        prefill: {
         name: details.prefill?.name || "",
        email: details.prefill?.email || "",
         },
        theme: { color: "#111111" },
        handler: async (paymentResponse) => {
          try {
            await verifyVerificationPayment(paymentResponse);
            setMessage(
              "Payment received. Your verification request is now waiting for admin review.",
            );
            await load();
          } catch (err) {
            setError(
              err.response?.data?.message ||
                "Verification payment could not be confirmed",
            );
          } finally {
            setBusy("");
          }
        },
        modal: { ondismiss: () => setBusy("") },
      };

      const checkout = new window.Razorpay(options);
      checkout.on("payment.failed", () => {
        setError("Verification payment failed or was cancelled.");
        setBusy("");
      });
      checkout.open();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to start verification",
      );
      setBusy("");
    }
  }

  async function cancelPro() {
    if (!window.confirm("Cancel Pro at the end of the current billing cycle?"))
      return;
    try {
      setBusy("cancel");
      setError("");
      const response = await cancelProSubscription();
      setMessage(response.data.message);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to cancel subscription");
    } finally {
      setBusy("");
    }
  }

  if (loading)
    return (
      <div className="page-shell flex items-center justify-center">
        <p className="text-sm text-gray-500">Loading seller account...</p>
      </div>
    );
  if (!data)
    return (
      <div className="page-shell flex items-center justify-center">
        <p className="text-sm text-red-600">Unable to load seller account.</p>
      </div>
    );

  const { user, plans } = data;
  const isPro =
    user.subscriptionPlan === "pro" &&
    ["active", "cancelled"].includes(user.subscriptionStatus);

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <div className="page-shell">
      <div className="page-container max-w-5xl">
        <div className="mb-8">
          <p className="eyebrow">Seller account</p>
          <h1 className="section-title mt-2">Seller Dashboard</h1>
          <p className="section-copy">
            Manage your verification, listings, and seller plan in one place.
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div className="surface p-6">
            <div className="flex flex-wrap items-start justify-between gap-5">
              <div>
                <p className="eyebrow">Seller verification</p>
                <h2 className="mt-3 text-2xl font-bold">
                  Build trust with buyers
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
                  Verified sellers receive a visible badge on their listings.
                  MyCarsHub verifies the seller identity, not the mechanical
                  condition of the vehicle.
                </p>
              </div>
              <div className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold capitalize">
                {user.verificationStatus}
              </div>
            </div>

            {user.verificationStatus === "verified" ? (
              <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm">
                <span className="font-semibold">✓ Verified Seller</span>
                <span className="ml-2 text-gray-500">
                  Identity review completed by MyCarsHub.
                </span>
              </div>
            ) : user.verificationStatus === "pending" ? (
              <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                Your payment is recorded and the request is waiting for admin
                review.
              </div>
            ) : (
              <form
                onSubmit={startVerification}
                className="mt-6 grid gap-4 md:grid-cols-2"
              >
                <input
                  className="field"
                  name="fullName"
                  value={form.fullName}
                  onChange={updateForm}
                  required
                  placeholder="Full name as on ID"
                />
                <input
                  className="field"
                  name="phone"
                  value={form.phone}
                  onChange={updateForm}
                  required
                  placeholder="Phone number"
                />
                <select
                  className="field"
                  name="idType"
                  value={form.idType}
                  onChange={updateForm}
                >
                  <option>Aadhaar</option>
                  <option>Driving Licence</option>
                  <option>Passport</option>
                  <option>Voter ID</option>
                </select>
                <input
                  className="field"
                  name="idLast4"
                  value={form.idLast4}
                  onChange={updateForm}
                  required
                  pattern="\d{4}"
                  maxLength="4"
                  inputMode="numeric"
                  placeholder="Last 4 digits of ID"
                />
                <textarea
                  className="field md:col-span-2"
                  name="note"
                  value={form.note}
                  onChange={updateForm}
                  maxLength="500"
                  rows="3"
                  placeholder="Optional note for the reviewer"
                />
                <div className="md:col-span-2 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      One-time verification
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Fee:{" "}
                      <strong className="text-gray-800">
                        ₹{plans.verification.amount}
                      </strong>
                    </p>
                  </div>
                  <button
                    className="primary-button"
                    disabled={busy === "verification"}
                  >
                    {busy === "verification"
                      ? "Opening checkout..."
                      : `Pay ₹${plans.verification.amount} & Request Verification`}
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <div className="surface p-6">
              <p className="eyebrow">Account</p>
              <h2 className="mt-3 text-xl font-bold">{user.name}</h2>
              <p className="mt-1 text-sm text-gray-500">
                Member since {memberSince}
              </p>

              <div className="mt-6 border-t border-gray-100 pt-5">
                <p className="text-sm text-gray-600">Current plan</p>
                <p className="mt-1 text-base font-semibold capitalize">
                  {isPro ? "Pro" : "Free"}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {isPro
                    ? "Up to 10 active listings"
                    : "Up to 2 active listings"}
                </p>
              </div>

              <Link to="/my-listings" className="secondary-button mt-5 w-full">
                Manage Listings
              </Link>
            </div>

            <div className="surface p-6 lg:col-span-2">
              <div className="flex flex-wrap items-start justify-between gap-5">
                <div>
                  <p className="eyebrow">Seller plan</p>
                  <h2 className="mt-3 text-xl font-bold">MyCarsHub Pro</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Optional tools for sellers who need more listing capacity.
                  </p>
                </div>
                <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-semibold">
                  ₹{plans.pro.amount}/month
                </span>
              </div>

              <div className="mt-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
                {isPro ? (
                  <>
                    <p className="text-sm font-semibold">Pro is active</p>
                    <p className="mt-1 text-sm text-gray-500">
                      {user.subscriptionCancelAtCycleEnd
                        ? "Cancellation is scheduled for the end of the billing cycle."
                        : `Active until ${user.subscriptionExpiresAt ? new Date(user.subscriptionExpiresAt).toLocaleDateString("en-IN") : "the current billing cycle"}.`}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm font-semibold">More room to sell</p>
                    <p className="mt-1 text-sm text-gray-500">
                      Free: 2 active listings · Pro: up to 10 active listings
                    </p>
                  </>
                )}
              </div>

              {isPro ? (
                <button
                  onClick={cancelPro}
                  disabled={
                    busy === "cancel" || user.subscriptionCancelAtCycleEnd
                  }
                  className="secondary-button mt-5"
                >
                  {user.subscriptionCancelAtCycleEnd
                    ? "Cancellation scheduled"
                    : busy === "cancel"
                      ? "Cancelling..."
                      : "Cancel Pro"}
                </button>
              ) : (
                <button
                  onClick={buyPro}
                  disabled={busy === "pro"}
                  className="primary-button mt-5"
                >
                  {busy === "pro"
                    ? "Opening checkout..."
                    : `Upgrade to Pro · ₹${plans.pro.amount}/month`}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}