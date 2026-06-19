import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MdVisibility, MdVisibilityOff, MdLocalPharmacy } from "react-icons/md";
import { useAuthStore } from "store/authStore";

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/admin/home";

  const { login, isLoading, error, clearError } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("kamali@pharmadist.lk");
  const [password, setPassword] = useState("admin123");

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
      <div className="hidden lg:flex lg:w-[45%] xl:w-[50%] relative overflow-hidden bg-navy-700">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-navy-800 via-navy-700 to-brand-900" />

        {/* Decorative circles */}
        <div className="absolute -top-20 -left-20 h-80 w-80 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute bottom-20 right-10 h-60 w-60 rounded-full bg-brand-400/8 blur-2xl" />
        <div className="absolute top-1/3 right-1/4 h-40 w-40 rounded-full bg-white/5 blur-xl" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500 shadow-lg shadow-brand-500/30">
              <MdLocalPharmacy className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold text-white leading-tight">PharmaDist</p>
              <p className="text-[10px] font-medium text-brand-200 uppercase tracking-[0.2em]">
                ERP System
              </p>
            </div>
          </div>

          {/* Hero Text */}
          <div className="max-w-md">
            <h1 className="text-3xl xl:text-4xl font-bold text-white leading-tight mb-4">
              Streamline your pharmaceutical distribution
            </h1>
            <p className="text-sm text-navy-200 leading-relaxed mb-8">
              Manage inventory, invoices, compliance, and finances — all from one unified platform built for pharmaceutical distributors.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2">
              {["Inventory Control", "Invoice Management", "Compliance Ready", "Financial Reports"].map(
                (feature) => (
                  <span
                    key={feature}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/8 border border-white/10 text-[12px] font-medium text-white/80"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-brand-400" />
                    {feature}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Bottom */}
          <div className="flex items-center justify-between">
            <p className="text-[11px] text-navy-300">
              © {new Date().getFullYear()} PharmaDist Lanka Pvt Ltd
            </p>
            <div className="flex gap-4 text-[11px] text-navy-300">
              <a href="#" className="hover:text-white transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 bg-gray-50 lg:bg-white">
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-3 mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 shadow-md shadow-brand-500/20">
            <MdLocalPharmacy className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-[15px] font-bold text-navy-700 leading-tight">PharmaDist</p>
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">
              ERP System
            </p>
          </div>
        </div>

        <div className="w-full max-w-[400px]">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-navy-700 mb-1">Welcome back</h2>
            <p className="text-sm text-gray-400">
              Sign in to your account to continue
            </p>
          </div>

          <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
            {/* Error Banner */}
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
                <span className="text-[13px] font-medium text-red-600">{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-navy-700">
                Email address
              </label>
              <input
                type="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-navy-700 placeholder:text-gray-300 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-50 transition-all"
              />
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[13px] font-semibold text-navy-700">
                  Password
                </label>
                <a
                  href="#"
                  className="text-[12px] font-semibold text-brand-500 hover:text-brand-600 transition-colors"
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
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 pr-11 text-sm text-navy-700 placeholder:text-gray-300 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-50 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-brand-500 transition-colors"
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
                className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500 cursor-pointer"
              />
              <label
                htmlFor="remember"
                className="text-[13px] text-gray-500 cursor-pointer select-none"
              >
                Keep me signed in
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-brand-600 hover:shadow-lg hover:shadow-brand-500/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-white"
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
          <div className="mt-6 rounded-xl bg-gray-50 border border-gray-100 p-3 text-center">
            <p className="text-[11px] text-gray-400">
              <span className="font-bold text-gray-500">Dev Credentials:</span>{" "}
              kamali@pharmadist.lk / admin123
            </p>
          </div>

          {/* Mobile footer */}
          <p className="lg:hidden mt-8 text-center text-[11px] text-gray-400">
            © {new Date().getFullYear()} PharmaDist Lanka Pvt Ltd
          </p>
        </div>
      </div>
    </div>
  );
}
