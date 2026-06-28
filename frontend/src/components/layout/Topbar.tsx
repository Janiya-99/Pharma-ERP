import React from "react";
import { useAuth } from "../../auth/AuthContext";
import { LogOut, ChevronRight } from "lucide-react";
import BranchSwitcher from "./BranchSwitcher";
import SoftwareSwitcher from "./SoftwareSwitcher";
import { useLocation } from "react-router-dom";

// Map path segments to human-readable breadcrumb names
const segmentLabel = (s: string) =>
  s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const Topbar = () => {
  const { user, company, logoutUser } = useAuth();
  const location = useLocation();

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
    <header className="glass-header sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between px-6">
      {/* Left: Company + Breadcrumb */}
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex min-w-0 items-center gap-1.5 text-sm text-blueMono-800/70">
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={i}>
              {i > 0 && (
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-blueMono-300/60" />
              )}
              <span
                className={`truncate ${
                  crumb.isLast
                    ? "font-semibold text-blueMono-900"
                    : "text-blueMono-800/70"
                }`}
              >
                {crumb.label}
              </span>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Center: Switchers */}
      <div className="mx-4 flex items-center gap-2">
        <BranchSwitcher />
        <SoftwareSwitcher />
      </div>

      {/* Right: User info + Logout */}
      <div className="flex shrink-0 items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blueMono-700 text-xs font-bold text-white shadow-sm shadow-blueMono-900/30">
            {initials}
          </div>
          <div className="hidden text-right sm:block">
            <p className="text-sm font-semibold leading-none text-blueMono-900">
              {user?.name || user?.full_name || "User"}
            </p>
            <p className="mt-0.5 text-[10px] leading-none text-blueMono-700/80">
              {company?.company_name || "Pharma ERP"}
            </p>
          </div>
        </div>
        <div className="mx-1 h-6 w-px bg-white/40" />
        <button
          onClick={logoutUser}
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-blueMono-800 transition-colors duration-150 hover:bg-white/30 hover:text-red-700"
          title="Logout"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  );
};

export default Topbar;
