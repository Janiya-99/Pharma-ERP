import React from "react";

// Auth
import SignIn from "views/auth/SignIn";

// Dashboard
import Dashboard from "views/admin/dashboard";
import LandingPage from "views/admin/landing";

// Control Center
import ControlCenterDashboard from "views/admin/control-center/ControlCenterDashboard";
import CompanyPage from "views/admin/control-center/CompanyPage";
import BranchPage from "views/admin/control-center/BranchPage";
import UsersPage from "views/admin/control-center/UsersPage";
import RolesPage from "views/admin/control-center/RolesPage";
import DesignationsPage from "views/admin/control-center/DesignationsPage";
import SettingsPage from "views/admin/control-center/SettingsPage";
import AuditLogsPage from "views/admin/control-center/AuditLogsPage";

// Finance
import FinanceDashboard from "views/admin/finance/FinanceDashboard";
import ChartOfAccountsPage from "views/admin/finance/ChartOfAccountsPage";
import JournalEntriesPage from "views/admin/finance/JournalEntriesPage";
import PaymentsPage from "views/admin/finance/PaymentsPage";
import ReceiptsPage from "views/admin/finance/ReceiptsPage";
import BankPage from "views/admin/finance/BankPage";
import TaxPage from "views/admin/finance/TaxPage";
import FinanceReportsPage from "views/admin/finance/FinanceReportsPage";
import GeneralLedgerPage from "views/admin/finance/GeneralLedgerPage";

// Inventory
import InventoryDashboard from "views/admin/inventory/InventoryDashboard";
import ProductsPage from "views/admin/inventory/ProductsPage";
import BatchesPage from "views/admin/inventory/BatchesPage";
import WarehousesPage from "views/admin/inventory/WarehousesPage";
import GRNPage from "views/admin/inventory/GRNPage";
import StockTransferPage from "views/admin/inventory/StockTransferPage";
import StockAdjustmentPage from "views/admin/inventory/StockAdjustmentPage";
import StockLedgerPage from "views/admin/inventory/StockLedgerPage";

// Invoice Center
import InvoiceDashboard from "views/admin/invoice-center/InvoiceDashboard";
import SalesOrdersPage from "views/admin/invoice-center/SalesOrdersPage";
import InvoicesPage from "views/admin/invoice-center/InvoicesPage";
import CreditNotesPage from "views/admin/invoice-center/CreditNotesPage";
import DebitNotesPage from "views/admin/invoice-center/DebitNotesPage";
import CustomerReceiptsPage from "views/admin/invoice-center/CustomerReceiptsPage";

// Compliance Center
import ComplianceDashboard from "views/admin/compliance/ComplianceDashboard";
import LicenseDocumentsPage from "views/admin/compliance/LicenseDocumentsPage";
import BatchRecallPage from "views/admin/compliance/BatchRecallPage";
import BatchHoldPage from "views/admin/compliance/BatchHoldPage";
import ExpiryDisposalPage from "views/admin/compliance/ExpiryDisposalPage";
import RegulatoryRecordsPage from "views/admin/compliance/RegulatoryRecordsPage";

// Icons
import {
  MdDashboard,
  MdLock,
  MdOutlineAdminPanelSettings,
  MdOutlineAccountBalance,
  MdInventory2,
  MdOutlineReceiptLong,
  MdOutlineVerifiedUser,
} from "react-icons/md";

export type SubRoute = {
  name: string;
  path: string;
  component: JSX.Element;
};

export type ERPRoute = {
  name: string;
  layout: string;
  path: string;
  icon: JSX.Element;
  component?: JSX.Element;
  secondary?: boolean;
  children?: SubRoute[];
};

