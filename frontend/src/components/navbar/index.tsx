import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, LayoutDashboard, FileText, Package, DollarSign, ShieldCheck, FolderKanban } from "lucide-react";
import { useAuthStore } from "store/authStore";

const modules = [
  { name: "Control center", path: "/admin/control-center", icon: LayoutDashboard },
  { name: "Invoice center", path: "/admin/invoice-center", icon: FileText },
  { name: "Inventory", path: "/admin/inventory", icon: Package },
  { name: "Finance", path: "/admin/finance", icon: DollarSign },
  { name: "Compliance", path: "/admin/compliance", icon: ShieldCheck },
  { name: "Projects", path: "/projects", icon: FolderKanban },
];

const Navbar = (props: {
  onOpenSidenav?: () => void;
  brandText?: string;
  secondary?: boolean | string;
}) => {
  const location = useLocation();
  const user = useAuthStore((s: any) => s.user);

  // Determine active module based on path prefix
  const getActiveModule = () => {
    // Exact matching for /projects or starting with /admin/module
    const currentPath = location.pathname;
    
    let active = modules[0]; // Default
    let maxLen = 0;
    
    for (const mod of modules) {
      if (currentPath.startsWith(mod.path) && mod.path.length > maxLen) {
        maxLen = mod.path.length;
        active = mod;
      }
    }
    return active.name;
  };

  const activeModuleName = getActiveModule();

  return (
    <nav className="relative z-40 mx-4 mt-4 flex h-20 items-center justify-between rounded-2xl bg-white px-6 py-4 shadow-sm xl:mx-8">
      {/* Subtle noisy background texture overlay */}
      <div 
        className="pointer-events-none absolute inset-0 rounded-2xl bg-[url('/noise.svg')] opacity-[0.03] mix-blend-multiply"
        aria-hidden="true"
      />
      
      <div className="relative flex w-full flex-row items-center justify-between gap-8">
        
        {/* Navigation Modules */}
        <div className="flex flex-row items-center gap-2">
          {modules.map((mod) => {
            const isActive = mod.name === activeModuleName;
            const Icon = mod.icon;
            
            return (
              <Link 
                key={mod.name} 
                to={mod.path}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-[15px] font-medium tracking-tight transition-all duration-200 ${
                  isActive 
                    ? "bg-gray-900 text-white shadow-md" 
                    : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {isActive && <Icon className="h-[18px] w-[18px]" strokeWidth={2.5} />}
                {mod.name}
              </Link>
            );
          })}
        </div>

        {/* Right Section: Search & User Profile */}
        <div className="flex flex-row items-center gap-6">
          {/* Search Input */}
          <div className="relative flex h-11 w-72 items-center rounded-full bg-gray-50 px-4 ring-1 ring-inset ring-gray-200 transition-all focus-within:bg-white focus-within:ring-2 focus-within:ring-gray-900">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="h-full w-full bg-transparent px-3 text-[15px] text-gray-900 outline-none placeholder:text-gray-400"
            />
          </div>

          {/* User Profile Block */}
          <div className="flex flex-row items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-[14px] font-semibold tracking-tight text-gray-900">
                {user?.name || "Olivia Rhye"}
              </span>
              <span className="text-[13px] font-medium text-gray-500">
                {user?.email || "olivia@example.com"}
              </span>
            </div>
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'Olivia Rhye')}&background=0D8ABC&color=fff`}
              alt="User"
              className="h-11 w-11 rounded-full object-cover shadow-sm ring-1 ring-gray-200"
            />
          </div>
        </div>

      </div>
    </nav>
  );
};

export default Navbar;
