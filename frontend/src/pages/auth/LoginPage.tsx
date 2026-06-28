import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { 
  MdVisibility, 
  MdVisibilityOff, 
  MdLocalPharmacy,
  MdInventory2,
  MdOutlineReceiptLong,
  MdOutlineVerifiedUser,
  MdOutlineAssessment
} from "react-icons/md";

const LoginPage = () => {
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await loginUser(formData.email, formData.password);

    if (res.success) {
      navigate("/control-center/dashboard");
    } else {
      setError(res.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[50%] relative overflow-hidden bg-navy-900">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1587854692152-cbe660dbde88?q=80&w=2069&auto=format&fit=crop')" }}
        />
        {/* Heavy dark overlay for readability */}
        <div className="absolute inset-0 bg-navy-900/80 bg-gradient-to-br from-navy-900/90 via-navy-900/80 to-brand-900/70 backdrop-blur-[2px]" />

        {/* Decorative elements */}
        <div className="absolute -top-20 -left-20 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-20 right-10 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl mix-blend-screen pointer-events-none" />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.05] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14 w-full h-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-lg shadow-brand-500/30">
              <MdLocalPharmacy className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-[19px] font-extrabold text-white leading-tight tracking-wide">Pharma ERP</p>
              <p className="text-[10px] font-bold text-brand-300 uppercase tracking-[0.2em]">
                Enterprise System
              </p>
            </div>
          </div>

          {/* Hero Text in a Glassy Card */}
          <div className="relative z-20 mt-auto mb-8 w-full max-w-[480px] rounded-3xl bg-white/5 border border-white/10 p-8 xl:p-10 backdrop-blur-md shadow-2xl shadow-black/40">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-brand-500/20 px-3 py-1.5 border border-brand-500/30">
              <span className="h-2 w-2 rounded-full bg-brand-400 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-brand-300">Enterprise Grade</span>
            </div>
            
            <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-[1.15] mb-5 tracking-tight">
              Streamline your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 to-indigo-300">pharmaceutical</span><br />
              distribution
            </h1>
            
            <p className="text-[15px] text-gray-200 leading-relaxed mb-8 font-medium">
              Manage inventory, invoices, compliance, and finances — all from one unified platform built for modern distributors.
            </p>

            {/* Features */}
            <div className="grid grid-cols-2 gap-y-5 gap-x-4">
              {[
                { icon: MdInventory2, text: "Inventory Control" },
                { icon: MdOutlineReceiptLong, text: "Invoice Management" },
                { icon: MdOutlineVerifiedUser, text: "Compliance Ready" },
                { icon: MdOutlineAssessment, text: "Financial Reports" }
              ].map((feature: unknown, idx: unknown) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-brand-300 border border-white/5 shadow-inner">
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
          <div className="flex items-center justify-between mt-auto">
            <p className="text-[12px] font-medium text-white/50">
              © {new Date().getFullYear()} Pharma ERP Systems
            </p>
            <div className="flex gap-5 text-[12px] font-medium text-white/50">
              <a href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms of Service
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
            <p className="text-[15px] font-bold text-gray-900 leading-tight">Pharma ERP</p>
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">
              Enterprise System
            </p>
          </div>
        </div>

        <div className="w-full max-w-[400px]">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h2>
            <p className="text-sm text-gray-500">
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
            <div className="flex flex-col gap-2">
              <label className="text-[13px] font-bold text-gray-700 tracking-wide">
                Email address
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="admin@omacx.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-[14px] font-medium leading-relaxed text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 hover:border-gray-300 transition-all shadow-sm"
              />
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label className="text-[13px] font-bold text-gray-700 tracking-wide">
                  Password
                </label>
                <a
                  href="#"
                  className="text-[13px] font-bold text-brand-500 hover:text-brand-600 transition-colors"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 pr-12 text-[14px] font-medium leading-relaxed text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 hover:border-gray-300 transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-brand-500 transition-colors"
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
              disabled={loading || !formData.email || !formData.password}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-brand-600 hover:shadow-lg hover:shadow-brand-500/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              {loading ? (
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

          {/* Mobile footer */}
          <p className="lg:hidden mt-8 text-center text-[11px] text-gray-400">
            © {new Date().getFullYear()} Pharma ERP Systems
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