const routes: ERPRoute[] = [
  {
    name: "Home",
    layout: "/admin",
    path: "home",
    icon: <MdDashboard className="h-5 w-5" />,
    component: <LandingPage />,
    secondary: true, // Hidden from sidebar
  },
  {
    name: "Dashboard",
    layout: "/admin",
    path: "dashboard",
    icon: <MdDashboard className="h-5 w-5" />,
    component: <Dashboard />,
  },
  {
    name: "Control Center",
    layout: "/admin",
    path: "control-center",
    icon: <MdOutlineAdminPanelSettings className="h-5 w-5" />,
    children: [
      { name: "Dashboard", path: "control-center/dashboard", component: <ControlCenterDashboard /> },
      { name: "Company", path: "control-center/company", component: <CompanyPage /> },
      { name: "Branches", path: "control-center/branches", component: <BranchPage /> },
      { name: "Users", path: "control-center/users", component: <UsersPage /> },
      { name: "Roles & Permissions", path: "control-center/roles", component: <RolesPage /> },
      { name: "Designations", path: "control-center/designations", component: <DesignationsPage /> },
      { name: "Settings", path: "control-center/settings", component: <SettingsPage /> },
      { name: "Audit Logs", path: "control-center/audit-logs", component: <AuditLogsPage /> },
    ],
  },
  {
    name: "Finance",
    layout: "/admin",
    path: "finance",
    icon: <MdOutlineAccountBalance className="h-5 w-5" />,
    children: [
      { name: "Dashboard", path: "finance/dashboard", component: <FinanceDashboard /> },
      { name: "Chart of Accounts", path: "finance/chart-of-accounts", component: <ChartOfAccountsPage /> },
      { name: "Journal Entries", path: "finance/journals", component: <JournalEntriesPage /> },
      { name: "General Ledger", path: "finance/general-ledger", component: <GeneralLedgerPage /> },
      { name: "Payments", path: "finance/payments", component: <PaymentsPage /> },
      { name: "Receipts", path: "finance/receipts", component: <ReceiptsPage /> },
      { name: "Bank", path: "finance/bank", component: <BankPage /> },
      { name: "Tax", path: "finance/tax", component: <TaxPage /> },
      { name: "Reports", path: "finance/reports", component: <FinanceReportsPage /> },
    ],
  },
  {
    name: "Inventory",
    layout: "/admin",
    path: "inventory",
    icon: <MdInventory2 className="h-5 w-5" />,
    children: [
      { name: "Dashboard", path: "inventory/dashboard", component: <InventoryDashboard /> },
      { name: "Products", path: "inventory/products", component: <ProductsPage /> },
      { name: "Batches", path: "inventory/batches", component: <BatchesPage /> },
      { name: "Warehouses", path: "inventory/warehouses", component: <WarehousesPage /> },
      { name: "GRN", path: "inventory/grn", component: <GRNPage /> },
      { name: "Stock Transfer", path: "inventory/stock-transfer", component: <StockTransferPage /> },
      { name: "Stock Adjustment", path: "inventory/stock-adjustment", component: <StockAdjustmentPage /> },
      { name: "Stock Ledger", path: "inventory/stock-ledger", component: <StockLedgerPage /> },
    ],
  },
  {
    name: "Invoice Center",
    layout: "/admin",
    path: "invoice-center",
    icon: <MdOutlineReceiptLong className="h-5 w-5" />,
    children: [
      { name: "Dashboard", path: "invoice-center/dashboard", component: <InvoiceDashboard /> },
      { name: "Sales Orders", path: "invoice-center/sales-orders", component: <SalesOrdersPage /> },
      { name: "Invoices", path: "invoice-center/invoices", component: <InvoicesPage /> },
      { name: "Credit Notes", path: "invoice-center/credit-notes", component: <CreditNotesPage /> },
      { name: "Debit Notes", path: "invoice-center/debit-notes", component: <DebitNotesPage /> },
      { name: "Customer Receipts", path: "invoice-center/receipts", component: <CustomerReceiptsPage /> },
    ],
  },
  {
    name: "Compliance Center",
    layout: "/admin",
    path: "compliance",
    icon: <MdOutlineVerifiedUser className="h-5 w-5" />,
    children: [
      { name: "Dashboard", path: "compliance/dashboard", component: <ComplianceDashboard /> },
      { name: "License Documents", path: "compliance/licenses", component: <LicenseDocumentsPage /> },
      { name: "Batch Recall", path: "compliance/batch-recall", component: <BatchRecallPage /> },
      { name: "Batch Hold", path: "compliance/batch-hold", component: <BatchHoldPage /> },
      { name: "Expiry Disposal", path: "compliance/expiry-disposal", component: <ExpiryDisposalPage /> },
      { name: "Regulatory Records", path: "compliance/regulatory", component: <RegulatoryRecordsPage /> },
    ],
  },
  {
    name: "Sign In",
    layout: "/auth",
    path: "sign-in",
    icon: <MdLock className="h-5 w-5" />,
    component: <SignIn />,
  },
];

export default routes;
