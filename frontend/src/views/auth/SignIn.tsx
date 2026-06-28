import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  MdVisibility,
  MdVisibilityOff,
  MdLocalPharmacy,
  MdInventory2,
  MdOutlineReceiptLong,
  MdOutlineVerifiedUser,
  MdOutlineAssessment,
} from "react-icons/md";
import { useAuthStore } from "store/authStore";

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/admin/home";

  const { login, isLoading, error, clearError } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("admin@omacx.com");
  const [password, setPassword] = useState("Admin@12345");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    await login(email, password);
    if (useAuthStore.getState().isAuthenticated) {
      navigate("/admin/home", { replace: true });
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Left Panel — Branding */}
      <div className="relative hidden overflow-hidden bg-navy-900 lg:flex lg:w-[45%] xl:w-[50%]">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=2069&auto=format&fit=crop')",
          }}
        />
        {/* Heavy dark overlay for readability */}
        <div className="absolute inset-0 bg-navy-900/80 bg-gradient-to-br from-navy-900/90 via-navy-900/80 to-brand-900/70 backdrop-blur-[2px]" />

        {/* Decorative elements */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full bg-brand-500/20 mix-blend-screen blur-3xl" />
        <div className="pointer-events-none absolute bottom-20 right-10 h-72 w-72 rounded-full bg-indigo-500/20 mix-blend-screen blur-3xl" />

        {/* Grid pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex h-full w-full flex-col justify-between p-10 xl:p-14">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-lg shadow-brand-500/30">
              <MdLocalPharmacy className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-[19px] font-extrabold leading-tight tracking-wide text-white">
                PharmaDist
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-300">
                ERP System
              </p>
            </div>
          </div>

          {/* Hero Text in a Glassy Card */}
          <div className="relative z-20 mb-8 mt-auto w-full max-w-[480px] rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/40 backdrop-blur-md xl:p-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/20 px-3 py-1.5">
              <span className="h-2 w-2 animate-pulse rounded-full bg-brand-400" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-brand-300">
                Enterprise Grade
              </span>
            </div>

            <h1 className="mb-5 text-4xl font-extrabold leading-[1.15] tracking-tight text-white xl:text-5xl">
              Streamline your <br />
              <span className="bg-gradient-to-r from-brand-300 to-indigo-300 bg-clip-text text-transparent">
                pharmaceutical
              </span>
              <br />
              distribution
            </h1>

            <p className="mb-8 text-[15px] font-medium leading-relaxed text-navy-100">
              Manage inventory, invoices, compliance, and finances — all from
              one unified platform built for modern distributors.
            </p>

            {/* Features */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-5">
              {[
                { icon: MdInventory2, text: "Inventory Control" },
                { icon: MdOutlineReceiptLong, text: "Invoice Management" },
                { icon: MdOutlineVerifiedUser, text: "Compliance Ready" },
                { icon: MdOutlineAssessment, text: "Financial Reports" },
              ].map((feature: unknown, idx: unknown) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/5 bg-white/10 text-brand-300 shadow-inner">
                    <feature.icon size={18} />
                  </div>
                  <span className="text-[13px] font-bold text-white/90">
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom */}
          <div className="mt-auto flex items-center justify-between">
            <p className="text-[12px] font-medium text-white/50">
              © {new Date().getFullYear()} PharmaDist Lanka Pvt Ltd
            </p>
            <div className="flex gap-5 text-[12px] font-medium text-white/50">
              <a href="#" className="transition-colors hover:text-white">
                Privacy Policy
              </a>
              <a href="#" className="transition-colors hover:text-white">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-gray-50 px-6 py-10 lg:bg-white">
        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-3 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 shadow-md shadow-brand-500/20">
            <MdLocalPharmacy className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-[15px] font-bold leading-tight text-navy-700">
              PharmaDist
            </p>
            <p className="text-[10px] font-medium uppercase tracking-widest text-gray-400">
              ERP System
            </p>
          </div>
        </div>

        <div className="w-full max-w-[400px]">
          {/* Header */}
          <div className="mb-8">
            <h2 className="mb-1 text-2xl font-bold text-navy-700">
              Welcome back
            </h2>
            <p className="text-sm text-gray-400">
              Sign in to your account to continue
            </p>
          </div>

          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            {/* Error Banner */}
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <div className="h-2 w-2 shrink-0 rounded-full bg-red-500" />
                <span className="text-[13px] font-medium text-red-600">
                  {error}
                </span>
              </div>
            )}

            {/* Email Field */}
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold tracking-wide text-navy-700">
                Email address
              </label>
              <input
                type="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={(e: any) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-[14px] font-medium leading-relaxed text-navy-700 shadow-sm transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
              />
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-[13px] font-bold tracking-wide text-navy-700">
                  Password
                </label>
                <a
                  href="#"
                  className="text-[13px] font-bold text-brand-500 transition-colors hover:text-brand-600"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e: any) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 pr-12 text-[14px] font-medium leading-relaxed text-navy-700 shadow-sm transition-all placeholder:text-gray-400 hover:border-gray-300 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 transition-colors hover:text-brand-500"
                >
                  {showPassword ? (
                    <MdVisibilityOff size={18} />
                  ) : (
                    <MdVisibility size={18} />
                  )}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                defaultChecked
                className="h-4 w-4 cursor-pointer rounded border-gray-300 text-brand-500 focus:ring-brand-500"
              />
              <label
                htmlFor="remember"
                className="cursor-pointer select-none text-[13px] text-gray-500"
              >
                Keep me signed in
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-brand-600 hover:shadow-lg hover:shadow-brand-500/25 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:shadow-none"
            >
              {isLoading ? (
                <>
                  <svg
                    className="h-4 w-4 animate-spin text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Dev credentials hint */}
          <div className="mt-6 rounded-xl border border-gray-100 bg-gray-50 p-3 text-center">
            <p className="text-[11px] text-gray-400">
              <span className="font-bold text-gray-500">Dev Credentials:</span>{" "}
              kamali@pharmadist.lk / admin123
            </p>
          </div>

          {/* Mobile footer */}
          <p className="mt-8 text-center text-[11px] text-gray-400 lg:hidden">
            © {new Date().getFullYear()} PharmaDist Lanka Pvt Ltd
          </p>
        </div>
      </div>
    </div>
  );
}
