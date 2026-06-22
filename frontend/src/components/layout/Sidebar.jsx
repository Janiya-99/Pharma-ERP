import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import PermissionGuard from "../../auth/PermissionGuard";
import { 
   LayoutDashboard, Building, MapPin, Users, Network, Key, Shield, ShieldCheck, FileCheck, LogIn, Settings,
   Briefcase, Calculator, Clock, CheckSquare, List, CalendarCheck, Archive, BookOpen, PieChart, FileText,
   Package, Layers, Tags, Target, Beaker, Factory, Truck, Box, GitMerge, ListChecks, BarChart2
} from "lucide-react";
import { MdLocalPharmacy } from "react-icons/md";

const Sidebar = () => {
  const { activeSoftware, user, activeBranch } = useAuth();
  const [isHovered, setIsHovered] = useState(false);

  const controlCenterMenus = [
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

  const renderMenus = () => {
    if (activeSoftware?.software_code === "CONTROL_CENTER") {
      return controlCenterMenus.map((menu) => (
        <PermissionGuard key={menu.path} permission={menu.permission}>
          <NavLink
            to={menu.path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl text-sm font-medium transition-all ${
                isHovered ? "px-4 py-2.5" : "justify-center p-2.5 mx-2"
              } ${
                isActive
                  ? "bg-brand-50 text-brand-600 dark:bg-navy-700 dark:text-white font-bold shadow-sm"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800 dark:hover:bg-navy-700 dark:text-gray-400"
              }`
            }
            title={!isHovered ? menu.name : undefined}
          >
            {({ isActive }) => (
              <>
                <menu.icon className={`w-5 h-5 shrink-0 ${
                  isActive ? "text-brand-600 dark:text-white" : "text-gray-400"
                }`} />
                {isHovered && (
                  <>
                    <span className="flex-1 text-left truncate transition-all duration-300">{menu.name}</span>
                    {isActive && <div className="h-1.5 w-1.5 rounded-full bg-brand-500 shrink-0" />}
                  </>
                )}
              </>
            )}
          </NavLink>
        </PermissionGuard>
      ));
    }

    if (activeSoftware?.software_code === "FINANCE") {
      const financeMenus = [
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
        { name: "Fixed Asset Categories", path: "/finance/fixed-asset-categories", icon: List, permission: "finance.fixed_asset_category.view" },
        { name: "Fixed Assets", path: "/finance/fixed-assets", icon: Briefcase, permission: "finance.fixed_asset.view" },
        { name: "Depreciation Runs", path: "/finance/fixed-asset-depreciation-runs", icon: Calculator, permission: "finance.fixed_asset_depreciation.view" },
        { name: "Asset Disposals", path: "/finance/fixed-asset-disposals", icon: Archive, permission: "finance.fixed_asset_disposal.view" },
      ];

      return financeMenus.map((menu) => (
        <PermissionGuard key={menu.path} permission={menu.permission}>
          <NavLink
            to={menu.path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl text-sm font-medium transition-all ${
                isHovered ? "px-4 py-2.5" : "justify-center p-2.5 mx-2"
              } ${
                isActive
                  ? "bg-brand-50 text-brand-600 dark:bg-navy-700 dark:text-white font-bold shadow-sm"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800 dark:hover:bg-navy-700 dark:text-gray-400"
              }`
            }
            title={!isHovered ? menu.name : undefined}
          >
            {({ isActive }) => (
              <>
                <menu.icon className={`w-5 h-5 shrink-0 ${
                  isActive ? "text-brand-600 dark:text-white" : "text-gray-400"
                }`} />
                {isHovered && (
                  <>
                    <span className="flex-1 text-left truncate transition-all duration-300">{menu.name}</span>
                    {isActive && <div className="h-1.5 w-1.5 rounded-full bg-brand-500 shrink-0" />}
                  </>
                )}
              </>
            )}
          </NavLink>
        </PermissionGuard>
      ));
    }

    if (activeSoftware?.software_code === "INVENTORY") {
      const inventoryMenus = [
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
        { name: "Stock Balances", path: "/inventory/stock-balances", icon: Box, permission: "inventory.stock_balance.view" },
        { name: "Stock Ledger", path: "/inventory/stock-ledger", icon: ListChecks, permission: "inventory.stock_ledger.view" },
      ];

      return inventoryMenus.map((menu) => (
        <PermissionGuard key={menu.path} permission={menu.permission}>
          <NavLink
            to={menu.path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl text-sm font-medium transition-all ${
                isHovered ? "px-4 py-2.5" : "justify-center p-2.5 mx-2"
              } ${
                isActive
                  ? "bg-brand-50 text-brand-600 dark:bg-navy-700 dark:text-white font-bold shadow-sm"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800 dark:hover:bg-navy-700 dark:text-gray-400"
              }`
            }
            title={!isHovered ? menu.name : undefined}
          >
            {({ isActive }) => (
              <>
                <menu.icon className={`w-5 h-5 shrink-0 ${
                  isActive ? "text-brand-600 dark:text-white" : "text-gray-400"
                }`} />
                {isHovered && (
                  <>
                    <span className="flex-1 text-left truncate transition-all duration-300">{menu.name}</span>
                    {isActive && <div className="h-1.5 w-1.5 rounded-full bg-brand-500 shrink-0" />}
                  </>
                )}
              </>
            )}
          </NavLink>
        </PermissionGuard>
      ));
    }

    // Placeholder menu for other modules
    return (
      <NavLink
        to={`/${activeSoftware?.software_code?.toLowerCase().replace("_", "-")}/dashboard`}
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-xl text-sm font-medium transition-all ${
            isHovered ? "px-4 py-2.5" : "justify-center p-2.5 mx-2"
          } ${
            isActive
              ? "bg-brand-50 text-brand-600 dark:bg-navy-700 dark:text-white font-bold shadow-sm"
              : "text-gray-500 hover:bg-gray-50 hover:text-gray-800 dark:hover:bg-navy-700 dark:text-gray-400"
          }`
        }
        title={!isHovered ? "Dashboard" : undefined}
      >
        {({ isActive }) => (
          <>
            <LayoutDashboard className={`w-5 h-5 shrink-0 ${
              isActive ? "text-brand-600 dark:text-white" : "text-gray-400"
            }`} />
            {isHovered && (
              <>
                <span className="flex-1 text-left truncate transition-all duration-300">Dashboard</span>
                {isActive && <div className="h-1.5 w-1.5 rounded-full bg-brand-500 shrink-0" />}
              </>
            )}
          </>
        )}
      </NavLink>
    );
  };

  return (
    <div 
      className="relative z-30 h-full shrink-0 transition-all duration-300 ease-in-out w-[70px] hover:w-64"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`fixed left-0 top-0 bottom-0 z-30 flex flex-col bg-white dark:bg-navy-800 text-gray-800 dark:text-white shadow-xl shadow-gray-200/50 dark:shadow-none h-full transition-all duration-300 ease-in-out border-r border-gray-100 dark:border-navy-700 scrollbar-none overflow-y-auto ${
        isHovered ? "w-64" : "w-[70px]"
      }`}>
        {/* Logo */}
        <div className={`flex items-center gap-3 pt-8 pb-4 transition-all duration-300 ${
          isHovered ? "px-6" : "justify-center px-2"
        }`}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-500 shadow-md shadow-brand-500/30">
            <MdLocalPharmacy className="h-5 w-5 text-white" />
          </div>
          {isHovered && (
            <div className="transition-opacity duration-300">
              <p className="text-[15px] font-bold text-navy-700 dark:text-white leading-tight">Pharma ERP</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {activeSoftware?.software_name || "Platform"}
              </p>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className={`mb-4 h-px bg-gray-100 dark:bg-white/10 transition-all duration-300 ${
          isHovered ? "mx-6" : "mx-3"
        }`} />

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1 pb-4">
          {renderMenus()}
        </nav>

        {/* Bottom User Info */}
        <div className={`my-4 rounded-xl bg-gray-50 dark:bg-navy-700 border border-gray-100 dark:border-navy-600 transition-all duration-300 ${
          isHovered ? "mx-4 p-3" : "mx-2 p-2 flex justify-center items-center"
        }`}>
          {isHovered ? (
            <div className="transition-all duration-300">
              <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-300 uppercase tracking-wider mb-1">Signed in as</p>
              <p className="text-sm font-bold text-navy-700 dark:text-white truncate">{user?.name || user?.full_name || "User"}</p>
              <p className="text-[10px] text-gray-400 dark:text-gray-400 truncate">
                {user?.user_type === "super_admin" ? "Super Admin" : "User"} — {activeBranch?.branch_name || activeBranch?.branch?.branch_name || "Head Office"}
              </p>
            </div>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-brand-600 font-bold text-xs shrink-0">
              {(user?.name || user?.full_name || "U").charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
