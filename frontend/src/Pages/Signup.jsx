import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { registerUser, getMe } from "../api/api";

export default function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();
  const password = watch("password");

async function onSubmit(data) {
  try {
    setLoading(true);
    setServerError("");

    const { confirmPassword, ...userData } = data;

    const response = await registerUser(userData);

    let user = response.data.user;

    if (!user) {
      const meResponse = await getMe();
      user = meResponse.data.user;
    }

    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
      window.dispatchEvent(new Event("authchange"));
    }

    navigate("/");
  } catch (error) {
    setServerError(error.response?.data?.message || "Failed to create account");
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="page-shell flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-[430px] rounded-2xl border border-gray-200 bg-white p-7 shadow-sm sm:p-8">
        <div className="mb-7">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-gray-400">
            MyCarsHub
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.03em]">
            Create your account
          </h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">
            Join MyCarsHub to buy and sell cars.
          </p>
        </div>
        {serverError && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {serverError}
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Field label="Name" error={errors.name?.message}>
            <input
              type="text"
              placeholder="Your name"
              {...register("name", { required: "Name is required" })}
              className="field"
            />
          </Field>
          <Field label="Email" error={errors.email?.message}>
            <input
              type="email"
              placeholder="you@example.com"
              {...register("email", { required: "Email is required" })}
              className="field"
            />
          </Field>
          <Field label="Password" error={errors.password?.message}>
            <input
              type="password"
              placeholder="Create a password"
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
              className="field"
            />
          </Field>
          <Field
            label="Confirm Password"
            error={errors.confirmPassword?.message}
          >
            <input
              type="password"
              placeholder="Enter your password again"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (value) =>
                  value === password || "Passwords do not match",
              })}
              className="field"
            />
          </Field>
          <button
            type="submit"
            disabled={loading}
            className="primary-button w-full py-3 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-semibold text-black hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold">{label}</label>
      {children}
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  );
}