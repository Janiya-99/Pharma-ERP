import React from "react";

// Auth
import SignIn from "views/auth/SignIn";

// Dashboard
import Dashboard from "views/admin/dashboard";
import LandingPage from "views/admin/landing";

// Control Center — new pages
import SoftwareModulesPage from "pages/control-center/software-modules/SoftwareModulesPage";
import SettingsPage from "pages/control-center/settings/SettingsPage";

// Control Center — new pages
import ControlCenterDashboardPage from "pages/control-center/dashboard/ControlCenterDashboardPage";
import OrganizationSetupPage from "pages/control-center/organization/OrganizationSetupPage";
import UsersPage from "pages/control-center/users/UsersPage";
import UserCreatePage from "pages/control-center/users/UserCreatePage";
import UserDetailsPage from "pages/control-center/users/UserDetailsPage";
import RolesPermissionsPage from "pages/control-center/roles-permissions/RolesPermissionsPage";
import AccessMatrixPage from "pages/control-center/access-matrix/AccessMatrixPage";
import AuditLogsPage from "pages/control-center/logs/AuditLogsPage";
import LoginLogsPage from "pages/control-center/logs/LoginLogsPage";

// Finance
import FinanceDashboard from "views/admin/finance/FinanceDashboard";
import FinancialYearsPage from "views/admin/finance/financial-years/FinancialYearsPage";
import AccountingPeriodsPage from "views/admin/finance/accounting-periods/AccountingPeriodsPage";
import AccountClassificationsPage from "views/admin/finance/account-classifications/AccountClassificationsPage";
import ChartOfAccountsPage from "views/admin/finance/chart-of-accounts/ChartOfAccountsPage";
import OpeningBalancesPage from "views/admin/finance/opening-balances/OpeningBalancesPage";
import JournalEntriesPage from "pages/finance/journal-entries/JournalEntriesPage";
import JournalEntryFormPage from "pages/finance/journal-entries/JournalEntryFormPage";
import JournalEntryDetailsPage from "pages/finance/journal-entries/JournalEntryDetailsPage";
import PaymentVouchersPage from "pages/finance/payment-vouchers/PaymentVouchersPage";
import PaymentVoucherFormPage from "pages/finance/payment-vouchers/PaymentVoucherFormPage";
import PaymentVoucherDetailsPage from "pages/finance/payment-vouchers/PaymentVoucherDetailsPage";
import ReceiptVouchersPage from "pages/finance/receipt-vouchers/ReceiptVouchersPage";
import ReceiptVoucherFormPage from "pages/finance/receipt-vouchers/ReceiptVoucherFormPage";
import ReceiptVoucherDetailsPage from "pages/finance/receipt-vouchers/ReceiptVoucherDetailsPage";
import BankAccountsPage from "pages/finance/bank-accounts/BankAccountsPage";
import BankAccountFormPage from "pages/finance/bank-accounts/BankAccountFormPage";
import BankAccountDetailsPage from "pages/finance/bank-accounts/BankAccountDetailsPage";
import ChequeBooksPage from "pages/finance/cheque-books/ChequeBooksPage";
import ChequeBookFormPage from "pages/finance/cheque-books/ChequeBookFormPage";
import ChequeBookDetailsPage from "pages/finance/cheque-books/ChequeBookDetailsPage";
import BankTransactionsPage from "pages/finance/bank-transactions/BankTransactionsPage";
import BankTransactionFormPage from "pages/finance/bank-transactions/BankTransactionFormPage";
import BankTransactionDetailsPage from "pages/finance/bank-transactions/BankTransactionDetailsPage";
import BankReconciliationsPage from "pages/finance/bank-reconciliations/BankReconciliationsPage";
import BankReconciliationFormPage from "pages/finance/bank-reconciliations/BankReconciliationFormPage";
import BankReconciliationDetailsPage from "pages/finance/bank-reconciliations/BankReconciliationDetailsPage";
import PettyCashFundsPage from "pages/finance/petty-cash-funds/PettyCashFundsPage";
import PettyCashFundFormPage from "pages/finance/petty-cash-funds/PettyCashFundFormPage";
import PettyCashFundDetailsPage from "pages/finance/petty-cash-funds/PettyCashFundDetailsPage";
import PettyCashVouchersPage from "pages/finance/petty-cash-vouchers/PettyCashVouchersPage";
import PettyCashVoucherFormPage from "pages/finance/petty-cash-vouchers/PettyCashVoucherFormPage";
import PettyCashVoucherDetailsPage from "pages/finance/petty-cash-vouchers/PettyCashVoucherDetailsPage";
import PettyCashReplenishmentsPage from "pages/finance/petty-cash-replenishments/PettyCashReplenishmentsPage";
import PettyCashReplenishmentFormPage from "pages/finance/petty-cash-replenishments/PettyCashReplenishmentFormPage";
import PettyCashReplenishmentDetailsPage from "pages/finance/petty-cash-replenishments/PettyCashReplenishmentDetailsPage";

