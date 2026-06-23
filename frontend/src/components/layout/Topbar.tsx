import React from "react";
import { useAuth } from "../../auth/AuthContext";
import { LogOut, User } from "lucide-react";
import BranchSwitcher from "./BranchSwitcher";
import SoftwareSwitcher from "./SoftwareSwitcher";

const Topbar = () => {
  const { user, company, logoutUser } = useAuth();

  return (
    <header className="flex items-center justify-between px-6 h-16 bg-white border-b border-gray-200 shrink-0 shadow-sm z-10">
      <div className="flex items-center space-x-6">
        <h2 className="text-lg font-bold text-gray-800 tracking-tight">
          {company?.company_name || "Pharma ERP"}
        </h2>
        
        <div className="h-6 w-px bg-gray-300 hidden md:block"></div>
        
        <div className="hidden md:flex items-center space-x-4">
          <BranchSwitcher />
          <SoftwareSwitcher />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600 font-medium">
          <User className="w-4 h-4" />
          <span>{user?.name || "User"}</span>
        </div>
        <button
          onClick={logoutUser}
          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
};

export default Topbar;
