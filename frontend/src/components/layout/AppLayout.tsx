import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const AppLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50/60 font-sans text-gray-900 overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Topbar />
        <main
          className="flex-1 overflow-y-auto scroll-smooth"
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