// Inventory
import InventoryDashboard from "views/admin/inventory/InventoryDashboard";
import ProductsPage from "views/admin/inventory/ProductsPage";
import BatchesPage from "views/admin/inventory/BatchesPage";
import WarehousesPage from "views/admin/inventory/WarehousesPage";
import GRNsPage from "pages/inventory/grns/GRNsPage";
import GRNFormPage from "pages/inventory/grns/GRNFormPage";
import GRNDetailsPage from "pages/inventory/grns/GRNDetailsPage";
import StockTransfersPage from "pages/inventory/stock-transfers/StockTransfersPage";
import StockTransferFormPage from "pages/inventory/stock-transfers/StockTransferFormPage";
import StockTransferDetailsPage from "pages/inventory/stock-transfers/StockTransferDetailsPage";
import StockAdjustmentsPage from "pages/inventory/stock-adjustments/StockAdjustmentsPage";
import StockAdjustmentFormPage from "pages/inventory/stock-adjustments/StockAdjustmentFormPage";
import StockAdjustmentDetailsPage from "pages/inventory/stock-adjustments/StockAdjustmentDetailsPage";
import StockLedgerPage from "views/admin/inventory/StockLedgerPage";
import OpeningStockEntriesPage from "pages/inventory/opening-stock/OpeningStockEntriesPage";
import OpeningStockEntryFormPage from "pages/inventory/opening-stock/OpeningStockEntryFormPage";
import OpeningStockEntryDetailsPage from "pages/inventory/opening-stock/OpeningStockEntryDetailsPage";

