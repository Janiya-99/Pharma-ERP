import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const AppLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-white font-sans text-blueMono-900">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex flex-1 flex-col justify-between overflow-y-auto scroll-smooth bg-white">
          <div className="flex-grow">
            <Outlet />
          </div>
          <footer className="border-slate-200 text-slate-500 mb-1 mt-auto flex flex-col items-center justify-between gap-2 border-t bg-white/20 px-8 py-4 text-xs backdrop-blur-md sm:flex-row">
            <span>
              © {new Date().getFullYear()} Pharma ERP. All rights reserved.
            </span>
            <span>
              Developed by{" "}
              <span className="text-slate-700 font-semibold">PIXANDCO</span>
            </span>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
