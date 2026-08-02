import React from "react";
import { useAuth } from "../../auth/AuthContext";
import { LogOut, ChevronRight, Menu } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useSidebarState } from "./AppLayout";
import { Button } from "../ui/button";
import ModuleIconSwitcher from "./ModuleIconSwitcher";
import BranchSwitcher from "./BranchSwitcher";

// Map path segments to human-readable breadcrumb names
const segmentLabel = (s: string) =>
  s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const Topbar = () => {
  const { user, company, logoutUser } = useAuth();
  const location = useLocation();
  const { setMobileOpen } = useSidebarState();

  // Build breadcrumb from path
  const segments = location.pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((s, i) => ({
    label: segmentLabel(s),
    isLast: i === segments.length - 1,
  }));

  const initials = (user?.name || user?.full_name || "U")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="glass-header sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between px-4 md:px-6 lg:px-8">
      {/* Left Group: Menu, Breadcrumbs, Module Switcher, Branch Switcher, User Info */}
      <div className="flex min-w-0 items-center gap-3 md:gap-4 lg:gap-6">
        {/* Mobile menu toggle — hidden on lg+ */}
        <button
          onClick={() => setMobileOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-[#002137] transition-colors hover:bg-slate-100/80 hover:text-[#002137] lg:hidden"
          aria-label="Open sidebar menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* 1. Breadcrumbs */}
        <div className="hidden min-w-0 items-center gap-1.5 text-sm sm:flex">
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={i}>
              {i > 0 && (
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[#9CA3AF]" />
              )}
              <span
                className={`truncate ${
                  crumb.isLast
                    ? "font-semibold text-[#111827]"
                    : "text-[#6B7280]"
                }`}
              >
                {crumb.label}
              </span>
            </React.Fragment>
          ))}
        </div>

        <div className="hidden md:block mx-1 h-6 w-px bg-slate-200/80" />

        {/* 2. Module Icons Switcher */}
        <div className="hidden md:block">
          <ModuleIconSwitcher />
        </div>

        <div className="hidden md:block mx-1 h-6 w-px bg-slate-200/80" />

        {/* 3. Branch Switcher */}
        <div className="hidden md:block">
          <BranchSwitcher />
        </div>

        <div className="hidden md:block mx-1 h-6 w-px bg-slate-200/80" />

      </div>

      {/* Right Group: User Info & Logout */}
      <div className="flex shrink-0 items-center gap-4 pl-2">
        {/* 4. User Info */}
        <div className="hidden items-center gap-2.5 sm:flex">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-transparent bg-[#4854CC] text-xs font-bold text-white shadow-sm overflow-hidden">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="text-left">
            <p className="text-sm font-semibold leading-none text-[#111827] max-w-[120px] truncate">
              {user?.name || user?.full_name || "User"}
            </p>
            <p className="mt-0.5 text-[10px] leading-none text-[#6B7280] max-w-[120px] truncate">
              {company?.company_name || "Pharma ERP"}
            </p>
          </div>
        </div>
        
        <div className="hidden sm:block h-6 w-px bg-slate-200/80" />
        <Button
          variant="destructive"
          size="sm"
          onClick={logoutUser}
          aria-label="Logout"
          className="h-9 rounded-xl px-4"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
};

export default Topbar;
