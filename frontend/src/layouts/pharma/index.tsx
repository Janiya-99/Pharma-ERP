import { Routes, Route, Navigate } from "react-router-dom";
import SignIn from "views/pharma/SignIn";

export default function PharmaLayout() {
  document.documentElement.dir = "ltr";

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-pharmaBgLight p-4 sm:p-8 font-dm overflow-hidden">
      
      {/* Decorative Ambient Blobs */}
      <div className="pointer-events-none absolute left-0 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-200/50 mix-blend-multiply blur-3xl filter" />
      <div className="pointer-events-none absolute right-0 bottom-0 h-[600px] w-[600px] translate-x-1/3 translate-y-1/3 rounded-full bg-purple-200/50 mix-blend-multiply blur-3xl filter" />
      <div className="pointer-events-none absolute left-1/3 bottom-0 h-[400px] w-[400px] rounded-full bg-pink-100/40 mix-blend-multiply blur-3xl filter" />

      {/* Main App Container */}
      <div className="relative flex w-full max-w-[1400px] min-h-[850px] flex-col rounded-[32px] bg-pharmaDark shadow-2xl overflow-hidden z-10">
        
        {/* Header */}
        <header className="flex h-20 w-full items-center justify-between px-8 lg:px-12 pt-4">
          <div className="flex items-center gap-3">
            {/* Logo Mark */}
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <span className="text-xl font-medium tracking-tight text-white">
              PharmaPortal
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-[#A99FCE]">
            <a href="#" className="hover:text-white transition-colors">Marketplace</a>
            <a href="#" className="hover:text-white transition-colors">Resources</a>
            <a href="#" className="hover:text-white transition-colors">Partners</a>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm font-medium text-[#A99FCE] mr-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Login / Register</span>
            </div>
            <button className="hidden sm:block px-5 py-2 rounded-lg border border-white/20 text-white text-sm font-medium hover:bg-white/5 transition-all">
              Log In
            </button>
            <button className="px-5 py-2 rounded-lg bg-pharmaPurple text-white text-sm font-medium hover:bg-pharmaPurple/90 transition-all shadow-lg shadow-pharmaPurple/20">
              Sign Up
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex flex-1 flex-col relative z-10">
          <Routes>
            <Route path="signin" element={<SignIn />} />
            <Route path="/" element={<Navigate to="/pharma/signin" replace />} />
          </Routes>
        </main>

        {/* Bottom Left Support Widget & Footer Links */}
        <div className="absolute bottom-6 left-8 lg:left-12 flex w-[calc(100%-6rem)] items-end justify-between z-20 pointer-events-none">
          {/* Support Widget */}
          <div className="flex items-center gap-3 rounded-full bg-white p-2 pr-6 shadow-xl pointer-events-auto cursor-pointer hover:scale-105 transition-transform">
            <div className="h-10 w-10 overflow-hidden rounded-full bg-blue-100 flex items-center justify-center">
              <img src="https://i.pravatar.cc/150?img=47" alt="Support Agent" className="h-full w-full object-cover" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-navy-900">Support Team</span>
                <span className="text-[10px] text-gray-400">1 Min Ago</span>
              </div>
              <p className="text-xs font-medium text-gray-500">👋 Hey there! How can we help...?</p>
            </div>
          </div>

          {/* Footer Links */}
          <div className="hidden md:flex flex-col items-end gap-2 pointer-events-auto">
            <div className="flex gap-4 text-xs font-medium text-[#A99FCE]">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
            <p className="text-[10px] text-[#A99FCE]/60">
              © {new Date().getFullYear()}. All Rights Reserved. PharmaPortal.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
