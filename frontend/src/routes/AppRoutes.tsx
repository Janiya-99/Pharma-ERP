import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../auth/ProtectedRoute";
import AppLayout from "../components/layout/AppLayout";
import LoginPage from "../pages/auth/LoginPage";

// Platform Admin imports
import {
  PlatformAuthProvider,
  usePlatformAuth,
} from "../auth/PlatformAuthContext";
import PlatformAdminLayout from "../components/layout/PlatformAdminLayout";
import PlatformAdminLoginPage from "../pages/platform-admin/PlatformAdminLoginPage";
import PlatformAdminDashboardPage from "../pages/platform-admin/PlatformAdminDashboardPage";
import {
  CompaniesPage,
  CompanyDetailsPage,
  CompanyEditPage,
  CompanyDatabasePage,
} from "../pages/platform-admin/CompaniesPages";
import CompanyCreatePage from "../pages/platform-admin/CompanyCreatePage";
import {
  SubscriptionPlansPage,
  SubscriptionPlanFormPage,
  CompanyLicensesPage,
  SubscriptionInvoicesPage,
  SubscriptionPaymentsPage,
  OutstandingBalancesPage,
} from "../pages/platform-admin/SubscriptionsBillingPages";
import {
  ERPModulesPage,
  ERPFeaturesPage,
  ERPVersionsPage,
  FeatureFlagsPage,
} from "../pages/platform-admin/SoftwareModulesPages";
import {
  PlatformUsersPage,
  PlatformRolesPage,
  PlatformPermissionsPage,
} from "../pages/platform-admin/PlatformUsersPages";
import {
  SoftwareCompanyProfilePage,
  BrandingSettingsPage,
  EmailSettingsPage,
  PaymentGatewaySettingsPage,
  BackupSettingsPage,
} from "../pages/platform-admin/GlobalSettingsPages";
import SupportTicketsPage from "../pages/platform-admin/SupportTicketsPage";
import {
  PlatformLoginLogsPage,
  PlatformAuditLogsPage,
} from "../pages/platform-admin/PlatformLogsPages";
import ControlCenterDashboardPage from "../pages/control-center/dashboard/ControlCenterDashboardPage";
import PlaceholderPage from "../pages/control-center/PlaceholderPage";

import CompanyProfilePage from "../pages/control-center/company/CompanyProfilePage";
import BranchesPage from "../pages/control-center/branches/BranchesPage";
import DepartmentsPage from "../pages/control-center/departments/DepartmentsPage";
import DesignationsPage from "../pages/control-center/designations/DesignationsPage";
import SoftwareModulesPage from "../pages/control-center/software-modules/SoftwareModulesPage";
import ModuleConnectionsPage from "../pages/control-center/module-connections/ModuleConnectionsPage";

import UsersPage from "../pages/control-center/users/UsersPage";
import UserCreatePage from "../pages/control-center/users/UserCreatePage";
import UserDetailsPage from "../pages/control-center/users/UserDetailsPage";
import UserBranchAccessPage from "../pages/control-center/user-access/UserBranchAccessPage";
import UserSoftwareAccessPage from "../pages/control-center/user-access/UserSoftwareAccessPage";

import RolesPermissionsPage from "../pages/control-center/roles-permissions/RolesPermissionsPage";
import AccessMatrixPage from "../pages/control-center/access-matrix/AccessMatrixPage";

import AuditLogsPage from "../pages/control-center/logs/AuditLogsPage";
import LoginLogsPage from "../pages/control-center/logs/LoginLogsPage";
import EffectiveAccessPage from "../pages/control-center/effective-access/EffectiveAccessPage";
import AccessAuditPage from "../pages/control-center/access-audit/AccessAuditPage";
import SecuritySettingsPage from "../pages/control-center/security-settings/SecuritySettingsPage";
import ApprovalSettingsPage from "../pages/control-center/approval-settings/ApprovalSettingsPage";
import DocumentNumberingPage from "../pages/control-center/document-numbering/DocumentNumberingPage";
import GeneralSettingsPage from "../pages/control-center/settings/GeneralSettingsPage";

