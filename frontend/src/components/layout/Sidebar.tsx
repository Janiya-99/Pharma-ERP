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
  Receipt,
  Printer,
  Pill,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Sheet, SheetContent } from "../ui/sheet";
import { useSidebarState } from "./AppLayout";
import { controlCenterNavigation } from "../../config/controlCenterNavigation";

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
  const { activeSoftware, user, company, activeBranch, hasPermission } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const effectiveExpanded = isExpanded || isPinned;
  const location = useLocation();
  const { mobileOpen, setMobileOpen, setDesktopExpanded } = useSidebarState();

  React.useEffect(() => {
    setDesktopExpanded(effectiveExpanded);
  }, [effectiveExpanded, setDesktopExpanded]);


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
      name: "Customers",
      icon: Users,
      children: [
        {
          name: "Customers",
          path: "/invoice-center/customers",
          permission: "invoice_center.customer.view",
        },
        {
          name: "Customer Categories",
          path: "/invoice-center/customer-categories",
          permission: "invoice_center.customer_category.view",
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
          name: "Proforma Invoices",
          path: "/invoice-center/proforma-invoices",
          permission: "invoice_center.sales_invoice.view",
        },
        {
          name: "Sales Invoices",
          path: "/invoice-center/sales-invoices",
          permission: "invoice_center.sales_invoice.view",
        },
      ],
    },
    {
      name: "Returns",
      icon: RotateCcw,
      children: [
        {
          name: "Sales Returns",
          path: "/inventory/returns/sales-returns",
          permission: "inventory.sales_return.view",
        },
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
      name: "Approvals",
      icon: FileCheck,
      children: [
        { name: "Approval Inbox", path: "/invoice-center/approvals/inbox" },
        {
          name: "My Submitted Documents",
          path: "/invoice-center/approvals/submitted",
        },
        { name: "Approval History", path: "/invoice-center/approvals/history" },
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
          permission: "invoice_center.dashboard.view",
        },
        {
          name: "Customer Balance",
          path: "/invoice-center/reports/customer-balance",
          permission: "invoice_center.report.customer_balance",
        },
        {
          name: "Customer Statement",
          path: "/invoice-center/reports/customer-statement",
          permission: "invoice_center.report.customer_statement",
        },
        {
          name: "Customer Aging",
          path: "/invoice-center/reports/customer-aging",
          permission: "invoice_center.report.customer_aging",
        },
        {
          name: "Sales Order Register",
          path: "/invoice-center/reports/sales-order-register",
          permission: "invoice_center.report.sales_order_register",
        },
        {
          name: "Sales Invoice Register",
          path: "/invoice-center/reports/sales-invoice-register",
          permission: "invoice_center.report.sales_invoice_register",
        },
        {
          name: "Credit Note Register",
          path: "/invoice-center/reports/credit-note-register",
          permission: "invoice_center.report.credit_note_register",
        },
        {
          name: "Debit Note Register",
          path: "/invoice-center/reports/debit-note-register",
          permission: "invoice_center.report.debit_note_register",
        },
        {
          name: "Customer Receipt Register",
          path: "/invoice-center/reports/customer-receipt-register",
          permission: "invoice_center.report.customer_receipt_register",
        },
        {
          name: "Outstanding Invoices",
          path: "/invoice-center/reports/outstanding-invoices",
          permission: "invoice_center.report.outstanding_invoices",
        },
        {
          name: "Sales by Customer",
          path: "/invoice-center/reports/sales-by-customer",
          permission: "invoice_center.report.sales_by_customer",
        },
        {
          name: "Sales by Product",
          path: "/invoice-center/reports/sales-by-product",
          permission: "invoice_center.report.sales_by_product",
        },
        {
          name: "Collection Summary",
          path: "/invoice-center/reports/collection-summary",
          permission: "invoice_center.report.collection_summary",
        },
        {
          name: "Finance Posting Status",
          path: "/invoice-center/reports/finance-posting-status",
          permission: "invoice_center.report.finance_posting_status",
        },
      ],
    },
    {
      name: "Settings",
      icon: Printer,
      children: [
        {
          name: "Print Format Designer",
          path: "/invoice-center/settings/print-formats",
          permission: "invoice_center.print_format.view",
        },
      ],
    },
  ];

  const complianceCenterMenus: MenuItem[] = [
    {
      name: "Compliance Dashboard",
      path: "/compliance-center/dashboard",
      icon: LayoutDashboard,
      permission: "compliance.dashboard.view",
    },
    {
      name: "Licensing & Registration",
      icon: FileCheck,
      children: [
        {
          name: "License Documents",
          path: "/compliance-center/licenses",
          permission: "compliance.license.view",
        },
      ],
    },
    {
      name: "Quality & Quarantine",
      icon: Pill,
      children: [
        {
          name: "Batch Holds & Quarantine",
          path: "/compliance-center/batch-holds",
          permission: "compliance.batch_hold.view",
        },
        {
          name: "Product Recalls",
          path: "/compliance-center/recalls",
          permission: "compliance.recall.view",
        },
      ],
    },
    {
      name: "Disposal & Archives",
      icon: BookOpen,
      children: [
        {
          name: "Expiry & Disposal Logs",
          path: "/compliance-center/disposals",
          permission: "compliance.disposal.view",
        },
        {
          name: "Regulatory Records",
          path: "/compliance-center/records",
          permission: "compliance.record.view",
        },
      ],
    },
  ];

  const getMenus = (): MenuItem[] => {
    const code = activeSoftware?.software_code;
    
    if (code === "CONTROL_CENTER") {
      const filteredMenus = controlCenterNavigation
        .map((group) => {
          // Filter items based on permissions
          const items = group.items.filter(
            (item) => !item.permission || hasPermission(item.permission)
          );

          if (items.length === 0) return null;

          // If group only has a single item and it matches the group name exactly, treat it as a top-level link
          if (items.length === 1 && items[0].label === group.label) {
            return {
              name: group.label,
              icon: group.icon,
              path: items[0].route,
              permission: items[0].permission,
            } as MenuItem;
          }

          // Return group with children
          return {
            name: group.label,
            icon: group.icon,
            children: items.map((item) => ({
              name: item.label,
              path: item.route,
              permission: item.permission,
              disabled: item.disabled,
            })),
          } as MenuItem;
        })
        .filter(Boolean) as MenuItem[];

      return filteredMenus;
    }
    if (code === "FINANCE") return financeMenus;
    if (code === "INVENTORY") return inventoryMenus;
    if (code === "INVOICE_CENTER") return invoiceCenterMenus;
    if (code === "COMPLIANCE_CENTER" || code === "COMPLIANCE") return complianceCenterMenus;
    return [
      {
        name: "Dashboard",
        path: `/${code?.toLowerCase().replace("_", "-")}/dashboard`,
        icon: LayoutDashboard,
      },
    ];
  };

  const filterMenusByPermission = (menuList: MenuItem[]): MenuItem[] => {
    return menuList
      .map((item) => {
        // If it's a leaf node, check permission
        if (!item.children) {
          if (item.permission && !hasPermission(item.permission)) return null;
          return item;
        }

        // If it has children, recursively filter them
        const filteredChildren = item.children.filter((child) => 
          !child.permission || hasPermission(child.permission)
        );

        if (filteredChildren.length === 0) {
          // Hide parent if all children are restricted and it doesn't have a path
          if (!item.path) return null;
        }

        return { ...item, children: filteredChildren };
      })
      .filter(Boolean) as MenuItem[];
  };

  const menus = filterMenusByPermission(getMenus());
  const isPathActive = (path?: string) => {
    if (!path) return false;
    if (location.pathname === path) return true;
    if (path !== "/" && location.pathname.startsWith(path + "/")) return true;
    return false;
  };

  React.useEffect(() => {
    const match = menus.find(
      (m) =>
        m.children && m.children.some((c) => isPathActive(c.path))
    );
    if (match) {
      setOpenAccordion(match.name);
    }
  }, [location.pathname, activeSoftware]);

  // Close mobile drawer on nav
  React.useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const initials = (user?.name || user?.full_name || "U")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const renderMenu = (menu: MenuItem, isMobile = false) => {
    const hasChildren = !!menu.children && menu.children.length > 0;
    const isAccordionOpen = openAccordion === menu.name;
    const isActiveParent = hasChildren
      ? menu.children!.some((c) => isPathActive(c.path))
      : isPathActive(menu.path);
    const showExpanded = isMobile || effectiveExpanded;

    if (!hasChildren) {
      const isActive = isPathActive(menu.path);
      return (
        <PermissionGuard key={menu.path} permission={menu.permission}>
          <NavLink
            to={menu.path || "#"}
            title={!showExpanded ? menu.name : undefined}
            className={() =>
              `group relative flex items-center gap-3 rounded-xl transition-all duration-150 ${
                showExpanded ? "mx-3 h-11 px-3" : "mx-auto h-11 w-11 justify-center"
              } ${
                isActive
                  ? "bg-indigo-50 font-semibold text-indigo-600"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`
            }
          >
            {() => (
              <>
                <menu.icon
                  className={`h-5 w-5 shrink-0 transition-colors ${
                    isActive
                      ? "text-indigo-600"
                      : "text-slate-400 group-hover:text-slate-600"
                  }`}
                />
                {showExpanded && (
                  <span
                    className={`truncate text-sm transition-colors ${
                      isActive
                        ? "text-indigo-600 font-semibold"
                        : "text-slate-600 group-hover:text-slate-800"
                    }`}
                  >
                    {menu.name}
                  </span>
                )}
                {!showExpanded && isActive && (
                  <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-white/90" />
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
            if (!showExpanded && !isMobile) setIsExpanded(true);
            setOpenAccordion(isAccordionOpen ? null : menu.name);
          }}
          className={`group relative flex w-[auto] items-center gap-3 rounded-xl transition-all duration-150 ${
            showExpanded ? "mx-3 h-11 px-3" : "mx-auto h-11 w-11 justify-center"
          } ${
            isActiveParent
              ? "bg-indigo-50 font-semibold text-indigo-600"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
          }`}
        >
          <menu.icon
            className={`h-5 w-5 shrink-0 transition-colors ${
              isActiveParent
                ? "text-indigo-600"
                : "text-slate-400 group-hover:text-slate-600"
            }`}
          />
          {showExpanded && (
            <>
              <span
                className={`flex-1 truncate text-left text-sm transition-colors ${
                  isActiveParent ? "text-indigo-600 font-semibold" : "text-slate-600 group-hover:text-slate-800"
                }`}
              >
                {menu.name}
              </span>
              <ChevronRight
                className={`h-3.5 w-3.5 text-[#6B7280] transition-transform duration-200 ${
                  isAccordionOpen
                    ? isActiveParent
                      ? "rotate-90 text-white"
                      : "rotate-90 text-[#002137]"
                    : ""
                }`}
              />
            </>
          )}
        </button>
        <div
          className={`grid transition-all duration-300 ease-in-out ${
            showExpanded && isAccordionOpen
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="ml-5.5 mt-1 flex flex-col gap-1 border-l border-slate-200/80 pl-6 pr-1.5">
              {menu.children!.map((child) => {
                if (child.disabled) {
                  return (
                    <PermissionGuard
                      key={child.path}
                      permission={child.permission}
                    >
                      <div className="flex cursor-not-allowed items-center justify-between rounded-lg px-3 py-1.5 text-xs font-medium text-[#9CA3AF] opacity-60">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <span className="bg-muted-foreground/20 h-1.5 w-1.5 shrink-0 rounded-full" />
                          <span className="truncate">{child.name}</span>
                        </div>
                        <span className="ml-1 shrink-0 rounded-full border border-slate-200 bg-slate-100 px-1.5 py-0.5 text-[9px] text-[#374151]">
                          Soon
                        </span>
                      </div>
                    </PermissionGuard>
                  );
                }
                const isActive = isPathActive(child.path);
                return (
                  <PermissionGuard key={child.path} permission={child.permission}>
                    <NavLink
                      to={child.path}
                      className={() =>
                        `flex items-center gap-2.5 rounded-lg px-3 py-2 mx-3 text-xs transition-all duration-150 ${
                          isActive
                            ? "bg-indigo-50 font-semibold text-indigo-600"
                            : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                        }`
                      }
                    >
                      {() => (
                        <>
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              isActive ? "bg-indigo-600" : "bg-slate-300"
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
          </div>
        </div>
      </div>
    );
  };

  // ── Sidebar Content (shared between desktop & mobile) ──
  const companyInitials = (company?.company_name || "Pharma ERP")
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);


  const sidebarContent = (isMobile = false) => {
    const collapsed = !isMobile && !effectiveExpanded;
    return (
    <>
      {/* Logo area */}
      <div
        className={`flex h-14 shrink-0 items-center gap-3 border-b border-slate-200/70 transition-all duration-300 ${
          isMobile || effectiveExpanded ? "px-5" : "justify-center px-2"
        }`}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-transparent bg-[#4854CC] shadow-sm overflow-hidden">
          {collapsed ? (
            <span className="text-white font-bold text-sm tracking-wider">{companyInitials}</span>
          ) : company?.logo_url ? (
            <img src={company.logo_url} alt="Company Logo" className="h-full w-full object-cover" />
          ) : (
            <span className="text-white font-bold text-sm tracking-wider">{companyInitials}</span>
          )}
        </div>
        {(isMobile || effectiveExpanded) && (
          <div className="flex min-w-0 flex-1 items-center justify-between overflow-hidden">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold leading-tight tracking-tight text-[#111827]">
                {company?.company_name || "Pharma ERP"}
              </p>
              <p className="truncate text-[10px] font-semibold uppercase tracking-[0.08em] text-[#6B7280]">
                {activeSoftware?.software_name || "Platform"}
              </p>
            </div>
            {isMobile ? (
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-1.5 text-[#6B7280] transition-colors hover:bg-slate-100/80 hover:text-[#002137]"
                aria-label="Close sidebar"
              >
                <X className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => setIsPinned(!isPinned)}
                className="rounded-lg p-1.5 text-[#6B7280] transition-colors hover:bg-slate-100/80 hover:text-[#002137]"
                title={isPinned ? "Unpin sidebar" : "Pin sidebar"}
              >
                {isPinned ? (
                  <PinOff className="h-4 w-4" />
                ) : (
                  <Pin className="h-4 w-4" />
                )}
              </button>
            )}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav
        className={`scrollbar-none flex-1 space-y-1 overflow-y-auto py-3 transition-all duration-300 ${
          isMobile || effectiveExpanded ? "px-3" : "px-2"
        }`}
      >
        {menus.map((m) => renderMenu(m, isMobile))}
      </nav>

      {/* User info at bottom */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div
            className={`mt-auto h-14 cursor-pointer border-t border-slate-200/70 transition-all duration-300 hover:bg-slate-100/80 flex items-center ${
              isMobile || effectiveExpanded
                ? "px-4"
                : "justify-center px-2"
            }`}
          >
            {isMobile || effectiveExpanded ? (
              <div className="flex min-w-0 items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-transparent bg-[#4854CC] text-xs font-bold text-white">
                  {initials}
                </div>
                <div className="min-w-0 overflow-hidden">
                  <p className="truncate text-xs font-semibold leading-tight text-[#111827]">
                    {user?.name || user?.full_name || "User"}
                  </p>
                  <p className="truncate text-[10px] leading-tight text-[#6B7280]">
                    {activeBranch?.branch_name ||
                      activeBranch?.branch?.branch_name ||
                      "Head Office"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-transparent bg-[#4854CC] text-xs font-bold text-white shadow-sm">
                {initials}
              </div>
            )}
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          side="top"
          align={isMobile || effectiveExpanded ? "start" : "center"}
          className="mb-2 w-56 border-slate-200/80 bg-white/90 shadow-[0_8px_30px_rgba(2,62,138,0.08)] backdrop-blur-xl"
        >
          <DropdownMenuLabel>My Account</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-slate-200/80" />
          <DropdownMenuItem className="cursor-pointer hover:bg-slate-100/80">
            <User className="mr-2 h-4 w-4" />
            <span>Profile Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer hover:bg-slate-100/80">
            <Settings className="mr-2 h-4 w-4" />
            <span>Preferences</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-slate-200/80" />
          <DropdownMenuItem className="cursor-pointer text-red-600 hover:bg-red-50 hover:text-red-700   ">
            <LogOut className="mr-2 h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
    );
  };

  return (
    <>
      {/* ── Desktop Sidebar (hidden on mobile) ── */}
      <div
        className={`ease-[cubic-bezier(0.4,0,0.2,1)] relative z-30 hidden h-full shrink-0 transition-all duration-300 lg:block ${
          effectiveExpanded ? "w-[260px]" : "w-[72px]"
        }`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => {
          if (!isPinned) setIsExpanded(false);
        }}
      >
        <div
          className={`ease-[cubic-bezier(0.4,0,0.2,1)] fixed bottom-4 left-4 top-4 z-30 flex flex-col overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-xl shadow-slate-200/40 transition-all duration-300 ${
            effectiveExpanded ? "w-[260px]" : "w-[72px]"
          }`}
        >
          {sidebarContent(false)}
        </div>
      </div>

      {/* ── Mobile Sidebar Drawer (hidden on desktop) ── */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          className="flex w-72 flex-col border-r border-slate-200/70 bg-white/70 p-0 backdrop-blur-xl"
        >
          {sidebarContent(true)}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Sidebar;
