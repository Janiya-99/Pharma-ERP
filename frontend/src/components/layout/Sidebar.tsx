import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import PermissionGuard from "../../auth/PermissionGuard";
import {
  LayoutDashboard,
  Building,
  Shield,
  FileCheck,
  Settings,
  BookOpen,
  Package,
  Truck,
  ChevronRight,
  Pin,
  PinOff,
  LogOut,
  User,
  Landmark,
  BarChart3,
  Building2,
  Warehouse,
  ClipboardList,
  RotateCcw,
  Repeat,
  Users,
  FileText,
  CreditCard,
  Receipt,
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
  disabled?: boolean;
  children?: {
    name: string;
    path: string;
    permission?: string;
    disabled?: boolean;
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
    {
      name: "Dashboard",
      path: "/control-center/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Organization Setup",
      icon: Building,
      children: [
        {
          name: "Company",
          path: "/control-center/company",
          permission: "control.company.view",
        },
        {
          name: "Branches",
          path: "/control-center/branches",
          permission: "control.branch.view",
        },
        {
          name: "Departments",
          path: "/control-center/departments",
          permission: "control.department.view",
        },
        {
          name: "Designations",
          path: "/control-center/designations",
          permission: "control.designation.view",
        },
      ],
    },
    {
      name: "User & Access Center",
      icon: Shield,
      children: [
        {
          name: "Users",
          path: "/control-center/users",
          permission: "control.user.view",
        },
        {
          name: "Roles & Permissions",
          path: "/control-center/roles-permissions",
          permission: "control.role.view",
        },
        {
          name: "User Access",
          path: "/control-center/user-access",
          permission: "control.access_matrix.view",
        },
      ],
    },
    {
      name: "System Setup",
      icon: Settings,
      children: [
        {
          name: "Software Modules",
          path: "/control-center/software-modules",
          permission: "control.permission.view",
        },
        { name: "Settings", path: "/control-center/settings" },
      ],
    },
    {
      name: "Audit & Security",
      icon: FileCheck,
      children: [
        {
          name: "Audit Logs",
          path: "/control-center/audit-logs",
          permission: "control.audit.view",
        },
        {
          name: "Login Logs",
          path: "/control-center/login-logs",
          permission: "control.login_logs.view",
        },
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
        {
          name: "Journal Entry",
          path: "/finance/general-ledger/journal-entry",
        },
        {
          name: "Journal Register",
          path: "/finance/general-ledger/journal-register",
        },
        {
          name: "Account Ledger",
          path: "/finance/general-ledger/account-ledger",
        },
        {
          name: "Trial Balance",
          path: "/finance/general-ledger/trial-balance",
        },
        {
          name: "General Ledger Report",
          path: "/finance/general-ledger/general-ledger-report",
        },
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
        {
          name: "Bank Reconciliation",
          path: "/finance/banking/bank-reconciliation",
        },
      ],
    },
    {
      name: "Reports",
      icon: BarChart3,
      children: [
        {
          name: "Reports Dashboard",
          path: "/finance/reports/reports-dashboard",
        },
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
        {
          name: "Fixed Asset Categories",
          path: "/finance/fixed-assets/categories",
        },
        { name: "Fixed Assets", path: "/finance/fixed-assets/assets" },
        {
          name: "Depreciation Runs",
          path: "/finance/fixed-assets/depreciation-runs",
        },
        {
          name: "Asset Disposals",
          path: "/finance/fixed-assets/asset-disposals",
        },
      ],
    },
  ];

  const inventoryMenus: MenuItem[] = [
    {
      name: "Dashboard",
      path: "/inventory/dashboard",
      icon: LayoutDashboard,
      permission: "inventory.dashboard.view",
    },
    {
      name: "Product Master",
      icon: Package,
      children: [
        {
          name: "Products",
          path: "/inventory/products",
          permission: "inventory.product_master.view",
        },
        {
          name: "Product Batches",
          path: "/inventory/product-batches",
          permission: "inventory.product_batch.view",
        },
      ],
    },
    {
      name: "Warehouses",
      icon: Warehouse,
      children: [
        {
          name: "Warehouses & Locations",
          path: "/inventory/warehouses",
          permission: "inventory.warehouse.view",
        },
      ],
    },
    {
      name: "Goods Receiving",
      icon: ClipboardList,
      children: [
        {
          name: "GRN / Goods Receipt",
          path: "/inventory/grn",
          permission: "inventory.grn.view",
        },
      ],
    },
    {
      name: "Stock Movement",
      icon: Repeat,
      children: [
        {
          name: "Opening Stock",
          path: "/inventory/stock/opening-stock",
          permission: "inventory.opening_stock.view",
        },
        {
          name: "Stock Transfers",
          path: "/inventory/stock/transfers",
          permission: "inventory.stock_transfer.view",
        },
        {
          name: "Stock Adjustments",
          path: "/inventory/stock/adjustments",
          permission: "inventory.stock_adjustment.view",
        },
      ],
    },
    {
      name: "Returns",
      icon: RotateCcw,
      children: [
        {
          name: "Purchase Returns",
          path: "/inventory/returns/purchase-returns",
          permission: "inventory.purchase_return.view",
        },
        {
          name: "Sales Returns",
          path: "/inventory/returns/sales-returns",
          permission: "inventory.sales_return.view",
        },
      ],
    },
    {
      name: "Reports",
      icon: BarChart3,
      children: [
        {
          name: "Stock Balance",
          path: "/inventory/reports/stock-balance",
          permission: "inventory.stock_balance.view",
        },
        {
          name: "Stock Ledger",
          path: "/inventory/reports/stock-ledger",
          permission: "inventory.stock_ledger.view",
        },
        {
          name: "Expiry Report",
          path: "/inventory/reports/expiry-report",
          permission: "inventory.stock_balance.view",
        },
        {
          name: "Batch Report",
          path: "/inventory/reports/batch-report",
          permission: "inventory.product_batch.view",
        },
      ],
    },
    {
      name: "Settings",
      icon: Settings,
      children: [
        {
          name: "Product Setup",
          path: "/inventory/settings/product-setup",
          permission: "inventory.product_master.view",
        },
        {
          name: "Suppliers",
          path: "/inventory/settings/suppliers",
          permission: "inventory.product_master.view",
        },
      ],
    },
  ];

  const invoiceCenterMenus: MenuItem[] = [
    {
      name: "Invoice Center Dashboard",
      path: "/invoice-center/dashboard",
      icon: LayoutDashboard,
      permission: "invoice_center.dashboard.view",
    },
    {
      name: "Customer Management",
      icon: Users,
      children: [
        {
          name: "Customer Categories",
          path: "/invoice-center/customer-categories",
          permission: "invoice_center.customer_category.view",
        },
        {
          name: "Customers",
          path: "/invoice-center/customers",
          permission: "invoice_center.customer.view",
        },
      ],
    },
    {
      name: "Sales",
      icon: FileText,
      children: [
        {
          name: "Sales Orders",
          path: "/invoice-center/sales-orders",
          permission: "invoice_center.sales_order.view",
        },
        {
          name: "Sales Invoices",
          path: "/invoice-center/sales-invoices",
          permission: "invoice_center.sales_invoice.view",
        },
      ],
    },
    {
      name: "Adjustments",
      icon: CreditCard,
      children: [
        {
          name: "Credit Notes",
          path: "/invoice-center/credit-notes",
          permission: "invoice_center.credit_note.view",
        },
        {
          name: "Debit Notes",
          path: "/invoice-center/debit-notes",
          permission: "invoice_center.debit_note.view",
        },
      ],
    },
    {
      name: "Receipts",
      icon: Receipt,
      children: [
        {
          name: "Customer Receipts",
          path: "/invoice-center/customer-receipts",
          permission: "invoice_center.customer_receipt.view",
        },
      ],
    },
    {
      name: "Finance Integration",
      icon: Landmark,
      children: [
        {
          name: "Finance Settings",
          path: "/invoice-center/finance-settings",
          permission: "invoice_center.finance_settings.view",
        },
        {
          name: "Finance Posting",
          path: "/invoice-center/finance-posting",
          permission: "invoice_center.finance_posting.view",
        },
      ],
    },
    {
      name: "Reports",
      icon: BarChart3,
      children: [
        {
          name: "Reports Dashboard",
          path: "/invoice-center/reports/dashboard",
          permission: "invoice_center.reports.view",
        },
        {
          name: "Customer Balance",
          path: "/invoice-center/reports/customer-balance",
          permission: "invoice_center.reports.view",
        },
        {
          name: "Customer Statement",
          path: "/invoice-center/reports/customer-statement",
          permission: "invoice_center.reports.view",
        },
        {
          name: "Customer Aging",
          path: "/invoice-center/reports/customer-aging",
          permission: "invoice_center.reports.view",
        },
        {
          name: "Sales Order Register",
          path: "/invoice-center/reports/sales-order-register",
          permission: "invoice_center.reports.view",
        },
        {
          name: "Sales Invoice Register",
          path: "/invoice-center/reports/sales-invoice-register",
          permission: "invoice_center.reports.view",
        },
        {
          name: "Credit Note Register",
          path: "/invoice-center/reports/credit-note-register",
          permission: "invoice_center.reports.view",
        },
        {
          name: "Debit Note Register",
          path: "/invoice-center/reports/debit-note-register",
          permission: "invoice_center.reports.view",
        },
        {
          name: "Receipt Register",
          path: "/invoice-center/reports/customer-receipt-register",
          permission: "invoice_center.reports.view",
        },
        {
          name: "Outstanding Invoices",
          path: "/invoice-center/reports/outstanding-invoices",
          permission: "invoice_center.reports.view",
        },
        {
          name: "Sales by Customer",
          path: "/invoice-center/reports/sales-by-customer",
          permission: "invoice_center.reports.view",
        },
        {
          name: "Sales by Product",
          path: "/invoice-center/reports/sales-by-product",
          permission: "invoice_center.reports.view",
        },
        {
          name: "Collection Summary",
          path: "/invoice-center/reports/collection-summary",
          permission: "invoice_center.reports.view",
        },
        {
          name: "Finance Posting Status",
          path: "/invoice-center/reports/finance-posting-status",
          permission: "invoice_center.reports.view",
        },
      ],
    },
  ];

  const getMenus = (): MenuItem[] => {
    const code = activeSoftware?.software_code;
    if (code === "CONTROL_CENTER") return controlCenterMenus;
    if (code === "FINANCE") return financeMenus;
    if (code === "INVENTORY") return inventoryMenus;
    if (code === "INVOICE_CENTER") return invoiceCenterMenus;
    return [
      {
        name: "Dashboard",
        path: `/${code?.toLowerCase().replace("_", "-")}/dashboard`,
        icon: LayoutDashboard,
      },
    ];
  };

  const menus = getMenus();

  React.useEffect(() => {
    const match = menus.find(
      (m) =>
        m.children && m.children.some((c) => location.pathname.includes(c.path))
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
              `group relative flex items-center gap-3 rounded-xl transition-all duration-150 ${
                effectiveExpanded ? "px-3.5 py-2.5" : "justify-center p-2.5"
              } ${
                isActive
                  ? "bg-blueMono-200/50 font-semibold text-blueMono-900 shadow-sm"
                  : "text-blueMono-800/80 hover:bg-white/30 hover:text-blueMono-900"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <menu.icon
                  className={`h-4 w-4 shrink-0 transition-colors ${
                    isActive
                      ? "text-blueMono-800"
                      : "text-blueMono-700/80 group-hover:text-blueMono-900"
                  }`}
                />
                {effectiveExpanded && (
                  <span
                    className={`truncate text-[13px] font-medium transition-colors ${
                      isActive
                        ? "text-blueMono-900"
                        : "text-blueMono-900 group-hover:text-blueMono-900"
                    }`}
                  >
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
          className={`group relative flex w-full items-center gap-3 rounded-xl transition-all duration-150 ${
            effectiveExpanded ? "px-3.5 py-2.5" : "justify-center p-2.5"
          } ${
            isActiveParent
              ? "bg-blueMono-200/50 font-semibold text-blueMono-900 shadow-sm"
              : "text-blueMono-800/80 hover:bg-white/30 hover:text-blueMono-900"
          }`}
        >
          <menu.icon
            className={`h-4 w-4 shrink-0 transition-colors ${
              isActiveParent
                ? "text-blueMono-800"
                : "text-blueMono-700/80 group-hover:text-blueMono-900"
            }`}
          />
          {effectiveExpanded && (
            <>
              <span className="flex-1 truncate text-left text-[13px] font-medium">
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
          <div className="ml-5.5 mt-0.5 flex flex-col gap-0.5 space-y-0.5 border-l border-white/30 pl-6 pr-1.5">
            {menu.children!.map((child) => {
              if (child.disabled) {
                return (
                  <PermissionGuard
                    key={child.path}
                    permission={child.permission}
                  >
                    <div className="flex cursor-not-allowed items-center justify-between rounded-lg px-3 py-1.5 text-[12px] font-medium text-blueMono-800/40 opacity-60">
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blueMono-300/30" />
                        <span className="truncate">{child.name}</span>
                      </div>
                      <span className="ml-1 shrink-0 rounded bg-white/30 px-1.5 py-0.5 text-[9px] text-blueMono-800/60">
                        Soon
                      </span>
                    </div>
                  </PermissionGuard>
                );
              }
              return (
                <PermissionGuard key={child.path} permission={child.permission}>
                  <NavLink
                    to={child.path}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-[12px] font-medium transition-all duration-150 ${
                        isActive
                          ? "bg-white/40 font-semibold text-blueMono-900 shadow-sm"
                          : "text-blueMono-800/80 hover:bg-white/30 hover:text-blueMono-900"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            isActive ? "bg-blueMono-700" : "bg-blueMono-300/50"
                          }`}
                        />
                        <span className="truncate">{child.name}</span>
                      </>
                    )}
                  </NavLink>
                </PermissionGuard>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`ease-[cubic-bezier(0.4,0,0.2,1)] relative z-30 h-full shrink-0 transition-all duration-300 ${
        effectiveExpanded ? "w-60" : "w-[68px]"
      }`}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => {
        if (!isPinned) setIsExpanded(false);
      }}
    >
      <div
        className={`shadow-soft ease-[cubic-bezier(0.4,0,0.2,1)] fixed bottom-0 left-0 top-0 z-30 flex h-full flex-col overflow-hidden border-r border-[#E5E7EB] bg-white transition-all duration-300 ${
          effectiveExpanded ? "w-60" : "w-[68px]"
        }`}
      >
        {/* Logo area */}
        <div
          className={`flex shrink-0 items-center gap-3 border-b border-white/20 pb-4 pt-5 transition-all duration-300 ${
            effectiveExpanded ? "px-5" : "justify-center px-2"
          }`}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blueMono-700 shadow-md shadow-blueMono-900/30">
            <MdLocalPharmacy className="h-5 w-5 text-white" />
          </div>
          {effectiveExpanded && (
            <div className="flex min-w-0 flex-1 items-center justify-between overflow-hidden">
              <div className="min-w-0">
                <p className="truncate text-[14px] font-bold leading-tight tracking-tight text-blueMono-900">
                  Pharma ERP
                </p>
                <p className="truncate text-[10px] font-semibold uppercase tracking-[0.08em] text-blueMono-600">
                  {activeSoftware?.software_name || "Platform"}
                </p>
              </div>
              <button
                onClick={() => setIsPinned(!isPinned)}
                className="rounded-lg p-1.5 text-blueMono-600 transition-colors hover:bg-white/30 hover:text-blueMono-800"
                title={isPinned ? "Unpin sidebar" : "Pin sidebar"}
              >
                {isPinned ? (
                  <PinOff className="h-4 w-4" />
                ) : (
                  <Pin className="h-4 w-4" />
                )}
              </button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav
          className={`scrollbar-none flex-1 space-y-0.5 overflow-y-auto py-3 transition-all duration-300 ${
            effectiveExpanded ? "px-3" : "px-2"
          }`}
        >
          {menus.map(renderMenu)}
        </nav>

        {/* User info at bottom */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div
              className={`mb-5 mt-auto cursor-pointer border-t border-white/20 transition-all duration-300 hover:bg-white/10 ${
                effectiveExpanded
                  ? "px-4 py-3"
                  : "flex justify-center px-2 py-3"
              }`}
            >
              {effectiveExpanded ? (
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blueMono-700 text-xs font-bold text-white">
                    {initials}
                  </div>
                  <div className="min-w-0 overflow-hidden">
                    <p className="truncate text-[12px] font-semibold leading-tight text-blueMono-900">
                      {user?.name || user?.full_name || "User"}
                    </p>
                    <p className="truncate text-[10px] leading-tight text-blueMono-700/90">
                      {activeBranch?.branch_name ||
                        activeBranch?.branch?.branch_name ||
                        "Head Office"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blueMono-700 text-xs font-bold text-white shadow-sm">
                  {initials}
                </div>
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align={effectiveExpanded ? "start" : "center"}
            className="mb-2 w-56 border-white/20 bg-white/60 shadow-lg backdrop-blur-xl"
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
            <DropdownMenuItem className="cursor-pointer text-red-600 hover:bg-red-500/20 hover:text-red-700">
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