// Finance General Ledger & Reports
import FinanceDashboardPage from "../pages/finance/dashboard/FinanceDashboardPage";
import ChartOfAccountsPage from "../pages/finance/chart-of-accounts/ChartOfAccountsPage";
import AccountGroupsPage from "../pages/finance/setup/AccountGroupsPage";
import {
  OpeningBalancesPage,
  FinancialYearPage,
  TaxSettingsPage,
  PaymentVouchersPage,
  ReceiptVouchersPage,
  BankReconciliationPage,
} from "../pages/finance/setup/FinanceFunctionalPages";
import JournalEntriesPage from "../pages/finance/journal-entries/JournalEntriesPage";
import JournalEntryFormPage from "../pages/finance/journal-entries/JournalEntryFormPage";
import {
  FixedAssetCategoriesPage,
  FixedAssetsPage,
  DepreciationRunsPage,
  AssetDisposalsPage,
} from "../pages/finance/fixed-assets/FixedAssetFunctionalPages";
import GeneralLedgerPage from "../pages/finance/general-ledger/GeneralLedgerPage";
import FinanceReportsDashboard from "../pages/finance/reports/FinanceReportsDashboard";
import AccountLedgerReportPage from "../pages/finance/reports/account-ledger/AccountLedgerReportPage";
import TrialBalanceReportPage from "../pages/finance/reports/trial-balance/TrialBalanceReportPage";
import ProfitLossReportPage from "../pages/finance/reports/profit-loss/ProfitLossReportPage";
import BalanceSheetReportPage from "../pages/finance/reports/balance-sheet/BalanceSheetReportPage";
import CashBookReportPage from "../pages/finance/reports/cash-book/CashBookReportPage";
import BankBookReportPage from "../pages/finance/reports/bank-book/BankBookReportPage";
import DayBookReportPage from "../pages/finance/reports/day-book/DayBookReportPage";
import JournalRegisterReportPage from "../pages/finance/reports/journal-register/JournalRegisterReportPage";
import PaymentRegisterReportPage from "../pages/finance/reports/payment-register/PaymentRegisterReportPage";
import ReceiptRegisterReportPage from "../pages/finance/reports/receipt-register/ReceiptRegisterReportPage";
import BankAccountsPage from "../pages/finance/banking/BankAccountsPage";
import CashAccountsPage from "../pages/finance/banking/CashAccountsPage";

// Inventory Module
import {
  BatchReportPage,
  ExpiryReportPage,
  GRNPage,
  InventoryDashboardPage,
  OpeningStockPage,
  ProductBatchesPage,
  ProductSetupPage,
  ProductsPage,
  PurchaseReturnsPage,
  SalesReturnsPage,
  StockAdjustmentsPage,
  StockBalanceReportPage,
  StockLedgerReportPage,
  StockTransfersPage,
  SuppliersPage,
  WarehousesAndLocationsPage,
} from "../pages/inventory/InventoryModule";
import ProductFormPage from "../pages/inventory/products/ProductFormPage";
import ProductDetailsPage from "../pages/inventory/products/ProductDetailsPage";
import ProductBatchFormPage from "../pages/inventory/product-batches/ProductBatchFormPage";
import ProductBatchDetailsPage from "../pages/inventory/product-batches/ProductBatchDetailsPage";
import StockTransferFormPage from "../pages/inventory/stock-transfers/StockTransferFormPage";
import StockTransferDetailsPage from "../pages/inventory/stock-transfers/StockTransferDetailsPage";
import StockAdjustmentFormPage from "../pages/inventory/stock-adjustments/StockAdjustmentFormPage";
import StockAdjustmentDetailsPage from "../pages/inventory/stock-adjustments/StockAdjustmentDetailsPage";
import PurchaseReturnFormPage from "../pages/inventory/purchase-returns/PurchaseReturnFormPage";
import PurchaseReturnDetailsPage from "../pages/inventory/purchase-returns/PurchaseReturnDetailsPage";
import SalesReturnFormPage from "../pages/inventory/sales-returns/SalesReturnFormPage";
import SalesReturnDetailsPage from "../pages/inventory/sales-returns/SalesReturnDetailsPage";
import GRNFormPage from "../pages/inventory/grns/GRNFormPage";
import GRNDetailsPage from "../pages/inventory/grns/GRNDetailsPage";

