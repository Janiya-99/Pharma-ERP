import React from "react";
import { useAuth } from "../../auth/AuthContext";
import { LogOut, ChevronRight, Menu } from "lucide-react";
import BranchSwitcher from "./BranchSwitcher";
import SoftwareSwitcher from "./SoftwareSwitcher";
import { useLocation } from "react-router-dom";
import { useSidebarState } from "./AppLayout";
import { Button } from "../ui/button";

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
    <header className="glass-header sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between px-3 md:px-4 lg:px-6">
      {/* Left: Mobile menu toggle + Breadcrumb */}
      <div className="flex min-w-0 items-center gap-3">
        {/* Mobile menu toggle — hidden on lg+ */}
        <button
          onClick={() => setMobileOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-[#002137] transition-colors hover:bg-slate-100/80 hover:text-[#002137] lg:hidden"
          aria-label="Open sidebar menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Breadcrumbs — hidden on mobile for space */}
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
      </div>

      {/* Center: Switchers — wrapped on small screens */}
      <div className="mx-2 flex items-center gap-2 md:mx-4">
        <BranchSwitcher />
        <SoftwareSwitcher />
      </div>

      {/* Right: User info + Logout */}
      <div className="flex shrink-0 items-center gap-2 md:gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-transparent bg-[#4854CC] text-xs font-bold text-white shadow-sm overflow-hidden">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold leading-none text-[#111827]">
              {user?.name || user?.full_name || "User"}
            </p>
            <p className="mt-0.5 text-[10px] leading-none text-[#6B7280]">
              {company?.company_name || "Pharma ERP"}
            </p>
          </div>
        </div>
        <div className="mx-1 hidden h-6 w-px bg-slate-200/80 sm:block" />
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
