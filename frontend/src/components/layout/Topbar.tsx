import React, { useState, useEffect } from "react";
import { useAuth } from "../../auth/AuthContext";
import {
  LayoutGrid,
  Home,
  ChevronRight,
  ChevronDown,
  Landmark,
  Package,
  FileText,
  ShieldCheck,
  Settings,
  MapPin,
  Building2,
  Search,
  Bell,
  HelpCircle,
  LogOut,
  Check,
  User,
  Shield,
  X,
  Loader2,
  FileSpreadsheet,
  Users as UsersIcon,
  Activity,
  Truck,
  Globe,
} from "lucide-react";
import { useLocation, useNavigate, NavLink } from "react-router-dom";
import { toast } from "sonner";
import { useSidebarState } from "./AppLayout";
import { useAiCopilot } from "../../context/AiCopilotContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
} from "../ui/dialog";

// Map path segments to human-readable breadcrumb names
const formatSegment = (s: string) => {
  const lower = s.toLowerCase();
  if (lower === "grn") return "GRN";
  if (lower === "po") return "PO";
  if (lower === "nmra") return "NMRA";
  if (lower === "qa") return "QA";
  if (lower === "gl") return "GL";
  if (lower === "vat") return "VAT";
  return s
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const ALL_MODULES = [
  {
    code: "CONTROL_CENTER",
    name: "Control Center",
    icon: Settings,
    route: "/control-center/dashboard",
    desc: "Administration & System Configuration",
  },
  {
    code: "FINANCE",
    name: "Finance",
    icon: Landmark,
    route: "/finance/dashboard",
    desc: "GL, Banking, Vouchers & Asset Accounting",
  },
  {
    code: "INVENTORY",
    name: "Inventory",
    icon: Package,
    route: "/inventory/dashboard",
    desc: "Warehouse, GRN & Strict Batch Management",
  },
  {
    code: "INVOICE_CENTER",
    name: "Invoice Center",
    icon: FileText,
    route: "/invoice-center/dashboard",
    desc: "Sales Orders, Invoices & Customer Accounts",
  },
  {
    code: "COMPLIANCE_CENTER",
    name: "Compliance Center",
    icon: ShieldCheck,
    route: "/compliance/dashboard",
    desc: "NMRA Regulations, QA Pass Rates & Audits",
  },
  {
    code: "LOGISTICS",
    name: "Logistics Hub",
    icon: MapPin,
    route: "/inventory/warehouses",
    desc: "Cold Chain Storage & Regional Facilities",
  },
];

const SEARCH_ITEMS = [
  { name: "Compliance Center Dashboard", category: "Compliance", path: "/compliance/dashboard", icon: ShieldCheck },
  { name: "Finance Dashboard", category: "Finance", path: "/finance/dashboard", icon: Landmark },
  { name: "General Ledger", category: "Finance", path: "/finance/general-ledger", icon: FileSpreadsheet },
  { name: "Bank Accounts", category: "Finance", path: "/finance/banking/bank-accounts", icon: Landmark },
  { name: "Inventory Dashboard", category: "Inventory", path: "/inventory/dashboard", icon: Package },
  { name: "Goods Receipt Notes (GRN)", category: "Inventory", path: "/inventory/grn", icon: Truck },
  { name: "Product Batches & Expiry", category: "Inventory", path: "/inventory/batches", icon: Activity },
  { name: "Sales Invoices", category: "Invoice Center", path: "/invoice-center/sales-invoices", icon: FileText },
  { name: "Sales Orders", category: "Invoice Center", path: "/invoice-center/sales-orders", icon: FileText },
  { name: "Customers Directory", category: "Invoice Center", path: "/invoice-center/customers", icon: UsersIcon },
  { name: "System Settings", category: "Control Center", path: "/control-center/settings", icon: Settings },
  { name: "User Management", category: "Control Center", path: "/control-center/users", icon: UsersIcon },
];

const Topbar = () => {
  const {
    user,
    company,
    branches,
    activeBranch,
    switchActiveBranch,
    activeSoftware,
    switchActiveSoftware,
    logoutUser,
  } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { mobileOpen, setMobileOpen, desktopExpanded, setDesktopExpanded } = useSidebarState();
  const { toggleCopilot } = useAiCopilot();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [branchLoading, setBranchLoading] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Keyboard shortcut Ctrl+K / Cmd+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Determine current active module
  const currentPath = location.pathname;
  let activeModuleCode = "CONTROL_CENTER";
  if (currentPath.startsWith("/finance")) activeModuleCode = "FINANCE";
  else if (currentPath.startsWith("/inventory")) activeModuleCode = "INVENTORY";
  else if (currentPath.startsWith("/invoice-center")) activeModuleCode = "INVOICE_CENTER";
  else if (currentPath.startsWith("/compliance")) activeModuleCode = "COMPLIANCE_CENTER";
  else if (currentPath.startsWith("/control-center")) activeModuleCode = "CONTROL_CENTER";
  else if (activeSoftware?.software_code) activeModuleCode = activeSoftware.software_code;

  const activeModule = ALL_MODULES.find((m) => m.code === activeModuleCode) || ALL_MODULES[0];
  const ActiveIcon = activeModule.icon;

  // Build breadcrumbs dynamically from path
  const segments = location.pathname.split("/").filter(Boolean);
  const breadcrumbs = segments.map((seg, idx) => {
    const path = "/" + segments.slice(0, idx + 1).join("/");
    return {
      label: formatSegment(seg),
      path,
      isLast: idx === segments.length - 1,
    };
  });

  const handleToggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setMobileOpen(!mobileOpen);
    } else {
      setDesktopExpanded(!desktopExpanded);
    }
  };

  const handleSwitchModule = async (code: string, route: string) => {
    if (code !== "LOGISTICS" && switchActiveSoftware) {
      await switchActiveSoftware(code);
    }
    navigate(route);
  };

  const [isAllBranches, setIsAllBranches] = useState<boolean>(() => {
    return localStorage.getItem("erp_all_branches") === "true";
  });

  const handleSwitchBranch = async (branchId: any) => {
    try {
      setBranchLoading(true);
      if (branchId === "all") {
        setIsAllBranches(true);
        localStorage.setItem("erp_all_branches", "true");
        toast.success("Switched to All Branches (Consolidated View)");
        return;
      }
      setIsAllBranches(false);
      localStorage.removeItem("erp_all_branches");
      await switchActiveBranch(branchId);
      toast.success("Branch switched successfully");
    } finally {
      setBranchLoading(false);
    }
  };

  const currentBranchName = isAllBranches
    ? "All Branches"
    : activeBranch?.branch_name ||
      activeBranch?.name ||
      activeBranch?.branch?.branch_name ||
      "Colombo Central Hub";

  const activeBranchId = isAllBranches
    ? "all"
    : activeBranch?.id ||
      activeBranch?.branch_id ||
      activeBranch?.branch?.id;

  const initials = (user?.name || user?.full_name || "KS")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const filteredSearchResults = SEARCH_ITEMS.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <header className="sticky top-0 z-40 w-full h-16 border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between gap-2 md:gap-4 transition-all">
        {/* 1. LEFT GROUP: App Launcher & Breadcrumbs */}
        <div className="flex min-w-0 items-center gap-3">
          {/* App Launcher Button */}
          <button
            onClick={handleToggleSidebar}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-600 to-indigo-500 text-white shadow-xs hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            title="Toggle Navigation Menu"
            aria-label="Toggle Navigation"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>

          {/* Breadcrumb Links */}
          <div className="hidden min-w-0 items-center gap-1.5 text-xs sm:flex">
            <NavLink
              to="/"
              className="text-slate-400 hover:text-blue-600 transition-colors flex items-center"
              title="Home"
            >
              <Home className="h-3.5 w-3.5" />
            </NavLink>
            {breadcrumbs.map((crumb, i) => (
              <React.Fragment key={i}>
                <span className="text-slate-300 font-semibold select-none">&gt;</span>
                {crumb.isLast ? (
                  <span className="font-semibold text-slate-800 truncate max-w-[150px]">
                    {crumb.label}
                  </span>
                ) : (
                  <NavLink
                    to={crumb.path}
                    className="font-medium text-slate-400 hover:text-slate-600 truncate max-w-[140px] transition-colors"
                  >
                    {crumb.label}
                  </NavLink>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* 2. CENTER: Hover-Expanding Module Switcher Rail */}
        <div className="hidden lg:flex items-center p-1 rounded-lg bg-slate-100/80 border border-slate-200/70 gap-0.5 shrink-0">
          {ALL_MODULES.map((m) => {
            const Icon = m.icon;
            const isCurrent = m.code === activeModule.code;
            return (
              <div key={m.code} className="relative group">
                <button
                  onClick={() => handleSwitchModule(m.code, m.route)}
                  className={`flex items-center h-8 px-2.5 rounded-md text-xs font-medium transition-all duration-300 cursor-pointer ${
                    isCurrent
                      ? "bg-white text-indigo-700 shadow-xs border border-slate-200/90 font-semibold"
                      : "text-slate-600 hover:text-indigo-600 hover:bg-white/80"
                  }`}
                  aria-label={m.name}
                >
                  <Icon className={`h-4 w-4 shrink-0 transition-transform duration-200 ${isCurrent ? "text-indigo-600" : "text-slate-500 group-hover:text-indigo-600 group-hover:scale-110"}`} />
                  <span
                    className={`whitespace-nowrap transition-all duration-300 ease-out overflow-hidden ${
                      isCurrent
                        ? "max-w-[130px] ml-1.5 opacity-100"
                        : "max-w-0 opacity-0 group-hover:max-w-[130px] group-hover:ml-1.5 group-hover:opacity-100"
                    }`}
                  >
                    {m.name}
                  </span>
                </button>

                {/* Hover Descriptive Badge / Tooltip explaining what the module is */}
                <div className="pointer-events-none absolute left-1/2 -bottom-9 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900/95 px-2.5 py-1 text-[11px] font-medium text-white shadow-xl opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 z-50 flex items-center gap-1.5">
                  <span className="font-semibold text-white">{m.name}</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-slate-300 text-[10px]">{m.desc}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile / Tablet Compact Module Dropdown */}
        <div className="flex lg:hidden items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-100 active:scale-95 transition-all cursor-pointer">
                <ActiveIcon className="h-3.5 w-3.5 text-indigo-600" />
                <span className="max-w-[100px] truncate">{activeModule.name}</span>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-50">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Switch Module
              </div>
              {ALL_MODULES.map((m) => {
                const Icon = m.icon;
                const isCurrent = m.code === activeModule.code;
                return (
                  <DropdownMenuItem
                    key={m.code}
                    onClick={() => handleSwitchModule(m.code, m.route)}
                    className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium cursor-pointer transition-colors ${
                      isCurrent ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${isCurrent ? "text-indigo-600" : "text-slate-400"}`} />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="truncate">{m.name}</span>
                      <span className="text-[10px] text-slate-400 truncate">{m.desc}</span>
                    </div>
                    {isCurrent && <Check className="h-3.5 w-3.5 text-indigo-600 shrink-0" />}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* 3. CENTER-RIGHT: Branch / Logistics Hub Pill */}
        <div className="flex items-center gap-2 shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-slate-50/70 hover:bg-slate-100/80 hover:border-slate-300 px-2.5 py-1.5 text-xs shadow-2xs active:scale-95 transition-all cursor-pointer shrink-0">
                {isAllBranches ? (
                  <Globe className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                ) : (
                  <Building2 className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                )}
                <span className="text-xs font-semibold text-slate-700 max-w-[140px] sm:max-w-[160px] truncate">
                  {branchLoading ? "Switching..." : currentBranchName}
                </span>
                {branchLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin text-slate-400 shrink-0" />
                ) : (
                  <ChevronDown className="h-3 w-3 text-slate-400 shrink-0" />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-50">
              <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Active Logistics Branch
              </div>
              {branches && branches.length > 1 && (
                <>
                  <DropdownMenuItem
                    onClick={() => handleSwitchBranch("all")}
                    className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium cursor-pointer transition-colors ${
                      isAllBranches ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Globe className={`h-4 w-4 shrink-0 ${isAllBranches ? "text-indigo-600" : "text-slate-400"}`} />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="truncate">All Branches (Consolidated)</span>
                      <span className="text-[10px] text-slate-400">View consolidated enterprise data</span>
                    </div>
                    {isAllBranches && <Check className="h-3.5 w-3.5 text-indigo-600 shrink-0" />}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-100 my-1" />
                </>
              )}
              {branches && branches.length > 0 ? (
                branches.map((b: any) => {
                  const id = b.id || b.branch_id;
                  const name = b.branch_name || b.branch?.branch_name || "";
                  const code = b.branch_code || "";
                  const isCurrent = !isAllBranches && String(id) === String(activeBranchId);
                  return (
                    <DropdownMenuItem
                      key={id}
                      onClick={() => handleSwitchBranch(id)}
                      className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium cursor-pointer transition-colors ${
                        isCurrent ? "bg-blue-50 text-blue-700 font-semibold" : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <Building2 className={`h-4 w-4 shrink-0 ${isCurrent ? "text-blue-600" : "text-slate-400"}`} />
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="truncate">{name}</span>
                        {code && <span className="text-[10px] text-slate-400">{code}</span>}
                      </div>
                      {isCurrent && <Check className="h-3.5 w-3.5 text-blue-600 shrink-0" />}
                    </DropdownMenuItem>
                  );
                })
              ) : (
                <div className="px-3 py-2 text-xs text-slate-400">
                  {currentBranchName} (Active)
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* 4. RIGHT GROUP: Divider, Actions, User Profile & Logout */}
        <div className="flex items-center gap-2 md:gap-2.5 shrink-0">
          <div className="h-5 w-px bg-slate-200/80 mx-0.5 hidden lg:block" />

          {/* Quick Search */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
            title="Quick Search (Ctrl + K)"
          >
            <Search className="h-4 w-4" />
          </button>

          {/* Notifications Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="relative flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50">
              <div className="flex items-center justify-between border-b border-slate-100 px-2 py-1.5">
                <span className="text-xs font-bold text-slate-800">Notifications & Alerts</span>
                <span className="rounded-md bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700">3 New</span>
              </div>
              <div className="space-y-1 py-1 max-h-64 overflow-y-auto">
                <div className="rounded-lg p-2 hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-amber-700">Batch Expiry Warning</span>
                    <span className="text-[9px] text-slate-400">10m ago</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">Paracetamol 500mg Batch #BAT-202609-001 expires in 45 days.</p>
                </div>
                <div className="rounded-lg p-2 hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-blue-700">GRN Approval Needed</span>
                    <span className="text-[9px] text-slate-400">1h ago</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">GRN-000042 submitted for Biyagama Cold Chain Logistics Hub.</p>
                </div>
                <div className="rounded-lg p-2 hover:bg-slate-50 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-emerald-700">NMRA Compliance Pass</span>
                    <span className="text-[9px] text-slate-400">3h ago</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">Annual inspection verification passed with 98.4% QA score.</p>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* AI Copilot & Help */}
          <button
            onClick={() => toggleCopilot()}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
            title="AI Copilot & Help"
          >
            <HelpCircle className="h-4 w-4" />
          </button>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 cursor-pointer group select-none">
                {/* User Avatar with Green Online Status */}
                <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-lg overflow-hidden border border-slate-200 ring-1 ring-slate-100 group-hover:ring-blue-400 transition-all bg-indigo-600 text-white font-bold text-xs">
                  {(user?.profile_image_url || user?.avatar_url || user?.image) && !imgError ? (
                    <img
                      src={user?.profile_image_url || user?.avatar_url || user?.image}
                      alt={user?.name || "User"}
                      className="h-full w-full object-cover"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <span>{initials}</span>
                  )}
                  <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>

                {/* User Name & Company */}
                <div className="hidden sm:flex flex-col text-left">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-slate-800 truncate max-w-[120px] group-hover:text-blue-600 transition-colors">
                      {user?.name || user?.full_name || "Dr. Kalinga Silva"}
                    </span>
                    <ChevronDown className="h-3 w-3 text-slate-400 group-hover:text-blue-600 shrink-0" />
                  </div>
                  <span className="text-[10px] text-slate-400 truncate max-w-[130px] leading-tight block">
                    {company?.company_name || user?.company_name || "Ceylon MedEx Pharmaceuticals"}
                  </span>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl z-50">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-800">{user?.name || user?.full_name || "Dr. Kalinga Silva"}</p>
                <p className="text-[10px] text-slate-400 truncate">{user?.email || "user@pharma.lk"}</p>
                <div className="mt-1 inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold text-emerald-700 border border-emerald-100">
                  Active • {user?.role || "Administrator"}
                </div>
              </div>
              <DropdownMenuItem onClick={() => navigate("/control-center/profile")} className="cursor-pointer">
                <User className="mr-2 h-3.5 w-3.5 text-slate-400" />
                <span>My Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/control-center/security-settings")} className="cursor-pointer">
                <Shield className="mr-2 h-3.5 w-3.5 text-slate-400" />
                <span>Security Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logoutUser} className="text-rose-600 cursor-pointer">
                <LogOut className="mr-2 h-3.5 w-3.5" />
                <span>Log Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Logout Button */}
          <button
            onClick={logoutUser}
            className="flex items-center gap-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200/80 px-2.5 py-1.5 text-xs font-semibold shadow-xs hover:shadow-sm active:scale-95 transition-all cursor-pointer"
            title="Sign out of Pharma ERP"
          >
            <LogOut className="h-3.5 w-3.5 text-rose-500" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Quick Search Dialog (Ctrl+K) */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden rounded-2xl border border-slate-200 shadow-2xl bg-white">
          <div className="flex items-center border-b border-slate-100 px-3 py-3">
            <Search className="h-4 w-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search pages, products, batches, or invoices..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs outline-none bg-transparent placeholder:text-slate-400 text-slate-800"
              autoFocus
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="text-slate-400 hover:text-slate-600">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto p-2 space-y-1">
            {filteredSearchResults.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  navigate(item.path);
                  setIsSearchOpen(false);
                  setSearchQuery("");
                }}
                className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs text-left hover:bg-slate-100 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <item.icon className="h-3.5 w-3.5 text-slate-400" />
                  <span className="font-medium text-slate-700">{item.name}</span>
                </div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">{item.category}</span>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Topbar;
