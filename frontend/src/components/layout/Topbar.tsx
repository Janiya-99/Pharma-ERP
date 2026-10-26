import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../auth/AuthContext";
import {
  LayoutGrid,
  Home,
  Menu,
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
  MessageSquare,
  Headphones,
} from "lucide-react";
import { useLocation, useNavigate, NavLink } from "react-router-dom";
import { toast } from "sonner";
import { useSidebarState } from "./AppLayout";
import { useAiCopilot } from "../../context/AiCopilotContext";
import { getSupportNotifications, SupportNotificationsData } from "../../api/clientSupportApi";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "../ui/tooltip";

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
    route: "/compliance-center/dashboard",
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
  { name: "Product Batches & Expiry", category: "Inventory", path: "/inventory/product-batches", icon: Activity },
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
    softwareModules,
    switchActiveSoftware,
    logoutUser,
  } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { mobileOpen, setMobileOpen, desktopExpanded, setDesktopExpanded } = useSidebarState();
  const { toggleCopilot } = useAiCopilot();

  const permittedModules = useMemo(() => {
    if (user?.user_type === "super_admin") return ALL_MODULES;
    if (!softwareModules || softwareModules.length === 0) return ALL_MODULES;

    return ALL_MODULES.filter((m) => {
      if (m.code === "LOGISTICS") {
        return softwareModules.some(
          (sm: any) => (sm.software_code || sm.code) === "INVENTORY"
        );
      }
      return softwareModules.some((sm: any) => {
        const c = sm.software_code || sm.code;
        return (
          c === m.code ||
          (m.code === "COMPLIANCE_CENTER" && (c === "COMPLIANCE" || c === "COMPLIANCE_CENTER"))
        );
      });
    });
  }, [softwareModules, user?.user_type]);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [branchLoading, setBranchLoading] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [supportNotifs, setSupportNotifs] = useState<SupportNotificationsData>({
    unread_replies: 0,
    latest_replies: [],
  });

  // Poll for support ticket notifications every 10 seconds
  useEffect(() => {
    let isMounted = true;
    const fetchNotifs = async () => {
      try {
        const data = await getSupportNotifications();
        if (isMounted && data) {
          setSupportNotifs(data);
        }
      } catch (e) {
        // silent
      }
    };
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

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
  else if (currentPath.startsWith("/inventory/warehouses")) activeModuleCode = "LOGISTICS";
  else if (currentPath.startsWith("/inventory")) activeModuleCode = "INVENTORY";
  else if (currentPath.startsWith("/invoice-center")) activeModuleCode = "INVOICE_CENTER";
  else if (currentPath.startsWith("/compliance")) activeModuleCode = "COMPLIANCE_CENTER";
  else if (currentPath.startsWith("/control-center")) activeModuleCode = "CONTROL_CENTER";
  else if (activeSoftware?.software_code) {
    activeModuleCode = activeSoftware.software_code;
    if (activeModuleCode === "COMPLIANCE") activeModuleCode = "COMPLIANCE_CENTER";
  }

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

  const handleSwitchModule = (code: string, route: string) => {
    // Navigate immediately to the target module route with zero lag
    navigate(route);
    const targetCode = code === "LOGISTICS" ? "INVENTORY" : code === "COMPLIANCE" ? "COMPLIANCE_CENTER" : code;
    if (switchActiveSoftware) {
      switchActiveSoftware(targetCode).catch((err) => console.error("Error switching active software:", err));
    }
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
        {/* 1. LEFT GROUP: Navigation & Breadcrumbs */}
        <div className="flex min-w-0 items-center gap-3">
          {/* Mobile Navigation Toggle (hidden on desktop) */}
          <button
            onClick={handleToggleSidebar}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors lg:hidden cursor-pointer"
            title="Toggle Navigation Menu"
            aria-label="Toggle Navigation"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Breadcrumb Links */}
          <div className="hidden min-w-0 items-center gap-1.5 text-xs sm:flex">
            <Tooltip delayDuration={150}>
              <TooltipTrigger asChild>
                <NavLink
                  to="/"
                  className="text-slate-400 hover:text-blue-600 transition-colors flex items-center p-1 rounded-md hover:bg-slate-100"
                  aria-label="Home"
                >
                  <Home className="h-3.5 w-3.5" />
                </NavLink>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="rounded-lg bg-slate-900 px-2 py-1 text-[11px] text-white shadow-lg">
                Home Dashboard
              </TooltipContent>
            </Tooltip>
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

        {/* 2. CENTER: Executive Segmented Module Switcher Rail with Modern Tooltips */}
        <div className="hidden lg:flex items-center p-1.5 rounded-xl bg-slate-100/90 border border-slate-200/80 shadow-xs gap-1.5 mx-4 shrink-0">
          {permittedModules.map((m) => {
            const Icon = m.icon;
            const isCurrent = m.code === activeModule.code;
            return (
              <Tooltip key={m.code} delayDuration={80}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => handleSwitchModule(m.code, m.route)}
                    className={`flex items-center justify-center h-9 rounded-lg text-xs transition-all duration-150 cursor-pointer select-none ${
                      isCurrent
                        ? "bg-white text-indigo-700 shadow-xs border border-slate-200/90 font-semibold px-3.5 gap-2"
                        : "w-9 text-slate-500 hover:text-indigo-600 hover:bg-white/80 font-medium"
                    }`}
                    aria-label={m.name}
                  >
                    <Icon
                      className={`h-4 w-4 shrink-0 transition-colors ${
                        isCurrent ? "text-indigo-600" : "text-slate-500 hover:text-indigo-600"
                      }`}
                    />
                    {isCurrent && (
                      <span className="whitespace-nowrap text-xs font-semibold text-slate-800 tracking-tight">
                        {m.name}
                      </span>
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="bottom"
                  sideOffset={8}
                  className="z-50 flex items-center gap-2 whitespace-nowrap rounded-xl border border-slate-800 bg-slate-950/95 px-3.5 py-1.5 text-xs text-white shadow-2xl backdrop-blur-md pointer-events-none select-none"
                >
                  <Icon className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                  <span className="font-bold text-white text-xs">{m.name}</span>
                  <span className="text-slate-500 text-[10px]">•</span>
                  <span className="text-slate-300 text-xs font-normal">{m.desc}</span>
                  {isCurrent ? (
                    <span className="ml-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-300 border border-emerald-500/30">
                      Active
                    </span>
                  ) : (
                    <span className="ml-1 rounded-full bg-indigo-500/20 px-2 py-0.5 text-[9px] font-medium text-indigo-300 border border-indigo-500/30">
                      Click to switch
                    </span>
                  )}
                </TooltipContent>
              </Tooltip>
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
              {permittedModules.map((m) => {
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
          <Tooltip delayDuration={150}>
            <TooltipTrigger asChild>
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
                aria-label="Quick Search (Ctrl + K)"
              >
                <Search className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] text-white shadow-lg">
              Quick Search (Ctrl+K)
            </TooltipContent>
          </Tooltip>

          {/* Notifications Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="relative flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
                title="Notifications & Support Messages"
              >
                <Bell className="h-4 w-4" />
                {supportNotifs.unread_replies > 0 ? (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-emerald-600 px-1 text-[9px] font-extrabold text-white ring-2 ring-white animate-pulse">
                    {supportNotifs.unread_replies}
                  </span>
                ) : (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-88 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl z-50">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
                <span className="text-xs font-bold text-slate-800">Notifications & Support Center</span>
                {supportNotifs.unread_replies > 0 ? (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 animate-pulse">
                    {supportNotifs.unread_replies} Support Reply{supportNotifs.unread_replies > 1 ? "ies" : "y"}
                  </span>
                ) : (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                    Up to date
                  </span>
                )}
              </div>

              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-0.5">
                {/* 1. Support Replies from Engineering/Platform Admin */}
                {supportNotifs.latest_replies && supportNotifs.latest_replies.length > 0 && (
                  <div className="border border-emerald-200 bg-emerald-50/50 rounded-xl p-2 mb-2">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10.5px] font-extrabold text-emerald-800 flex items-center gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Support Ticket Replies</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => navigate("/support/chat")}
                        className="text-[10px] font-bold text-emerald-700 hover:underline cursor-pointer"
                      >
                        Open Chat →
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      {supportNotifs.latest_replies.map((reply, idx) => (
                        <div
                          key={idx}
                          onClick={() => navigate(`/support/chat?ticketId=${reply.ticket_id}`)}
                          className="rounded-lg p-2 bg-white/90 hover:bg-white border border-emerald-100 shadow-2xs transition-all cursor-pointer"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-bold text-slate-900 truncate max-w-[180px]">
                              {reply.subject}
                            </span>
                            <span className="text-[9.5px] text-slate-400 font-mono">
                              {reply.created_at ? new Date(reply.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "New"}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 line-clamp-2 mt-1">
                            <span className="font-semibold text-emerald-700">{reply.sender || "Engineering Support"}: </span>
                            {reply.reply_message}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. System Alerts */}
                <div className="rounded-xl p-2.5 hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-700">Batch Expiry Warning</span>
                    <span className="text-[9px] text-slate-400">10m ago</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">Paracetamol 500mg Batch #BAT-202609-001 expires in 45 days.</p>
                </div>
                <div className="rounded-xl p-2.5 hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-blue-700">GRN Approval Needed</span>
                    <span className="text-[9px] text-slate-400">1h ago</span>
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">GRN-000042 submitted for Biyagama Cold Chain Logistics Hub.</p>
                </div>
              </div>

              {/* Action: Open Modern Support Chat Tool */}
              <div className="pt-2 border-t border-slate-100 mt-2">
                <button
                  type="button"
                  onClick={() => navigate("/support/chat")}
                  className="w-full py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:scale-98 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm shadow-indigo-600/20"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Open Support Ticket Desk</span>
                </button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* AI Copilot & Help */}
          <Tooltip delayDuration={150}>
            <TooltipTrigger asChild>
              <button
                onClick={() => toggleCopilot()}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors cursor-pointer"
                aria-label="AI Copilot & Help"
              >
                <HelpCircle className="h-4 w-4" />
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] text-white shadow-lg">
              Pharma AI Copilot (Ctrl+J)
            </TooltipContent>
          </Tooltip>

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
          <Tooltip delayDuration={150}>
            <TooltipTrigger asChild>
              <button
                onClick={logoutUser}
                className="flex items-center gap-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200/80 px-2.5 py-1.5 text-xs font-semibold shadow-xs hover:shadow-sm active:scale-95 transition-all cursor-pointer"
                aria-label="Sign out of Pharma ERP"
              >
                <LogOut className="h-3.5 w-3.5 text-rose-500" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="rounded-lg bg-slate-900 px-2.5 py-1 text-[11px] text-white shadow-lg">
              Sign out of Pharma ERP
            </TooltipContent>
          </Tooltip>
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
