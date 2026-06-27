import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const AppLayout = () => {
  return (
    <div className="flex h-screen bg-transparent font-sans text-blueMono-900 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar />
        <main
          className="flex-1 overflow-y-auto scroll-smooth flex flex-col justify-between"
        >
          <div className="flex-grow">
            <Outlet />
          </div>
          <footer className="py-4 px-8 border-t border-slate-200 bg-white/20 backdrop-blur-md text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-2 mt-auto">
            <span>© {new Date().getFullYear()} Pharma ERP. All rights reserved.</span>
            <span>Developed by <span className="font-semibold text-slate-700">PIXANC co</span></span>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

