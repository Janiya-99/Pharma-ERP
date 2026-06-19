import React, { useState } from "react";
import { MdOutlineVerifiedUser, MdOutlineSecurity, MdVisibility, MdVisibilityOff } from "react-icons/md";
import { FcGoogle } from "react-icons/fc";
import { FaLinkedin } from "react-icons/fa";

export default function PharmaSignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const isCtaDisabled = !email || !password;

  return (
    <div className="flex w-full flex-col lg:flex-row h-[calc(100%-80px)] pb-16">
      
      {/* LEFT COLUMN: HERO / ILLUSTRATION */}
      <div className="relative flex w-full lg:w-[55%] flex-col justify-center p-8 sm:p-12 lg:p-20 xl:p-28">
        <div className="max-w-md">
          {/* Abstract Illustration Placeholder matching the dark aesthetic */}
          <div className="mb-10 w-full h-64 rounded-2xl bg-gradient-to-br from-[#2D2054] to-pharmaDark border border-white/5 flex items-center justify-center relative overflow-hidden shadow-inner">
            <svg width="200" height="200" viewBox="0 0 200 200" className="absolute opacity-80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="100" cy="100" r="80" stroke="#7A5CFA" strokeWidth="4" strokeDasharray="10 10"/>
              <rect x="60" y="60" width="80" height="80" rx="16" fill="#A99FCE" fillOpacity="0.2"/>
              <path d="M75 125L125 75M75 75L125 125" stroke="#FF7E67" strokeWidth="6" strokeLinecap="round"/>
              <circle cx="100" cy="100" r="24" fill="#7A5CFA"/>
            </svg>
            <div className="absolute inset-0 bg-gradient-to-t from-pharmaDark to-transparent" />
          </div>

          <h1 className="mb-4 text-3xl font-bold leading-tight md:text-4xl lg:text-5xl text-white">
            Welcome Back to PharmaPortal
          </h1>
          <p className="mb-10 text-lg text-[#A99FCE] font-light">
            Secure access to your clinical resources, samples, and partner tools.
          </p>

          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
              <MdOutlineSecurity className="text-xl text-[#FF7E67]" />
              <span className="text-sm font-medium text-white/90">HIPAA-compliant</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm">
              <MdOutlineVerifiedUser className="text-xl text-pharmaPurple" />
              <span className="text-sm font-medium text-white/90">Verified access</span>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: SIGN IN CARD */}
      <div className="flex w-full lg:w-[45%] flex-col items-center justify-center p-4 sm:p-8 lg:p-12 relative z-10">
        <div className="w-full max-w-[480px] rounded-[24px] bg-white p-8 sm:p-10 shadow-2xl">
          
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-pharmaDark mb-2" style={{ fontFamily: "Georgia, serif" }}>
              Sign In
            </h2>
            <p className="text-sm text-[#8E88A5]">
              Please enter your email and password to log in.
            </p>
          </div>

          <form className="flex flex-col gap-6" onSubmit={e => e.preventDefault()}>
            
            {/* Email */}
            <div className="relative border-b border-gray-200 focus-within:border-pharmaPurple transition-colors pb-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#8E88A5]">Email Address</label>
              <input 
                type="email" placeholder="email@example.com" value={email} onChange={e=>setEmail(e.target.value)}
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
                type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)}
                className="w-full bg-transparent text-sm text-pharmaDark placeholder:text-gray-300 focus:outline-none pt-1 pr-8"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 top-6 text-gray-400 hover:text-pharmaPurple">
                {showPassword ? <MdVisibilityOff size={16} /> : <MdVisibility size={16} />}
              </button>
            </div>

            {/* Remember Me */}
            <div className="flex items-start gap-2">
              <input 
                type="checkbox" id="remember" checked={rememberMe} onChange={e=>setRememberMe(e.target.checked)}
                className="mt-0.5 rounded border-gray-300 text-pharmaPurple focus:ring-pharmaPurple cursor-pointer"
              />
              <label htmlFor="remember" className="text-[13px] text-[#8E88A5] cursor-pointer">
                Remember me for 30 days
              </label>
            </div>

            {/* Action Buttons */}
            <div className="mt-2 flex gap-4">
              <button 
                disabled={isCtaDisabled}
                className="flex-[3] flex items-center justify-between rounded-lg bg-pharmaPurple px-6 py-3.5 text-sm font-bold text-white transition-all hover:bg-pharmaPurple/90 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-pharmaPurple/20"
              >
                <span>Log In</span>
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-white">
                  →
                </span>
              </button>
            </div>
            
            {/* Secondary Social Login */}
            <div className="my-2 flex items-center gap-4">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">or continue with</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            <div className="flex gap-4">
              <button type="button" className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white py-2.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50">
                <FcGoogle size={18} /> Google
              </button>
              <button type="button" className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white py-2.5 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50">
                <FaLinkedin size={18} className="text-[#0A66C2]" /> LinkedIn
              </button>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-[13px] font-medium text-[#8E88A5]">
                Don't have an account? <a href="#" className="text-pharmaPurple hover:underline font-bold">Sign Up</a>
              </p>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