// Invoice Center
import InvoiceDashboard from "views/admin/invoice-center/InvoiceDashboard";
import SalesOrdersPage from "views/admin/invoice-center/SalesOrdersPage";
import InvoicesPage from "views/admin/invoice-center/InvoicesPage";
import CreditNotesPage from "views/admin/invoice-center/CreditNotesPage";
import DebitNotesPage from "views/admin/invoice-center/DebitNotesPage";
import CustomerReceiptsPage from "pages/invoice-center/customer-receipts/CustomerReceiptsPage";
import CustomerReceiptFormPage from "pages/invoice-center/customer-receipts/CustomerReceiptFormPage";
import CustomerReceiptDetailsPage from "pages/invoice-center/customer-receipts/CustomerReceiptDetailsPage";
import InvoiceCenterFinanceSettingsPage from "pages/invoice-center/finance-settings/InvoiceCenterFinanceSettingsPage";
import InvoiceCenterFinancePostingPage from "pages/invoice-center/finance-posting/InvoiceCenterFinancePostingPage";

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
  section?: string;   // Section header label for grouping in sidebar
  hide?: boolean;     // Hide from sidebar navigation
  icon?: JSX.Element; // Optional icon for child items
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
    component: <ControlCenterDashboardPage />,
  },
  {
    name: "Organization Setup",
    layout: "/admin",
    path: "organization-setup",
    icon: <MdOutlineAccountBalance className="h-5 w-5" />,
    children: [
      { name: "Company", path: "control-center/company", component: <OrganizationSetupPage /> },
      { name: "Branches", path: "control-center/branches", component: <OrganizationSetupPage /> },
      { name: "Departments", path: "control-center/departments", component: <OrganizationSetupPage /> },
      { name: "Designations", path: "control-center/designations", component: <OrganizationSetupPage /> },
    ],
  },
  {
    name: "User & Access Center",
    layout: "/admin",
    path: "user-access-center",
    icon: <MdOutlineVerifiedUser className="h-5 w-5" />,
    children: [
      { name: "Users", path: "control-center/users", component: <UsersPage /> },
      { name: "Roles & Permissions", path: "control-center/roles-permissions", component: <RolesPermissionsPage /> },
      { name: "User Access", path: "control-center/user-access", component: <AccessMatrixPage /> },
      // Hidden user routes
      { name: "Create User", path: "control-center/users/create", component: <UserCreatePage />, hide: true },
      { name: "Edit User", path: "control-center/users/:id/edit", component: <UserCreatePage />, hide: true },
      { name: "User Details", path: "control-center/users/:id", component: <UserDetailsPage />, hide: true },
    ],
  },
  {
    name: "System Setup",
    layout: "/admin",
    path: "system-setup",
    icon: <MdOutlineAdminPanelSettings className="h-5 w-5" />,
    children: [
      { name: "Software Modules", path: "control-center/software-modules", component: <SoftwareModulesPage /> },
      { name: "Settings", path: "control-center/settings", component: <SettingsPage /> },
    ],
  },
  {
    name: "Audit & Security",
    layout: "/admin",
    path: "audit-security",
    icon: <MdOutlineReceiptLong className="h-5 w-5" />,
    children: [
      { name: "Audit Logs", path: "control-center/audit-logs", component: <AuditLogsPage /> },
      { name: "Login Logs", path: "control-center/login-logs", component: <LoginLogsPage /> },
    ],
  },
  {
    name: "Finance",
    layout: "/admin",
    path: "finance",
    icon: <MdOutlineAccountBalance className="h-5 w-5" />,
    secondary: true,
    children: [
      { name: "Dashboard", path: "finance/dashboard", component: <FinanceDashboard /> },
      { name: "Financial Years", path: "finance/financial-years", component: <FinancialYearsPage /> },
      { name: "Accounting Periods", path: "finance/accounting-periods", component: <AccountingPeriodsPage /> },
      { name: "Account Classifications", path: "finance/account-classifications", component: <AccountClassificationsPage /> },
      { name: "Chart of Accounts", path: "finance/chart-of-accounts", component: <ChartOfAccountsPage /> },
      { name: "Opening Balances", path: "finance/opening-balances", component: <OpeningBalancesPage /> },
      { name: "Journal Entries", path: "finance/journal-entries", component: <JournalEntriesPage /> },
      { name: "Create Journal Entry", path: "finance/journal-entries/create", component: <JournalEntryFormPage />, hide: true },
      { name: "Edit Journal Entry", path: "finance/journal-entries/:id/edit", component: <JournalEntryFormPage />, hide: true },
      { name: "Journal Entry Details", path: "finance/journal-entries/:id", component: <JournalEntryDetailsPage />, hide: true },
      { name: "Payment Vouchers", path: "finance/payment-vouchers", component: <PaymentVouchersPage /> },
      { name: "Create Payment Voucher", path: "finance/payment-vouchers/create", component: <PaymentVoucherFormPage />, hide: true },
      { name: "Edit Payment Voucher", path: "finance/payment-vouchers/:id/edit", component: <PaymentVoucherFormPage />, hide: true },
      { name: "Payment Voucher Details", path: "finance/payment-vouchers/:id", component: <PaymentVoucherDetailsPage />, hide: true },
      { name: "Receipt Vouchers", path: "finance/receipt-vouchers", component: <ReceiptVouchersPage /> },
      { name: "Create Receipt Voucher", path: "finance/receipt-vouchers/create", component: <ReceiptVoucherFormPage />, hide: true },
      { name: "Edit Receipt Voucher", path: "finance/receipt-vouchers/:id/edit", component: <ReceiptVoucherFormPage />, hide: true },
      { name: "Receipt Voucher Details", path: "finance/receipt-vouchers/:id", component: <ReceiptVoucherDetailsPage />, hide: true },
      { name: "Bank Accounts", path: "finance/bank-accounts", component: <BankAccountsPage /> },
      { name: "Create Bank Account", path: "finance/bank-accounts/create", component: <BankAccountFormPage />, hide: true },
      { name: "Edit Bank Account", path: "finance/bank-accounts/:id/edit", component: <BankAccountFormPage />, hide: true },
      { name: "Bank Account Details", path: "finance/bank-accounts/:id", component: <BankAccountDetailsPage />, hide: true },
      { name: "Cheque Books", path: "finance/cheque-books", component: <ChequeBooksPage /> },
      { name: "Create Cheque Book", path: "finance/cheque-books/create", component: <ChequeBookFormPage />, hide: true },
      { name: "Edit Cheque Book", path: "finance/cheque-books/:id/edit", component: <ChequeBookFormPage />, hide: true },
      { name: "Cheque Book Details", path: "finance/cheque-books/:id", component: <ChequeBookDetailsPage />, hide: true },
      { name: "Bank Transactions", path: "finance/bank-transactions", component: <BankTransactionsPage /> },
      { name: "Create Bank Transaction", path: "finance/bank-transactions/create", component: <BankTransactionFormPage />, hide: true },
      { name: "Edit Bank Transaction", path: "finance/bank-transactions/:id/edit", component: <BankTransactionFormPage />, hide: true },
      { name: "Bank Transaction Details", path: "finance/bank-transactions/:id", component: <BankTransactionDetailsPage />, hide: true },
      { name: "Bank Reconciliations", path: "finance/bank-reconciliations", component: <BankReconciliationsPage /> },
      { name: "Create Bank Reconciliation", path: "finance/bank-reconciliations/create", component: <BankReconciliationFormPage />, hide: true },
      { name: "Edit Bank Reconciliation", path: "finance/bank-reconciliations/:id/edit", component: <BankReconciliationFormPage />, hide: true },
      { name: "Bank Reconciliation Details", path: "finance/bank-reconciliations/:id", component: <BankReconciliationDetailsPage />, hide: true },
      { name: "Petty Cash Funds", path: "finance/petty-cash-funds", component: <PettyCashFundsPage /> },
      { name: "Create Petty Cash Fund", path: "finance/petty-cash-funds/create", component: <PettyCashFundFormPage />, hide: true },
      { name: "Edit Petty Cash Fund", path: "finance/petty-cash-funds/:id/edit", component: <PettyCashFundFormPage />, hide: true },
      { name: "Petty Cash Fund Details", path: "finance/petty-cash-funds/:id", component: <PettyCashFundDetailsPage />, hide: true },
      { name: "Petty Cash Vouchers", path: "finance/petty-cash-vouchers", component: <PettyCashVouchersPage /> },
      { name: "Create Petty Cash Voucher", path: "finance/petty-cash-vouchers/create", component: <PettyCashVoucherFormPage />, hide: true },
      { name: "Edit Petty Cash Voucher", path: "finance/petty-cash-vouchers/:id/edit", component: <PettyCashVoucherFormPage />, hide: true },
      { name: "Petty Cash Voucher Details", path: "finance/petty-cash-vouchers/:id", component: <PettyCashVoucherDetailsPage />, hide: true },
      { name: "Petty Cash Replenishments", path: "finance/petty-cash-replenishments", component: <PettyCashReplenishmentsPage /> },
      { name: "Create Replenishment", path: "finance/petty-cash-replenishments/create", component: <PettyCashReplenishmentFormPage />, hide: true },
      { name: "Edit Replenishment", path: "finance/petty-cash-replenishments/:id/edit", component: <PettyCashReplenishmentFormPage />, hide: true },
      { name: "Replenishment Details", path: "finance/petty-cash-replenishments/:id", component: <PettyCashReplenishmentDetailsPage />, hide: true },
    ],
  },
  {
    name: "Inventory",
    layout: "/admin",
    path: "inventory",
    icon: <MdInventory2 className="h-5 w-5" />,
    secondary: true,
    children: [
      { name: "Dashboard", path: "inventory/dashboard", component: <InventoryDashboard /> },
      { name: "Products", path: "inventory/products", component: <ProductsPage /> },
      { name: "Batches", path: "inventory/batches", component: <BatchesPage /> },
      { name: "Warehouses", path: "inventory/warehouses", component: <WarehousesPage /> },
      { name: "GRN", path: "inventory/grns", component: <GRNsPage /> },
      { name: "Create GRN", path: "inventory/grns/create", component: <GRNFormPage />, hide: true },
      { name: "Edit GRN", path: "inventory/grns/:id/edit", component: <GRNFormPage />, hide: true },
      { name: "GRN Details", path: "inventory/grns/:id", component: <GRNDetailsPage />, hide: true },
      { name: "Stock Transfers", path: "inventory/stock-transfers", component: <StockTransfersPage /> },
      { name: "Create Stock Transfer", path: "inventory/stock-transfers/create", component: <StockTransferFormPage />, hide: true },
      { name: "Edit Stock Transfer", path: "inventory/stock-transfers/:id/edit", component: <StockTransferFormPage />, hide: true },
      { name: "Stock Transfer Details", path: "inventory/stock-transfers/:id", component: <StockTransferDetailsPage />, hide: true },
      { name: "Stock Adjustments", path: "inventory/stock-adjustments", component: <StockAdjustmentsPage /> },
      { name: "Create Stock Adjustment", path: "inventory/stock-adjustments/create", component: <StockAdjustmentFormPage />, hide: true },
      { name: "Edit Stock Adjustment", path: "inventory/stock-adjustments/:id/edit", component: <StockAdjustmentFormPage />, hide: true },
      { name: "Stock Adjustment Details", path: "inventory/stock-adjustments/:id", component: <StockAdjustmentDetailsPage />, hide: true },
      { name: "Stock Ledger", path: "inventory/stock-ledger", component: <StockLedgerPage /> },
      { name: "Opening Stock", path: "inventory/opening-stock", component: <OpeningStockEntriesPage /> },
      { name: "Create Opening Stock", path: "inventory/opening-stock/create", component: <OpeningStockEntryFormPage />, hide: true },
      { name: "Edit Opening Stock", path: "inventory/opening-stock/:id/edit", component: <OpeningStockEntryFormPage />, hide: true },
      { name: "Opening Stock Details", path: "inventory/opening-stock/:id", component: <OpeningStockEntryDetailsPage />, hide: true },
    ],
  },
  {
    name: "Invoice Center",
    layout: "/admin",
    path: "invoice-center",
    icon: <MdOutlineReceiptLong className="h-5 w-5" />,
    secondary: true,
    children: [
      { name: "Dashboard", path: "invoice-center/dashboard", component: <InvoiceDashboard /> },
      { name: "Sales Orders", path: "invoice-center/sales-orders", component: <SalesOrdersPage /> },
      { name: "Invoices", path: "invoice-center/invoices", component: <InvoicesPage /> },
      { name: "Credit Notes", path: "invoice-center/credit-notes", component: <CreditNotesPage /> },
      { name: "Debit Notes", path: "invoice-center/debit-notes", component: <DebitNotesPage /> },
      { name: "Customer Receipts", path: "invoice-center/customer-receipts", component: <CustomerReceiptsPage /> },
      { name: "Create Customer Receipt", path: "invoice-center/customer-receipts/create", component: <CustomerReceiptFormPage />, hide: true },
      { name: "Edit Customer Receipt", path: "invoice-center/customer-receipts/:id/edit", component: <CustomerReceiptFormPage />, hide: true },
      { name: "Customer Receipt Details", path: "invoice-center/customer-receipts/:id", component: <CustomerReceiptDetailsPage />, hide: true },
      { name: "Finance Settings", path: "invoice-center/finance-settings", component: <InvoiceCenterFinanceSettingsPage />, section: "Finance Integration" },
      { name: "Finance Posting", path: "invoice-center/finance-posting", component: <InvoiceCenterFinancePostingPage />, section: "Finance Integration" },
      { name: "Pending Postings", path: "invoice-center/finance-posting/pending", component: <InvoiceCenterFinancePostingPage />, hide: true },
      { name: "Posting History", path: "invoice-center/finance-posting/history", component: <InvoiceCenterFinancePostingPage />, hide: true },
    ],
  },
  {
    name: "Compliance Center",
    layout: "/admin",
    path: "compliance",
    icon: <MdOutlineVerifiedUser className="h-5 w-5" />,
    secondary: true,
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
