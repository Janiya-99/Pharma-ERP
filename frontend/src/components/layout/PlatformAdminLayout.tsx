import React, { useState } from "react";
import { NavLink, useLocation, Outlet, useNavigate } from "react-router-dom";
import { usePlatformAuth } from "../../auth/PlatformAuthContext";
import {
  LayoutDashboard,
  Building2,
  Shield,
  Settings,
  BookOpen,
  Package,
  ChevronRight,
  LogOut,
  User,
  ClipboardList,
  Users,
  Receipt,
  Mail,
  ShieldAlert,
} from "lucide-react";

type MenuItem = {
  name: string;
  path?: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: {
    name: string;
    path: string;
  }[];
};

const PlatformAdminLayout = () => {
  const { user, logoutUser } = usePlatformAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const menus: MenuItem[] = [
    { name: "Dashboard", path: "/platform-admin/dashboard", icon: LayoutDashboard },
    {
      name: "Companies",
      icon: Building2,
      children: [
        { name: "All Companies", path: "/platform-admin/companies" },
        { name: "Create Company", path: "/platform-admin/companies/create" },
        { name: "Company Databases", path: "/platform-admin/company-databases" },
        { name: "Suspended Companies", path: "/platform-admin/companies?status=suspended" },
      ],
    },
    {
      name: "Subscriptions",
      icon: ClipboardList,
      children: [
        { name: "Plans Catalog", path: "/platform-admin/subscriptions/plans" },
        { name: "Company Licenses", path: "/platform-admin/subscriptions/licenses" },
      ],
    },
    {
      name: "Billing & Invoices",
      icon: Receipt,
      children: [
        { name: "Invoices Log", path: "/platform-admin/billing/invoices" },
        { name: "Payments Received", path: "/platform-admin/billing/payments" },
      ],
    },
    {
      name: "Software catalog",
      icon: Package,
      children: [
        { name: "ERP Modules", path: "/platform-admin/modules" },
        { name: "Features", path: "/platform-admin/features" },
        { name: "Versions", path: "/platform-admin/versions" },
      ],
    },
    {
      name: "Platform Access",
      icon: ShieldAlert,
      children: [
        { name: "Admin Users", path: "/platform-admin/users" },
        { name: "Roles Matrix", path: "/platform-admin/roles" },
        { name: "Permissions", path: "/platform-admin/permissions" },
      ],
    },
    {
      name: "Support Desk",
      icon: BookOpen,
      children: [
        { name: "Tickets", path: "/platform-admin/support/tickets" },
      ],
    },
    {
      name: "Global Settings",
      icon: Settings,
      children: [
        { name: "Owner Profile", path: "/platform-admin/settings/company-profile" },
        { name: "Branding White-label", path: "/platform-admin/settings/branding" },
        { name: "SMTP Email Settings", path: "/platform-admin/settings/email" },
        { name: "Payment Gateways", path: "/platform-admin/settings/payment-gateway" },
        { name: "Backup Settings", path: "/platform-admin/settings/backups" },
      ],
    },
    {
      name: "Logs & Audit",
      icon: Shield,
      children: [
        { name: "Login Logs", path: "/platform-admin/login-logs" },
        { name: "Audit Trails", path: "/platform-admin/audit-logs" },
      ],
    },
  ];

  const handleLogout = () => {
    logoutUser();
    navigate("/platform-admin/login");
  };

  const toggleAccordion = (name: string) => {
    if (openAccordion === name) {
      setOpenAccordion(null);
    } else {
      setOpenAccordion(name);
    }
  };

  return (
    <div className="flex h-screen bg-slate-900 font-sans text-slate-100 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div className="flex flex-col overflow-y-auto flex-1">
          <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-800 bg-slate-950">
            <Shield className="h-6 w-6 text-indigo-400" />
            <span className="font-bold text-lg text-white tracking-wide">Platform Owner</span>
          </div>

          <nav className="p-4 space-y-1">
            {menus.map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              const isAccordionOpen = openAccordion === item.name;

              if (!hasChildren) {
                return (
                  <NavLink
                    key={item.name}
                    to={item.path || "#"}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? "bg-indigo-600 text-white"
                          : "text-slate-400 hover:bg-slate-900 hover:text-white"
                      }`
                    }
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              }

              return (
                <div key={item.name} className="space-y-1">
                  <button
                    onClick={() => toggleAccordion(item.name)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-900 hover:text-white transition-all`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 shrink-0" />
                      <span>{item.name}</span>
                    </div>
                    <ChevronRight
                      className={`h-4 w-4 transition-transform text-slate-500 ${
                        isAccordionOpen ? "rotate-90" : ""
                      }`}
                    />
                  </button>

                  {isAccordionOpen && (
                    <div className="pl-9 pr-2 py-1 space-y-1 bg-slate-950/50 rounded-lg">
                      {item.children?.map((child) => (
                        <NavLink
                          key={child.name}
                          to={child.path}
                          end
                          className={({ isActive }) =>
                            `block px-3 py-2 rounded-md text-xs font-medium transition-all ${
                              isActive
                                ? "text-indigo-400 bg-slate-900/50"
                                : "text-slate-500 hover:text-slate-300 hover:bg-slate-900/30"
                            }`
                          }
                        >
                          {child.name}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* User profile footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-9 w-9 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold shrink-0">
              {user?.username?.charAt(0).toUpperCase() || "A"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.username || "Admin"}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email || "admin@platform.com"}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-900 rounded-lg transition-all"
            title="Log Out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-col flex-grow min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 border-b border-slate-800 bg-slate-950 px-6 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-base font-semibold text-white tracking-wide">
              Platform Admin Control Portal
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 rounded-full border border-slate-800 text-xs text-indigo-400 font-semibold uppercase tracking-wider">
              <Shield className="h-3 w-3" />
              <span>Owner Mode</span>
            </div>
          </div>
        </header>

        {/* Outlet Main Pane */}
        <main className="flex-grow overflow-y-auto bg-slate-900 p-6 flex flex-col justify-between">
          <div className="flex-grow">
            <Outlet />
          </div>
          <footer className="mt-8 pt-4 border-t border-slate-800 text-xs text-slate-500 flex justify-between items-center bg-slate-900">
            <span>© {new Date().getFullYear()} Pharma ERP. Platform Owner Portal.</span>
            <span>Developed by <span className="font-semibold text-indigo-400">PIXANDCO</span></span>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default PlatformAdminLayout;
