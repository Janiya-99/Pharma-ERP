import React from "react";
import { useAuth } from "../../auth/AuthContext";
import { LogOut, ChevronRight } from "lucide-react";
import BranchSwitcher from "./BranchSwitcher";
import SoftwareSwitcher from "./SoftwareSwitcher";
import { useLocation } from "react-router-dom";

// Map path segments to human-readable breadcrumb names
const segmentLabel = (s: string) =>
  s
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

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
    <header className="flex items-center justify-between px-6 h-14 glass-header shrink-0 z-10 sticky top-0">
      {/* Left: Company + Breadcrumb */}
      <div className="flex items-center gap-4 min-w-0">
        <div className="flex items-center gap-1.5 text-sm text-blueMono-800/70 min-w-0">
          {breadcrumbs.map((crumb, i) => (
            <React.Fragment key={i}>
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-blueMono-300/60 shrink-0" />}
              <span
                className={`truncate ${
                  crumb.isLast
                    ? "text-blueMono-900 font-semibold"
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
      <div className="flex items-center gap-2 mx-4">
        <BranchSwitcher />
        <SoftwareSwitcher />
      </div>

      {/* Right: User info + Logout */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blueMono-700 text-white text-xs font-bold shadow-sm shadow-blueMono-900/30">
            {initials}
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-blueMono-900 leading-none">
              {user?.name || user?.full_name || "User"}
            </p>
            <p className="text-[10px] text-blueMono-700/80 mt-0.5 leading-none">
              {company?.company_name || "Pharma ERP"}
            </p>
          </div>
        </div>
        <div className="w-px h-6 bg-white/40 mx-1" />
        <button
          onClick={logoutUser}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-blueMono-800 hover:text-red-700 hover:bg-white/30 rounded-lg transition-colors duration-150"
          title="Logout"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Sign out</span>
        </button>
      </div>
    </header>
  );
};

export default Topbar;
