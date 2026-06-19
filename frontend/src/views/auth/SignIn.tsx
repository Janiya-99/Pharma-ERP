import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MdOutlineVerifiedUser, MdOutlineSecurity, MdVisibility, MdVisibilityOff } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";
import { FaLinkedin } from "react-icons/fa";
import { useAuthStore } from "store/authStore";

export default function SignIn() {
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/admin/dashboard";

  const { login, isLoading, error, clearError } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("kamali@pharmadist.lk");
  const [password, setPassword] = useState("admin123");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    await login(email, password);
    // Zustand state is synchronous post-login; check auth state then redirect
    if (useAuthStore.getState().isAuthenticated) {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="flex w-full flex-col lg:flex-row flex-1 overflow-hidden">
      
      {/* LEFT COLUMN */}
      <div className="relative hidden md:flex w-full lg:w-[55%] flex-col justify-center p-8 lg:px-16 h-full overflow-hidden">
        <div className="max-w-md mx-auto lg:mx-0">
          <div className="mb-6 w-full h-40 lg:h-56 rounded-2xl bg-gradient-to-br from-[#2D2054] to-pharmaDark border border-white/5 flex items-center justify-center relative overflow-hidden shadow-inner">
            <svg width="200" height="200" viewBox="0 0 200 200" className="absolute opacity-80" fill="none">
              <circle cx="100" cy="100" r="80" stroke="#7A5CFA" strokeWidth="4" strokeDasharray="10 10"/>
              <rect x="60" y="60" width="80" height="80" rx="16" fill="#A99FCE" fillOpacity="0.2"/>
              <path d="M75 125L125 75M75 75L125 125" stroke="#FF7E67" strokeWidth="6" strokeLinecap="round"/>
              <circle cx="100" cy="100" r="24" fill="#7A5CFA"/>
            </svg>
            <div className="absolute inset-0 bg-gradient-to-t from-pharmaDark to-transparent" />
          </div>

          <h1 className="mb-2 text-2xl font-bold leading-tight lg:text-4xl text-white">
            Welcome to PharmaPortal ERP
          </h1>
          <p className="mb-6 text-sm text-[#A99FCE] font-light">
            Secure, enterprise-grade access to manage your pharmaceutical distribution operations.
          </p>

          <div className="flex flex-col xl:flex-row gap-3">
            <div className="flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-white/5">
              <MdOutlineSecurity className="text-xl text-[#FF7E67]" />
              <span className="text-sm font-medium text-white/90">HIPAA-compliant</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-white/5">
              <MdOutlineVerifiedUser className="text-xl text-pharmaPurple" />
              <span className="text-sm font-medium text-white/90">JWT + Redis Auth</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: SIGN IN CARD */}
      <div className="flex w-full lg:w-[45%] flex-col items-center justify-center p-4 lg:p-8 relative z-10 h-full overflow-hidden">
        <div className="w-full max-w-[420px] rounded-[24px] bg-white p-6 shadow-2xl flex flex-col justify-center shrink-0">
          
          <div className="mb-5">
            <h2 className="text-2xl font-bold text-pharmaDark mb-1" style={{ fontFamily: "Georgia, serif" }}>
              Sign In
            </h2>
            <p className="text-[12px] text-[#8E88A5]">
              Enter your credentials to access the ERP system.
            </p>
          </div>

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            
            {/* Error Banner */}
            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-2.5 flex items-center gap-2">
                <span className="text-[12px] font-semibold text-red-600">{error}</span>
              </div>
            )}

            {/* Email */}
            <div className="relative border-b border-gray-200 focus-within:border-pharmaPurple transition-colors pb-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#8E88A5]">Email Address</label>
              <input 
                type="email"
                required
                placeholder="email@pharmadist.lk"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-transparent text-sm text-pharmaDark placeholder:text-gray-300 focus:outline-none pt-1"
              />
            </div>

            {/* Password */}
            <div className="relative border-b border-gray-200 focus-within:border-pharmaPurple transition-colors pb-1">
              <div className="flex justify-between">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#8E88A5]">Password</label>
                <a href="#" className="text-[11px] font-bold text-pharmaPurple hover:underline">Forgot?</a>
              </div>
              <input 
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-transparent text-sm text-pharmaDark placeholder:text-gray-300 focus:outline-none pt-1 pr-8"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 top-6 text-gray-400 hover:text-pharmaPurple">
                {showPassword ? <MdVisibilityOff size={16} /> : <MdVisibility size={16} />}
              </button>
            </div>

            {/* CTA */}
            <div className="mt-2 flex flex-col sm:flex-row gap-3">
              <button 
                type="submit"
                disabled={isLoading || !email || !password}
                className="flex-[3] flex items-center justify-between rounded-lg bg-pharmaPurple px-5 py-3 text-sm font-bold text-white transition-all hover:bg-pharmaPurple/90 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-pharmaPurple/20 w-full shrink-0"
              >
                <span>{isLoading ? "Signing in..." : "Log In"}</span>
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                ) : (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">→</span>
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="my-1 flex items-center gap-4">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">or</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button type="button" className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 shrink-0">
                <FcGoogle size={18} /> Google
              </button>
              <button type="button" className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 shrink-0">
                <FaLinkedin size={16} className="text-[#0A66C2]" /> LinkedIn
              </button>
            </div>

            {/* Dev hint */}
            <div className="mt-1 rounded-lg bg-[#F3F6FC] p-2.5 text-center">
              <p className="text-[11px] text-[#8E88A5]">
                <span className="font-bold">Dev:</span> kamali@pharmadist.lk / admin123
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