// Invoice Center Pages
import InvoiceCenterDashboard from "../pages/invoice-center/dashboard/InvoiceCenterDashboard";
import CustomerCategoriesPage from "../pages/invoice-center/customer-categories/CustomerCategoriesPage";
import CustomersPage from "../pages/invoice-center/customers/CustomersPage";
import CustomerFormPage from "../pages/invoice-center/customers/CustomerFormPage";
import CustomerDetailsPage from "../pages/invoice-center/customers/CustomerDetailsPage";
import SalesOrdersPage from "../pages/invoice-center/sales-orders/SalesOrdersPage";
import SalesOrderFormPage from "../pages/invoice-center/sales-orders/SalesOrderFormPage";
import SalesOrderDetailsPage from "../pages/invoice-center/sales-orders/SalesOrderDetailsPage";
import SalesInvoicesPage from "../pages/invoice-center/sales-invoices/SalesInvoicesPage";
import SalesInvoiceFormPage from "../pages/invoice-center/sales-invoices/SalesInvoiceFormPage";
import SalesInvoiceDetailsPage from "../pages/invoice-center/sales-invoices/SalesInvoiceDetailsPage";
import ProformaInvoicesPage from "../pages/invoice-center/proforma-invoices/ProformaInvoicesPage";
import CreditNotesPage from "../pages/invoice-center/credit-notes/CreditNotesPage";
import CreditNoteFormPage from "../pages/invoice-center/credit-notes/CreditNoteFormPage";
import CreditNoteDetailsPage from "../pages/invoice-center/credit-notes/CreditNoteDetailsPage";
import DebitNotesPage from "../pages/invoice-center/debit-notes/DebitNotesPage";
import DebitNoteFormPage from "../pages/invoice-center/debit-notes/DebitNoteFormPage";
import DebitNoteDetailsPage from "../pages/invoice-center/debit-notes/DebitNoteDetailsPage";
import CustomerReceiptsPage from "../pages/invoice-center/customer-receipts/CustomerReceiptsPage";
import CustomerReceiptFormPage from "../pages/invoice-center/customer-receipts/CustomerReceiptFormPage";
import CustomerReceiptDetailsPage from "../pages/invoice-center/customer-receipts/CustomerReceiptDetailsPage";
import InvoiceCenterFinanceSettingsPage from "../pages/invoice-center/finance-settings/InvoiceCenterFinanceSettingsPage";
import InvoiceCenterFinancePostingPage from "../pages/invoice-center/finance-posting/InvoiceCenterFinancePostingPage";
import ApprovalWorkspacePage from "../pages/invoice-center/approvals/ApprovalWorkspacePage";
import { InvoiceCenterReportsDashboardPage } from "../pages/invoice-center/reports/InvoiceCenterReportsDashboardPage";
import { CustomerBalanceReportPage } from "../pages/invoice-center/reports/CustomerBalanceReportPage";
import { CustomerStatementReportPage } from "../pages/invoice-center/reports/CustomerStatementReportPage";
import { CustomerAgingReportPage } from "../pages/invoice-center/reports/CustomerAgingReportPage";
import { SalesOrderRegisterReportPage } from "../pages/invoice-center/reports/SalesOrderRegisterReportPage";
import { SalesInvoiceRegisterReportPage } from "../pages/invoice-center/reports/SalesInvoiceRegisterReportPage";
import { CreditNoteRegisterReportPage } from "../pages/invoice-center/reports/CreditNoteRegisterReportPage";
import { DebitNoteRegisterReportPage } from "../pages/invoice-center/reports/DebitNoteRegisterReportPage";
import { CustomerReceiptRegisterReportPage } from "../pages/invoice-center/reports/CustomerReceiptRegisterReportPage";
import { OutstandingInvoiceReportPage } from "../pages/invoice-center/reports/OutstandingInvoiceReportPage";
import { SalesByCustomerReportPage } from "../pages/invoice-center/reports/SalesByCustomerReportPage";
import { SalesByProductReportPage } from "../pages/invoice-center/reports/SalesByProductReportPage";
import { CollectionSummaryReportPage } from "../pages/invoice-center/reports/CollectionSummaryReportPage";
import { FinancePostingStatusReportPage } from "../pages/invoice-center/reports/FinancePostingStatusReportPage";
import PrintFormatListPage from "../pages/invoice-center/print-formats/PrintFormatListPage";
import PrintFormatFormPage from "../pages/invoice-center/print-formats/PrintFormatFormPage";
import PrintFormatPreviewPage from "../pages/invoice-center/print-formats/PrintFormatPreviewPage";
import DocumentPrintPage from "../pages/invoice-center/print-formats/DocumentPrintPage";

// Compliance Center Modules
import ComplianceDashboardPage from "../pages/compliance-center/dashboard/ComplianceDashboardPage";
import LicenseDocumentsPage from "../pages/compliance-center/licenses/LicenseDocumentsPage";
import BatchHoldPage from "../pages/compliance-center/batch-holds/BatchHoldPage";
import BatchRecallPage from "../pages/compliance-center/recalls/BatchRecallPage";
import ExpiryDisposalPage from "../pages/compliance-center/disposals/ExpiryDisposalPage";
import RegulatoryRecordsPage from "../pages/compliance-center/records/RegulatoryRecordsPage";

const PlatformProtectedRoute = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { isAuthenticated, loading } = usePlatformAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center space-y-4 bg-slate-900 text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        <span className="text-slate-550 text-sm font-semibold uppercase tracking-wider">
          Verifying Authority...
        </span>
      </div>
    );
  }
  if (!isAuthenticated) {
    return <Navigate to="/platform-admin/login" replace />;
  }
  return <>{children}</>;
};

