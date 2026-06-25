import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import PermissionGuard from "../../auth/PermissionGuard";
import {
  LayoutDashboard, Building, MapPin, Users, Network, Key, Shield, ShieldCheck,
  FileCheck, LogIn, Settings, Briefcase, Calculator, Archive, BookOpen,
  PieChart, FileText, Package, Layers, Tags, Target, Beaker, Factory,
  Truck, Box, GitMerge, ListChecks, BarChart2, ChevronRight,
} from "lucide-react";
import { MdLocalPharmacy } from "react-icons/md";

type MenuItem = {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  permission?: string;
};

const Sidebar = () => {
  const { activeSoftware, user, activeBranch } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();

  const controlCenterMenus: MenuItem[] = [
    { name: "Dashboard", path: "/control-center/dashboard", icon: LayoutDashboard },
    { name: "Company Setup", path: "/control-center/company", icon: Building, permission: "control.company.view" },
    { name: "Branches", path: "/control-center/branches", icon: MapPin, permission: "control.branch.view" },
    { name: "Departments", path: "/control-center/departments", icon: Network, permission: "control.department.view" },
    { name: "Designations", path: "/control-center/designations", icon: Users, permission: "control.designation.view" },
    { name: "Users", path: "/control-center/users", icon: Users, permission: "control.user.view" },
    { name: "User Branch Access", path: "/control-center/user-branch-access", icon: MapPin, permission: "control.access.branch.view" },
    { name: "User Software Access", path: "/control-center/user-software-access", icon: LayoutDashboard, permission: "control.access.software.view" },
    { name: "Roles", path: "/control-center/roles", icon: Shield, permission: "control.role.view" },
    { name: "Software Modules", path: "/control-center/software-modules", icon: LayoutDashboard, permission: "control.permission.view" },
    { name: "Permissions", path: "/control-center/permissions", icon: Key, permission: "control.permission.view" },
    { name: "Role Permission Matrix", path: "/control-center/role-permission-matrix", icon: ShieldCheck, permission: "control.permission.assign" },
    { name: "User Access Matrix", path: "/control-center/user-access-matrix", icon: ShieldCheck, permission: "control.access_matrix.view" },
    { name: "Audit Logs", path: "/control-center/audit-logs", icon: FileCheck, permission: "control.audit.view" },
    { name: "Login Logs", path: "/control-center/login-logs", icon: LogIn, permission: "control.login_logs.view" },
    { name: "Settings", path: "/control-center/settings", icon: Settings },
  ];

  const financeMenus: MenuItem[] = [
    { name: "Dashboard", path: "/finance/dashboard", icon: LayoutDashboard },
    { name: "General Ledger", path: "/finance/general-ledger", icon: BookOpen, permission: "finance.general_ledger.view" },
    { name: "Reports Dashboard", path: "/finance/reports", icon: PieChart, permission: "finance.report.view" },
    { name: "Account Ledger", path: "/finance/reports/account-ledger", icon: FileText, permission: "finance.report.account_ledger.view" },
    { name: "Trial Balance", path: "/finance/reports/trial-balance", icon: FileText, permission: "finance.report.trial_balance.view" },
    { name: "Profit and Loss", path: "/finance/reports/profit-loss", icon: FileText, permission: "finance.report.profit_loss.view" },
    { name: "Balance Sheet", path: "/finance/reports/balance-sheet", icon: FileText, permission: "finance.report.balance_sheet.view" },
    { name: "Cash Book", path: "/finance/reports/cash-book", icon: FileText, permission: "finance.report.cash_book.view" },
    { name: "Bank Book", path: "/finance/reports/bank-book", icon: FileText, permission: "finance.report.bank_book.view" },
    { name: "Day Book", path: "/finance/reports/day-book", icon: FileText, permission: "finance.report.day_book.view" },
    { name: "Journal Register", path: "/finance/reports/journal-register", icon: FileText, permission: "finance.report.journal_register.view" },
    { name: "Payment Register", path: "/finance/reports/payment-register", icon: FileText, permission: "finance.report.payment_register.view" },
    { name: "Receipt Register", path: "/finance/reports/receipt-register", icon: FileText, permission: "finance.report.receipt_register.view" },
    { name: "Fixed Asset Categories", path: "/finance/fixed-asset-categories", icon: BarChart2, permission: "finance.fixed_asset_category.view" },
    { name: "Fixed Assets", path: "/finance/fixed-assets", icon: Briefcase, permission: "finance.fixed_asset.view" },
    { name: "Depreciation Runs", path: "/finance/fixed-asset-depreciation-runs", icon: Calculator, permission: "finance.fixed_asset_depreciation.view" },
    { name: "Asset Disposals", path: "/finance/fixed-asset-disposals", icon: Archive, permission: "finance.fixed_asset_disposal.view" },
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
  const initials = (user?.name || user?.full_name || "U")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const renderMenu = (menu: MenuItem) => (
    <PermissionGuard key={menu.path} permission={menu.permission}>
      <NavLink
        to={menu.path}
        title={!isExpanded ? menu.name : undefined}
        className={({ isActive }) =>
          `relative flex items-center gap-3 rounded-xl transition-all duration-150 group ${
            isExpanded ? "px-3.5 py-2.5" : "justify-center p-2.5"
          } ${
            isActive
              ? "bg-indigo-600 text-white shadow-sm shadow-indigo-300/50"
              : "text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          }`
        }
      >
        {({ isActive }) => (
          <>
            <menu.icon
              className={`h-4 w-4 shrink-0 transition-colors ${
                isActive ? "text-white" : "text-gray-400 group-hover:text-gray-600"
              }`}
            />
            {isExpanded && (
              <span className={`text-[13px] font-medium truncate transition-colors ${
                isActive ? "text-white" : "text-gray-600 group-hover:text-gray-800"
              }`}>
                {menu.name}
              </span>
            )}
            {/* Active dot when collapsed */}
            {!isExpanded && isActive && (
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-white/70" />
            )}
          </>
        )}
      </NavLink>
    </PermissionGuard>
  );

  return (
    <div
      className={`relative z-30 h-full shrink-0 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
        isExpanded ? "w-60" : "w-[68px]"
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      <div
        className={`fixed left-0 top-0 bottom-0 z-30 flex flex-col bg-white border-r border-gray-100 shadow-[1px_0_20px_rgba(0,0,0,0.05)] h-full transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden ${
          isExpanded ? "w-60" : "w-[68px]"
        }`}
      >
        {/* Logo area */}
        <div className={`flex items-center gap-3 pt-5 pb-4 shrink-0 border-b border-gray-100 transition-all duration-300 ${
          isExpanded ? "px-5" : "justify-center px-2"
        }`}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 shadow-md shadow-indigo-300/40">
            <MdLocalPharmacy className="h-5 w-5 text-white" />
          </div>
          {isExpanded && (
            <div className="min-w-0 overflow-hidden">
              <p className="text-[14px] font-bold text-gray-900 leading-tight tracking-tight truncate">
                Pharma ERP
              </p>
              <p className="text-[10px] font-semibold text-indigo-500 uppercase tracking-[0.08em] truncate">
                {activeSoftware?.software_name || "Platform"}
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className={`flex-1 py-3 space-y-0.5 overflow-y-auto scrollbar-none transition-all duration-300 ${
          isExpanded ? "px-3" : "px-2"
        }`}>
          {menus.map(renderMenu)}
        </nav>

        {/* User info at bottom */}
        <div className={`shrink-0 border-t border-gray-100 transition-all duration-300 ${
          isExpanded ? "px-4 py-3" : "px-2 py-3 flex justify-center"
        }`}>
          {isExpanded ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white text-xs font-bold">
                {initials}
              </div>
              <div className="min-w-0 overflow-hidden">
                <p className="text-[12px] font-semibold text-gray-800 truncate leading-tight">
                  {user?.name || user?.full_name || "User"}
                </p>
                <p className="text-[10px] text-gray-400 truncate leading-tight">
                  {activeBranch?.branch_name || activeBranch?.branch?.branch_name || "Head Office"}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 text-white text-xs font-bold shadow-sm">
              {initials}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
