import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import PermissionGuard from "../../auth/PermissionGuard";
import {
  LayoutDashboard, Building, MapPin, Shield,
  FileCheck, Settings, BookOpen, Archive,
  Package, Layers, Tags, Target, Beaker, Factory,
  Truck, Box, GitMerge, ListChecks, ChevronRight, Pin, PinOff, LogOut, User,
  Landmark, BarChart3, Building2
} from "lucide-react";
import { MdLocalPharmacy } from "react-icons/md";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

type MenuItem = {
  name: string;
  path?: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
  children?: {
    name: string;
    path: string;
    permission?: string;
  }[];
};

const Sidebar = () => {
  const { activeSoftware, user, activeBranch } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const effectiveExpanded = isExpanded || isPinned;
  const location = useLocation();

  const controlCenterMenus: MenuItem[] = [
    { name: "Dashboard", path: "/control-center/dashboard", icon: LayoutDashboard },
    {
      name: "Organization Setup",
      icon: Building,
      children: [
        { name: "Company", path: "/control-center/company", permission: "control.company.view" },
        { name: "Branches", path: "/control-center/branches", permission: "control.branch.view" },
        { name: "Departments", path: "/control-center/departments", permission: "control.department.view" },
        { name: "Designations", path: "/control-center/designations", permission: "control.designation.view" },
      ],
    },
    {
      name: "User & Access Center",
      icon: Shield,
      children: [
        { name: "Users", path: "/control-center/users", permission: "control.user.view" },
        { name: "Roles & Permissions", path: "/control-center/roles-permissions", permission: "control.role.view" },
        { name: "User Access", path: "/control-center/user-access", permission: "control.access_matrix.view" },
      ],
    },
    {
      name: "System Setup",
      icon: Settings,
      children: [
        { name: "Software Modules", path: "/control-center/software-modules", permission: "control.permission.view" },
        { name: "Settings", path: "/control-center/settings" },
      ],
    },
    {
      name: "Audit & Security",
      icon: FileCheck,
      children: [
        { name: "Audit Logs", path: "/control-center/audit-logs", permission: "control.audit.view" },
        { name: "Login Logs", path: "/control-center/login-logs", permission: "control.login_logs.view" },
      ],
    },
  ];

  const financeMenus: MenuItem[] = [
    { name: "Dashboard", path: "/finance/dashboard", icon: LayoutDashboard },
    {
      name: "Accounting Setup",
      icon: Settings,
      children: [
        { name: "Chart of Accounts", path: "/finance/setup/chart-of-accounts" },
        { name: "Account Groups", path: "/finance/setup/account-groups" },
        { name: "Opening Balances", path: "/finance/setup/opening-balances" },
        { name: "Financial Year", path: "/finance/setup/financial-year" },
        { name: "Tax Settings", path: "/finance/setup/tax-settings" },
      ],
    },
    {
      name: "General Ledger",
      icon: BookOpen,
      children: [
        { name: "Journal Entry", path: "/finance/general-ledger/journal-entry" },
        { name: "Journal Register", path: "/finance/general-ledger/journal-register" },
        { name: "Account Ledger", path: "/finance/general-ledger/account-ledger" },
        { name: "Trial Balance", path: "/finance/general-ledger/trial-balance" },
        { name: "General Ledger Report", path: "/finance/general-ledger/general-ledger-report" },
      ],
    },
    {
      name: "Banking & Cash",
      icon: Landmark,
      children: [
        { name: "Bank Accounts", path: "/finance/banking/bank-accounts" },
        { name: "Cash Accounts", path: "/finance/banking/cash-accounts" },
        { name: "Bank Book", path: "/finance/banking/bank-book" },
        { name: "Cash Book", path: "/finance/banking/cash-book" },
        { name: "Payment Vouchers", path: "/finance/banking/payment-vouchers" },
        { name: "Receipt Vouchers", path: "/finance/banking/receipt-vouchers" },
        { name: "Bank Reconciliation", path: "/finance/banking/bank-reconciliation" },
      ],
    },
    {
      name: "Reports",
      icon: BarChart3,
      children: [
        { name: "Reports Dashboard", path: "/finance/reports/reports-dashboard" },
        { name: "Profit and Loss", path: "/finance/reports/profit-and-loss" },
        { name: "Balance Sheet", path: "/finance/reports/balance-sheet" },
        { name: "Trial Balance", path: "/finance/reports/trial-balance" },
        { name: "Day Book", path: "/finance/reports/day-book" },
        { name: "Payment Register", path: "/finance/reports/payment-register" },
        { name: "Receipt Register", path: "/finance/reports/receipt-register" },
      ],
    },
    {
      name: "Fixed Assets",
      icon: Building2,
      children: [
        { name: "Fixed Asset Categories", path: "/finance/fixed-assets/categories" },
        { name: "Fixed Assets", path: "/finance/fixed-assets/assets" },
        { name: "Depreciation Runs", path: "/finance/fixed-assets/depreciation-runs" },
        { name: "Asset Disposals", path: "/finance/fixed-assets/asset-disposals" },
      ],
    },
  ];

  const inventoryMenus: MenuItem[] = [
    { name: "Dashboard", path: "/inventory/dashboard", icon: LayoutDashboard, permission: "inventory.dashboard.view" },
    { name: "Warehouses", path: "/inventory/warehouses", icon: Building, permission: "inventory.warehouse.view" },
    { name: "Warehouse Locations", path: "/inventory/warehouse-locations", icon: MapPin, permission: "inventory.warehouse.view" },
    { name: "Product Categories", path: "/inventory/product-categories", icon: GitMerge, permission: "inventory.product_category.view" },
    { name: "Product Units", path: "/inventory/product-units", icon: Target, permission: "inventory.product_master.view" },
    { name: "Dosage Forms", path: "/inventory/dosage-forms", icon: Beaker, permission: "inventory.product_master.view" },
    { name: "Generic Names", path: "/inventory/generic-names", icon: Tags, permission: "inventory.product_master.view" },
    { name: "Manufacturers", path: "/inventory/manufacturers", icon: Factory, permission: "inventory.product_master.view" },
    { name: "Suppliers", path: "/inventory/suppliers", icon: Truck, permission: "inventory.product_master.view" },
    { name: "Products", path: "/inventory/products", icon: Package, permission: "inventory.product_master.view" },
    { name: "Product Batches", path: "/inventory/product-batches", icon: Layers, permission: "inventory.product_batch.view" },
    { name: "Opening Stock", path: "/inventory/opening-stock", icon: FileCheck, permission: "inventory.opening_stock.view" },
    { name: "GRN / Goods Receipt", path: "/inventory/grns", icon: FileCheck, permission: "inventory.grn.view" },
    { name: "Purchase Returns", path: "/inventory/purchase-returns", icon: Archive, permission: "inventory.purchase_return.view" },
    { name: "Sales Returns", path: "/inventory/sales-returns", icon: Archive, permission: "inventory.sales_return.view" },
    { name: "Stock Transfers", path: "/inventory/stock-transfers", icon: Truck, permission: "inventory.stock_transfer.view" },
    { name: "Stock Adjustments", path: "/inventory/stock-adjustments", icon: GitMerge, permission: "inventory.stock_adjustment.view" },
    { name: "Stock Balances", path: "/inventory/stock-balances", icon: Box, permission: "inventory.stock_balance.view" },
    { name: "Stock Ledger", path: "/inventory/stock-ledger", icon: ListChecks, permission: "inventory.stock_ledger.view" },
  ];

  const getMenus = (): MenuItem[] => {
    const code = activeSoftware?.software_code;
    if (code === "CONTROL_CENTER") return controlCenterMenus;
    if (code === "FINANCE") return financeMenus;
    if (code === "INVENTORY") return inventoryMenus;
    return [{ name: "Dashboard", path: `/${code?.toLowerCase().replace("_", "-")}/dashboard`, icon: LayoutDashboard }];
  };

  const menus = getMenus();
  
  React.useEffect(() => {
    const match = menus.find(
      (m) => m.children && m.children.some((c) => location.pathname.includes(c.path))
    );
    if (match) {
      setOpenAccordion(match.name);
    }
  }, [location.pathname, activeSoftware]);

  const initials = (user?.name || user?.full_name || "U")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const renderMenu = (menu: MenuItem) => {
    const hasChildren = !!menu.children && menu.children.length > 0;
    const isAccordionOpen = openAccordion === menu.name;
    const isActiveParent = hasChildren 
      ? menu.children!.some((c) => location.pathname.includes(c.path))
      : location.pathname.includes(menu.path || "");

    if (!hasChildren) {
      return (
        <PermissionGuard key={menu.path} permission={menu.permission}>
          <NavLink
            to={menu.path || "#"}
            title={!effectiveExpanded ? menu.name : undefined}
            className={({ isActive }) =>
              `relative flex items-center gap-3 rounded-xl transition-all duration-150 group ${
                effectiveExpanded ? "px-3.5 py-2.5" : "justify-center p-2.5"
              } ${
                isActive
                  ? "bg-blueMono-200/50 text-blueMono-900 font-semibold shadow-sm"
                  : "text-blueMono-800/80 hover:bg-white/30 hover:text-blueMono-900"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <menu.icon
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    isActive ? "text-blueMono-800" : "text-blueMono-700/80 group-hover:text-blueMono-900"
                  }`}
                />
                {effectiveExpanded && (
                  <span className={`text-[13px] font-medium truncate transition-colors ${
                    isActive ? "text-blueMono-900" : "text-blueMono-900 group-hover:text-blueMono-900"
                  }`}>
                    {menu.name}
                  </span>
                )}
                {!effectiveExpanded && isActive && (
                  <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-blueMono-700" />
                )}
              </>
            )}
          </NavLink>
        </PermissionGuard>
      );
    }

    // Accordion group
    return (
      <div key={menu.name} className="flex flex-col gap-0.5">
        <button
          onClick={() => {
            if (!effectiveExpanded) setIsExpanded(true);
            setOpenAccordion(isAccordionOpen ? null : menu.name);
          }}
          className={`w-full relative flex items-center gap-3 rounded-xl transition-all duration-150 group ${
            effectiveExpanded ? "px-3.5 py-2.5" : "justify-center p-2.5"
          } ${
            isActiveParent
              ? "text-blueMono-900 font-semibold bg-blueMono-200/50 shadow-sm"
              : "text-blueMono-800/80 hover:bg-white/30 hover:text-blueMono-900"
          }`}
        >
          <menu.icon
            className={`h-4 w-4 shrink-0 transition-colors ${
              isActiveParent ? "text-blueMono-800" : "text-blueMono-700/80 group-hover:text-blueMono-900"
            }`}
          />
          {effectiveExpanded && (
            <>
              <span className="text-[13px] font-medium truncate flex-1 text-left">
                {menu.name}
              </span>
              <ChevronRight
                className={`h-3.5 w-3.5 text-blueMono-700/80 transition-transform duration-200 ${
                  isAccordionOpen ? "rotate-90 text-blueMono-900" : ""
                }`}
              />
            </>
          )}
        </button>
        {effectiveExpanded && isAccordionOpen && (
          <div className="pl-6 pr-1.5 mt-0.5 space-y-0.5 border-l border-white/30 ml-5.5 flex flex-col gap-0.5">
            {menu.children!.map((child) => (
              <PermissionGuard key={child.path} permission={child.permission}>
                <NavLink
                  to={child.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150 ${
                      isActive
                        ? "bg-white/40 text-blueMono-900 font-semibold shadow-sm"
                        : "text-blueMono-800/80 hover:bg-white/30 hover:text-blueMono-900"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-blueMono-700" : "bg-blueMono-300/50"}`} />
                      <span className="truncate">{child.name}</span>
                    </>
                  )}
                </NavLink>
              </PermissionGuard>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`relative z-30 h-full shrink-0 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        effectiveExpanded ? "w-60" : "w-[68px]"
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => {
        if (!isPinned) setIsExpanded(false);
      }}
    >
      <div
        className={`fixed left-0 top-0 bottom-0 z-30 flex flex-col bg-white border-r border-[#E5E7EB] shadow-soft h-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden ${
          effectiveExpanded ? "w-60" : "w-[68px]"
        }`}
      >
        {/* Logo area */}
        <div className={`flex items-center gap-3 pt-5 pb-4 shrink-0 border-b border-white/20 transition-all duration-300 ${
          effectiveExpanded ? "px-5" : "justify-center px-2"
        }`}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blueMono-700 shadow-md shadow-blueMono-900/30">
            <MdLocalPharmacy className="h-5 w-5 text-white" />
          </div>
          {effectiveExpanded && (
            <div className="flex-1 min-w-0 overflow-hidden flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-[14px] font-bold text-blueMono-900 leading-tight tracking-tight truncate">
                  Pharma ERP
                </p>
                <p className="text-[10px] font-semibold text-blueMono-600 uppercase tracking-[0.08em] truncate">
                  {activeSoftware?.software_name || "Platform"}
                </p>
              </div>
              <button 
                onClick={() => setIsPinned(!isPinned)}
                className="text-blueMono-600 hover:text-blueMono-800 p-1.5 hover:bg-white/30 rounded-lg transition-colors"
                title={isPinned ? "Unpin sidebar" : "Pin sidebar"}
              >
                {isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className={`flex-1 py-3 space-y-0.5 overflow-y-auto scrollbar-none transition-all duration-300 ${
          effectiveExpanded ? "px-3" : "px-2"
        }`}>
          {menus.map(renderMenu)}
        </nav>

        {/* User info at bottom */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div className={`mt-auto mb-5 border-t border-white/20 hover:bg-white/10 cursor-pointer transition-all duration-300 ${
              effectiveExpanded ? "px-4 py-3" : "px-2 py-3 flex justify-center"
            }`}>
              {effectiveExpanded ? (
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blueMono-700 text-white text-xs font-bold">
                    {initials}
                  </div>
                  <div className="min-w-0 overflow-hidden">
                    <p className="text-[12px] font-semibold text-blueMono-900 truncate leading-tight">
                      {user?.name || user?.full_name || "User"}
                    </p>
                    <p className="text-[10px] text-blueMono-700/90 truncate leading-tight">
                      {activeBranch?.branch_name || activeBranch?.branch?.branch_name || "Head Office"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blueMono-700 text-white text-xs font-bold shadow-sm">
                  {initials}
                </div>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            side="top" 
            align={effectiveExpanded ? "start" : "center"}
            className="w-56 mb-2 border-white/20 bg-white/60 backdrop-blur-xl shadow-lg"
          >
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/20" />
            <DropdownMenuItem className="cursor-pointer hover:bg-white/40">
              <User className="mr-2 h-4 w-4" />
              <span>Profile Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer hover:bg-white/40">
              <Settings className="mr-2 h-4 w-4" />
              <span>Preferences</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/20" />
            <DropdownMenuItem className="cursor-pointer hover:bg-red-500/20 text-red-600 hover:text-red-700">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default Sidebar;