import ModuleSelectionPage from "../pages/landing/ModuleSelectionPage";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/modules" replace />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/modules" element={<ModuleSelectionPage />} />

        <Route element={<AppLayout />}>
          {/* Control Center Routes */}
          <Route
            path="/control-center/dashboard"
            element={<ControlCenterDashboardPage />}
          />
          <Route
            path="/control-center/company"
            element={<CompanyProfilePage />}
          />
          <Route path="/control-center/branches" element={<BranchesPage />} />
          <Route
            path="/control-center/departments"
            element={<DepartmentsPage />}
          />
          <Route
            path="/control-center/designations"
            element={<DesignationsPage />}
          />
          <Route
            path="/control-center/software-modules"
            element={<SoftwareModulesPage />}
          />
          <Route
            path="/control-center/module-connections"
            element={<ModuleConnectionsPage />}
          />
          <Route path="/control-center/users" element={<UsersPage />} />
          <Route
            path="/control-center/users/create"
            element={<UserCreatePage />}
          />
          <Route
            path="/control-center/users/:id/edit"
            element={<UserCreatePage />}
          />
          <Route
            path="/control-center/users/:id"
            element={<UserDetailsPage />}
          />
          <Route
            path="/control-center/user-branch-access"
            element={<UserBranchAccessPage />}
          />
          <Route
            path="/control-center/user-software-access"
            element={<UserSoftwareAccessPage />}
          />
          <Route
            path="/control-center/roles-permissions"
            element={<RolesPermissionsPage />}
          />
          <Route
            path="/control-center/roles"
            element={<RolesPermissionsPage />}
          />
          <Route
            path="/control-center/permissions"
            element={<RolesPermissionsPage />}
          />
          <Route
            path="/control-center/user-assignments"
            element={<AccessMatrixPage />}
          />
          <Route
            path="/control-center/effective-access"
            element={<EffectiveAccessPage />}
          />
          <Route
            path="/control-center/audit-logs"
            element={<AuditLogsPage />}
          />
          <Route
            path="/control-center/access-audit"
            element={<AccessAuditPage />}
          />
          <Route
            path="/control-center/login-history"
            element={<LoginLogsPage />}
          />
          <Route
            path="/control-center/security-settings"
            element={<SecuritySettingsPage />}
          />
          <Route
            path="/control-center/approval-settings"
            element={<ApprovalSettingsPage />}
          />
          <Route
            path="/control-center/document-numbering"
            element={<DocumentNumberingPage />}
          />
          <Route
            path="/control-center/settings"
            element={<GeneralSettingsPage />}
          />

          {/* Finance Module */}
          <Route path="/finance/dashboard" element={<FinanceDashboardPage />} />

          <Route
            path="/finance/setup/chart-of-accounts"
            element={<ChartOfAccountsPage />}
          />
          <Route
            path="/finance/setup/account-groups"
            element={<AccountGroupsPage />}
          />
          <Route
            path="/finance/setup/opening-balances"
            element={<OpeningBalancesPage />}
          />
          <Route
            path="/finance/setup/financial-year"
            element={<FinancialYearPage />}
          />
          <Route
            path="/finance/setup/tax-settings"
            element={<TaxSettingsPage />}
          />

          <Route
            path="/finance/general-ledger/journal-entry"
            element={<JournalEntriesPage />}
          />
          <Route
            path="/finance/general-ledger/journal-entry/create"
            element={<JournalEntryFormPage />}
          />
          <Route
            path="/finance/general-ledger/journal-entry/:id/edit"
            element={<JournalEntryFormPage />}
          />
          <Route
            path="/finance/general-ledger/journal-register"
            element={<JournalRegisterReportPage />}
          />
          <Route
            path="/finance/general-ledger/account-ledger"
            element={<AccountLedgerReportPage />}
          />
          <Route
            path="/finance/general-ledger/trial-balance"
            element={<TrialBalanceReportPage />}
          />
          <Route
            path="/finance/general-ledger/general-ledger-report"
            element={<GeneralLedgerPage />}
          />

          <Route
            path="/finance/banking/bank-accounts"
            element={<BankAccountsPage />}
          />
          <Route
            path="/finance/banking/cash-accounts"
            element={<CashAccountsPage />}
          />
          <Route
            path="/finance/banking/bank-book"
            element={<BankBookReportPage />}
          />
          <Route
            path="/finance/banking/cash-book"
            element={<CashBookReportPage />}
          />
          <Route
            path="/finance/banking/payment-vouchers"
            element={<PaymentVouchersPage />}
          />
          <Route
            path="/finance/banking/receipt-vouchers"
            element={<ReceiptVouchersPage />}
          />
          <Route
            path="/finance/banking/bank-reconciliation"
            element={<BankReconciliationPage />}
          />

          <Route
            path="/finance/reports/reports-dashboard"
            element={<FinanceReportsDashboard />}
          />
          <Route
            path="/finance/reports/profit-and-loss"
            element={<ProfitLossReportPage />}
          />
          <Route
            path="/finance/reports/balance-sheet"
            element={<BalanceSheetReportPage />}
          />
          <Route
            path="/finance/reports/trial-balance"
            element={<TrialBalanceReportPage />}
          />
          <Route
            path="/finance/reports/day-book"
            element={<DayBookReportPage />}
          />
          <Route
            path="/finance/reports/payment-register"
            element={<PaymentRegisterReportPage />}
          />
          <Route
            path="/finance/reports/receipt-register"
            element={<ReceiptRegisterReportPage />}
          />

          <Route
            path="/finance/fixed-assets/categories"
            element={<FixedAssetCategoriesPage />}
          />
          <Route
            path="/finance/fixed-assets/assets"
            element={<FixedAssetsPage />}
          />
          <Route
            path="/finance/fixed-assets/depreciation-runs"
            element={<DepreciationRunsPage />}
          />
          <Route
            path="/finance/fixed-assets/asset-disposals"
            element={<AssetDisposalsPage />}
          />

          {/* Finance legacy report URLs */}
          <Route
            path="/finance/chart-of-accounts"
            element={<Navigate to="/finance/setup/chart-of-accounts" replace />}
          />
          <Route
            path="/finance/account-groups"
            element={<Navigate to="/finance/setup/account-groups" replace />}
          />
          <Route
            path="/finance/opening-balances"
            element={<Navigate to="/finance/setup/opening-balances" replace />}
          />
          <Route
            path="/finance/financial-year"
            element={<Navigate to="/finance/setup/financial-year" replace />}
          />
          <Route
            path="/finance/tax-settings"
            element={<Navigate to="/finance/setup/tax-settings" replace />}
          />
          <Route
            path="/finance/journal-entry"
            element={
              <Navigate to="/finance/general-ledger/journal-entry" replace />
            }
          />
          <Route
            path="/finance/journal-register"
            element={
              <Navigate to="/finance/general-ledger/journal-register" replace />
            }
          />
          <Route
            path="/finance/account-ledger"
            element={
              <Navigate to="/finance/general-ledger/account-ledger" replace />
            }
          />
          <Route
            path="/finance/trial-balance"
            element={<Navigate to="/finance/reports/trial-balance" replace />}
          />
          <Route
            path="/finance/general-ledger-report"
            element={
              <Navigate
                to="/finance/general-ledger/general-ledger-report"
                replace
              />
            }
          />
          <Route
            path="/finance/bank-accounts"
            element={<Navigate to="/finance/banking/bank-accounts" replace />}
          />
          <Route
            path="/finance/cash-accounts"
            element={<Navigate to="/finance/banking/cash-accounts" replace />}
          />
          <Route
            path="/finance/bank-book"
            element={<Navigate to="/finance/banking/bank-book" replace />}
          />
          <Route
            path="/finance/cash-book"
            element={<Navigate to="/finance/banking/cash-book" replace />}
          />
          <Route
            path="/finance/payment-register"
            element={
              <Navigate to="/finance/reports/payment-register" replace />
            }
          />
          <Route
            path="/finance/receipt-register"
            element={
              <Navigate to="/finance/reports/receipt-register" replace />
            }
          />
          <Route
            path="/finance/bank-reconciliation"
            element={
              <Navigate to="/finance/banking/bank-reconciliation" replace />
            }
          />
          <Route
            path="/finance/profit-and-loss"
            element={<Navigate to="/finance/reports/profit-and-loss" replace />}
          />
          <Route
            path="/finance/balance-sheet"
            element={<Navigate to="/finance/reports/balance-sheet" replace />}
          />
          <Route
            path="/finance/day-book"
            element={<Navigate to="/finance/reports/day-book" replace />}
          />
          <Route
            path="/finance/fixed-asset-categories"
            element={<Navigate to="/finance/fixed-assets/categories" replace />}
          />
          <Route
            path="/finance/fixed-assets"
            element={<Navigate to="/finance/fixed-assets/assets" replace />}
          />
          <Route
            path="/finance/depreciation-runs"
            element={
              <Navigate to="/finance/fixed-assets/depreciation-runs" replace />
            }
          />
          <Route
            path="/finance/asset-disposals"
            element={
              <Navigate to="/finance/fixed-assets/asset-disposals" replace />
            }
          />
          <Route
            path="/finance/general-ledger"
            element={<GeneralLedgerPage />}
          />
          <Route
            path="/finance/reports"
            element={
              <Navigate to="/finance/reports/reports-dashboard" replace />
            }
          />
          <Route
            path="/finance/reports/account-ledger"
            element={<AccountLedgerReportPage />}
          />
          <Route
            path="/finance/reports/trial-balance"
            element={<TrialBalanceReportPage />}
          />
          <Route
            path="/finance/reports/profit-loss"
            element={<ProfitLossReportPage />}
          />
          <Route
            path="/finance/reports/balance-sheet"
            element={<BalanceSheetReportPage />}
          />
          <Route
            path="/finance/reports/cash-book"
            element={<CashBookReportPage />}
          />
          <Route
            path="/finance/reports/bank-book"
            element={<BankBookReportPage />}
          />
          <Route
            path="/finance/reports/day-book"
            element={<DayBookReportPage />}
          />
          <Route
            path="/finance/reports/journal-register"
            element={<JournalRegisterReportPage />}
          />
          <Route
            path="/finance/reports/payment-register"
            element={<PaymentRegisterReportPage />}
          />
          <Route
            path="/finance/reports/receipt-register"
            element={<ReceiptRegisterReportPage />}
          />

          {/* Inventory Module */}
          <Route
            path="/inventory/dashboard"
            element={<InventoryDashboardPage />}
          />
          <Route path="/inventory/products" element={<ProductsPage />} />
          <Route
            path="/inventory/products/create"
            element={<ProductFormPage />}
          />
          <Route
            path="/inventory/products/:id"
            element={<ProductDetailsPage />}
          />
          <Route
            path="/inventory/products/:id/edit"
            element={<ProductFormPage />}
          />
          <Route
            path="/inventory/product-batches"
            element={<ProductBatchesPage />}
          />
          <Route
            path="/inventory/product-batches/create"
            element={<ProductBatchFormPage />}
          />
          <Route
            path="/inventory/product-batches/:id"
            element={<ProductBatchDetailsPage />}
          />
          <Route
            path="/inventory/product-batches/:id/edit"
            element={<ProductBatchFormPage />}
          />
          <Route
            path="/inventory/warehouses"
            element={<WarehousesAndLocationsPage />}
          />
          <Route path="/inventory/grn" element={<GRNPage />} />
          <Route path="/inventory/grns/create" element={<GRNFormPage />} />
          <Route path="/inventory/grns/:id" element={<GRNDetailsPage />} />
          <Route path="/inventory/grns/:id/edit" element={<GRNFormPage />} />
          <Route
            path="/inventory/stock/opening-stock"
            element={<OpeningStockPage />}
          />
          <Route
            path="/inventory/stock/transfers"
            element={<StockTransfersPage />}
          />
          <Route
            path="/inventory/stock/adjustments"
            element={<StockAdjustmentsPage />}
          />
          <Route
            path="/inventory/stock-transfers/create"
            element={<StockTransferFormPage />}
          />
          <Route
            path="/inventory/stock-transfers/:id"
            element={<StockTransferDetailsPage />}
          />
          <Route
            path="/inventory/stock-transfers/:id/edit"
            element={<StockTransferFormPage />}
          />
          <Route
            path="/inventory/stock-adjustments/create"
            element={<StockAdjustmentFormPage />}
          />
          <Route
            path="/inventory/stock-adjustments/:id"
            element={<StockAdjustmentDetailsPage />}
          />
          <Route
            path="/inventory/stock-adjustments/:id/edit"
            element={<StockAdjustmentFormPage />}
          />
          <Route
            path="/inventory/returns/purchase-returns"
            element={<PurchaseReturnsPage />}
          />
          <Route
            path="/inventory/returns/sales-returns"
            element={<SalesReturnsPage />}
          />
          <Route
            path="/inventory/purchase-returns/create"
            element={<PurchaseReturnFormPage />}
          />
          <Route
            path="/inventory/purchase-returns/:id"
            element={<PurchaseReturnDetailsPage />}
          />
          <Route
            path="/inventory/purchase-returns/:id/edit"
            element={<PurchaseReturnFormPage />}
          />
          <Route
            path="/inventory/sales-returns/create"
            element={<SalesReturnFormPage />}
          />
          <Route
            path="/inventory/sales-returns/:id"
            element={<SalesReturnDetailsPage />}
          />
          <Route
            path="/inventory/sales-returns/:id/edit"
            element={<SalesReturnFormPage />}
          />
          <Route
            path="/inventory/reports/stock-balance"
            element={<StockBalanceReportPage />}
          />
          <Route
            path="/inventory/reports/stock-ledger"
            element={<StockLedgerReportPage />}
          />
          <Route
            path="/inventory/reports/expiry-report"
            element={<ExpiryReportPage />}
          />
          <Route
            path="/inventory/reports/batch-report"
            element={<BatchReportPage />}
          />
          <Route
            path="/inventory/settings/product-setup"
            element={<ProductSetupPage />}
          />
          <Route
            path="/inventory/settings/suppliers"
            element={<SuppliersPage />}
          />
          <Route
            path="/inventory/warehouse-locations"
            element={<Navigate to="/inventory/warehouses" replace />}
          />
          <Route
            path="/inventory/product-categories"
            element={
              <Navigate to="/inventory/settings/product-setup" replace />
            }
          />
          <Route
            path="/inventory/product-units"
            element={
              <Navigate to="/inventory/settings/product-setup" replace />
            }
          />
          <Route
            path="/inventory/dosage-forms"
            element={
              <Navigate to="/inventory/settings/product-setup" replace />
            }
          />
          <Route
            path="/inventory/generic-names"
            element={
              <Navigate to="/inventory/settings/product-setup" replace />
            }
          />
          <Route
            path="/inventory/manufacturers"
            element={
              <Navigate to="/inventory/settings/product-setup" replace />
            }
          />
          <Route
            path="/inventory/suppliers"
            element={<Navigate to="/inventory/settings/suppliers" replace />}
          />
          <Route
            path="/inventory/grns"
            element={<Navigate to="/inventory/grn" replace />}
          />
          <Route
            path="/inventory/opening-stock"
            element={<Navigate to="/inventory/stock/opening-stock" replace />}
          />
          <Route
            path="/inventory/stock-transfers"
            element={<Navigate to="/inventory/stock/transfers" replace />}
          />
          <Route
            path="/inventory/stock-adjustments"
            element={<Navigate to="/inventory/stock/adjustments" replace />}
          />
          <Route
            path="/inventory/purchase-returns"
            element={
              <Navigate to="/inventory/returns/purchase-returns" replace />
            }
          />
          <Route
            path="/inventory/sales-returns"
            element={<Navigate to="/inventory/returns/sales-returns" replace />}
          />
          <Route
            path="/inventory/stock-balances"
            element={<Navigate to="/inventory/reports/stock-balance" replace />}
          />
          <Route
            path="/inventory/stock-ledger"
            element={<Navigate to="/inventory/reports/stock-ledger" replace />}
          />

          {/* Invoice Center Routes */}
          <Route
            path="/invoice-center/dashboard"
            element={<InvoiceCenterDashboard />}
          />
          <Route
            path="/invoice-center/customer-categories"
            element={<CustomerCategoriesPage />}
          />
          <Route path="/invoice-center/customers" element={<CustomersPage />} />
          <Route
            path="/invoice-center/customers/create"
            element={<CustomerFormPage />}
          />
          <Route
            path="/invoice-center/customers/:id"
            element={<CustomerDetailsPage />}
          />
          <Route
            path="/invoice-center/customers/:id/edit"
            element={<CustomerFormPage />}
          />
          <Route
            path="/invoice-center/sales-orders"
            element={<SalesOrdersPage />}
          />
          <Route
            path="/invoice-center/sales-orders/create"
            element={<SalesOrderFormPage />}
          />
          <Route
            path="/invoice-center/sales-orders/:id"
            element={<SalesOrderDetailsPage />}
          />
          <Route
            path="/invoice-center/sales-orders/:id/edit"
            element={<SalesOrderFormPage />}
          />
          <Route
            path="/invoice-center/sales-invoices"
            element={<SalesInvoicesPage />}
          />
          <Route
            path="/invoice-center/sales-invoices/create"
            element={<SalesInvoiceFormPage />}
          />
          <Route
            path="/invoice-center/sales-invoices/:id"
            element={<SalesInvoiceDetailsPage />}
          />
          <Route
            path="/invoice-center/sales-invoices/:id/edit"
            element={<SalesInvoiceFormPage />}
          />
          <Route
            path="/invoice-center/proforma-invoices"
            element={<ProformaInvoicesPage />}
          />
          <Route
            path="/invoice-center/proforma-invoices/create"
            element={
              <Navigate to="/invoice-center/sales-invoices/create" replace />
            }
          />
          <Route
            path="/invoice-center/proforma-invoices/:id"
            element={
              <Navigate to="/invoice-center/proforma-invoices" replace />
            }
          />

          <Route
            path="/invoice-center/credit-notes"
            element={<CreditNotesPage />}
          />
          <Route
            path="/invoice-center/credit-notes/create"
            element={<CreditNoteFormPage />}
          />
          <Route
            path="/invoice-center/credit-notes/:id"
            element={<CreditNoteDetailsPage />}
          />
          <Route
            path="/invoice-center/credit-notes/:id/edit"
            element={<CreditNoteFormPage />}
          />

          <Route
            path="/invoice-center/debit-notes"
            element={<DebitNotesPage />}
          />
          <Route
            path="/invoice-center/debit-notes/create"
            element={<DebitNoteFormPage />}
          />
          <Route
            path="/invoice-center/debit-notes/:id"
            element={<DebitNoteDetailsPage />}
          />
          <Route
            path="/invoice-center/debit-notes/:id/edit"
            element={<DebitNoteFormPage />}
          />

          <Route
            path="/invoice-center/customer-receipts"
            element={<CustomerReceiptsPage />}
          />
          <Route
            path="/invoice-center/customer-receipts/create"
            element={<CustomerReceiptFormPage />}
          />
          <Route
            path="/invoice-center/customer-receipts/:id"
            element={<CustomerReceiptDetailsPage />}
          />
          <Route
            path="/invoice-center/customer-receipts/:id/edit"
            element={<CustomerReceiptFormPage />}
          />

          <Route
            path="/invoice-center/finance-settings"
            element={<InvoiceCenterFinanceSettingsPage />}
          />
          <Route
            path="/invoice-center/finance-posting"
            element={<InvoiceCenterFinancePostingPage />}
          />

          <Route
            path="/invoice-center/approvals/inbox"
            element={<ApprovalWorkspacePage mode="inbox" />}
          />
          <Route
            path="/invoice-center/approvals/submitted"
            element={<ApprovalWorkspacePage mode="submitted" />}
          />
          <Route
            path="/invoice-center/approvals/history"
            element={<ApprovalWorkspacePage mode="history" />}
          />

          <Route
            path="/invoice-center/settings/print-formats"
            element={<PrintFormatListPage />}
          />
          <Route
            path="/invoice-center/settings/print-formats/create"
            element={<PrintFormatFormPage />}
          />
          <Route
            path="/invoice-center/settings/print-formats/:id/edit"
            element={<PrintFormatFormPage />}
          />
          <Route
            path="/invoice-center/settings/print-formats/:id/preview"
            element={<PrintFormatPreviewPage />}
          />

          {/* Invoice Center Reports */}
          <Route
            path="/invoice-center/reports"
            element={<InvoiceCenterReportsDashboardPage />}
          />
          <Route
            path="/invoice-center/reports/dashboard"
            element={<InvoiceCenterReportsDashboardPage />}
          />
          <Route
            path="/invoice-center/reports/customer-balance"
            element={<CustomerBalanceReportPage />}
          />
          <Route
            path="/invoice-center/reports/customer-statement"
            element={<CustomerStatementReportPage />}
          />
          <Route
            path="/invoice-center/reports/customer-aging"
            element={<CustomerAgingReportPage />}
          />
          <Route
            path="/invoice-center/reports/sales-order-register"
            element={<SalesOrderRegisterReportPage />}
          />
          <Route
            path="/invoice-center/reports/sales-invoice-register"
            element={<SalesInvoiceRegisterReportPage />}
          />
          <Route
            path="/invoice-center/reports/credit-note-register"
            element={<CreditNoteRegisterReportPage />}
          />
          <Route
            path="/invoice-center/reports/debit-note-register"
            element={<DebitNoteRegisterReportPage />}
          />
          <Route
            path="/invoice-center/reports/customer-receipt-register"
            element={<CustomerReceiptRegisterReportPage />}
          />
          <Route
            path="/invoice-center/reports/outstanding-invoices"
            element={<OutstandingInvoiceReportPage />}
          />
          <Route
            path="/invoice-center/reports/sales-by-customer"
            element={<SalesByCustomerReportPage />}
          />
          <Route
            path="/invoice-center/reports/sales-by-product"
            element={<SalesByProductReportPage />}
          />
          <Route
            path="/invoice-center/reports/collection-summary"
            element={<CollectionSummaryReportPage />}
          />
          <Route
            path="/invoice-center/reports/finance-posting-status"
            element={<FinancePostingStatusReportPage />}
          />

          <Route
            path="/compliance-center/dashboard"
            element={<ComplianceDashboardPage />}
          />
          <Route
            path="/compliance-center/licenses"
            element={<LicenseDocumentsPage />}
          />
          <Route
            path="/compliance-center/batch-holds"
            element={<BatchHoldPage />}
          />
          <Route
            path="/compliance-center/recalls"
            element={<BatchRecallPage />}
          />
          <Route
            path="/compliance-center/disposals"
            element={<ExpiryDisposalPage />}
          />
          <Route
            path="/compliance-center/records"
            element={<RegulatoryRecordsPage />}
          />
        </Route>
        <Route
          path="/invoice-center/sales-orders/:id/print"
          element={<DocumentPrintPage documentType="sales_order" />}
        />
        <Route
          path="/invoice-center/proforma-invoices/:id/print"
          element={<DocumentPrintPage documentType="proforma_invoice" />}
        />
        <Route
          path="/invoice-center/sales-invoices/:id/print"
          element={<DocumentPrintPage documentType="sales_invoice" />}
        />
        <Route
          path="/invoice-center/credit-notes/:id/print"
          element={<DocumentPrintPage documentType="credit_note" />}
        />
        <Route
          path="/invoice-center/debit-notes/:id/print"
          element={<DocumentPrintPage documentType="debit_note" />}
        />
        <Route
          path="/invoice-center/customer-receipts/:id/print"
          element={<DocumentPrintPage documentType="customer_receipt" />}
        />
        <Route
          path="/inventory/grn/:id/print"
          element={<DocumentPrintPage documentType="grn" />}
        />
        <Route
          path="/inventory/purchase-returns/:id/print"
          element={<DocumentPrintPage documentType="purchase_return" />}
        />
        <Route
          path="/inventory/sales-returns/:id/print"
          element={<DocumentPrintPage documentType="sales_return" />}
        />
        <Route
          path="/inventory/stock-transfers/:id/print"
          element={<DocumentPrintPage documentType="stock_transfer" />}
        />
        <Route
          path="/inventory/stock-adjustments/:id/print"
          element={<DocumentPrintPage documentType="stock_adjustment" />}
        />
      </Route>

      {/* Platform Admin Portal Routes */}
      <Route
        path="/platform-admin/*"
        element={
          <PlatformAuthProvider>
            <Routes>
              <Route path="login" element={<PlatformAdminLoginPage />} />
              <Route
                path=""
                element={
                  <PlatformProtectedRoute>
                    <PlatformAdminLayout />
                  </PlatformProtectedRoute>
                }
              >
                <Route
                  path="dashboard"
                  element={<PlatformAdminDashboardPage />}
                />
                <Route path="companies" element={<CompaniesPage />} />
                <Route
                  path="companies/create"
                  element={<CompanyCreatePage />}
                />
                <Route path="companies/:id" element={<CompanyDetailsPage />} />
                <Route
                  path="companies/:id/edit"
                  element={<CompanyEditPage />}
                />
                <Route
                  path="company-databases"
                  element={<CompanyDatabasePage />}
                />

                <Route
                  path="subscriptions/plans"
                  element={<SubscriptionPlansPage />}
                />
                <Route
                  path="subscriptions/plans/create"
                  element={<SubscriptionPlanFormPage />}
                />
                <Route
                  path="subscriptions/licenses"
                  element={<CompanyLicensesPage />}
                />

                <Route
                  path="billing/invoices"
                  element={<SubscriptionInvoicesPage />}
                />
                <Route
                  path="billing/payments"
                  element={<SubscriptionPaymentsPage />}
                />
                <Route
                  path="billing/outstanding"
                  element={<OutstandingBalancesPage />}
                />

                <Route path="modules" element={<ERPModulesPage />} />
                <Route path="features" element={<ERPFeaturesPage />} />
                <Route path="versions" element={<ERPVersionsPage />} />

                <Route path="users" element={<PlatformUsersPage />} />
                <Route path="roles" element={<PlatformRolesPage />} />
                <Route
                  path="permissions"
                  element={<PlatformPermissionsPage />}
                />

                <Route
                  path="settings/company-profile"
                  element={<SoftwareCompanyProfilePage />}
                />
                <Route
                  path="settings/branding"
                  element={<BrandingSettingsPage />}
                />
                <Route path="settings/email" element={<EmailSettingsPage />} />
                <Route
                  path="settings/payment-gateway"
                  element={<PaymentGatewaySettingsPage />}
                />
                <Route
                  path="settings/backups"
                  element={<BackupSettingsPage />}
                />

                <Route
                  path="support/tickets"
                  element={<SupportTicketsPage />}
                />
                <Route path="login-logs" element={<PlatformLoginLogsPage />} />
                <Route path="audit-logs" element={<PlatformAuditLogsPage />} />
              </Route>
            </Routes>
          </PlatformAuthProvider>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
