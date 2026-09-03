import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router";
import { loginUser } from "../api/api";

export default function Login() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  async function onSubmit(data) {
    try {
      const response = await loginUser(data);
      if (response.data.user)
        localStorage.setItem("user", JSON.stringify(response.data.user));
      window.dispatchEvent(new Event("authchange"));
      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    }
  }

  return (
    <AuthLayout title="Welcome back" copy="Login to continue to MyCarsHub.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
            placeholder="Enter your password"
            {...register("password", { required: "Password is required" })}
            className="field"
          />
        </Field>
        <button type="submit" className="primary-button w-full py-3">
          Login
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-gray-500">
        Don't have an account?{" "}
        <Link to="/signup" className="font-semibold text-black hover:underline">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  );
}

function AuthLayout({ title, copy, children }) {
  return (
    <div className="page-shell flex items-center justify-center px-5 py-12">
      <div className="w-full max-w-107.5 rounded-2xl border border-gray-200 bg-white p-7 shadow-sm sm:p-8">
        <div className="mb-7">
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-gray-400">
            MyCarsHub
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.03em]">
            {title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-gray-500">{copy}</p>
        </div>
        {children}
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