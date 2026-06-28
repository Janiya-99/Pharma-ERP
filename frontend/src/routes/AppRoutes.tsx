import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../auth/ProtectedRoute";
import AppLayout from "../components/layout/AppLayout";
import LoginPage from "../pages/auth/LoginPage";
import ControlCenterDashboardPage from "../pages/control-center/dashboard/ControlCenterDashboardPage";
import PlaceholderPage from "../pages/control-center/PlaceholderPage";

import CompanyProfilePage from "../pages/control-center/company/CompanyProfilePage";
import BranchesPage from "../pages/control-center/branches/BranchesPage";
import DepartmentsPage from "../pages/control-center/departments/DepartmentsPage";
import DesignationsPage from "../pages/control-center/designations/DesignationsPage";
import SoftwareModulesPage from "../pages/control-center/software-modules/SoftwareModulesPage";

import UsersPage from "../pages/control-center/users/UsersPage";
import UserCreatePage from "../pages/control-center/users/UserCreatePage";
import UserDetailsPage from "../pages/control-center/users/UserDetailsPage";
import UserBranchAccessPage from "../pages/control-center/user-access/UserBranchAccessPage";
import UserSoftwareAccessPage from "../pages/control-center/user-access/UserSoftwareAccessPage";

import RolesPermissionsPage from "../pages/control-center/roles-permissions/RolesPermissionsPage";
import AccessMatrixPage from "../pages/control-center/access-matrix/AccessMatrixPage";

import AuditLogsPage from "../pages/control-center/logs/AuditLogsPage";
import LoginLogsPage from "../pages/control-center/logs/LoginLogsPage";

// Finance General Ledger & Reports
import FinanceDashboardPage from "../pages/finance/dashboard/FinanceDashboardPage";
import ChartOfAccountsPage from "../pages/finance/chart-of-accounts/ChartOfAccountsPage";
import AccountGroupsPage from "../pages/finance/setup/AccountGroupsPage";
import {
  OpeningBalancesPage,
  FinancialYearPage,
  TaxSettingsPage,
  JournalEntryPage,
  PaymentVouchersPage,
  ReceiptVouchersPage,
  BankReconciliationPage,
} from "../pages/finance/setup/FinanceFunctionalPages";
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
import CreditNotesPage from "../pages/invoice-center/credit-notes/CreditNotesPage";
import CreditNoteFormPage from "../pages/invoice-center/credit-notes/CreditNoteFormPage";
import CreditNoteDetailsPage from "../pages/invoice-center/credit-notes/CreditNoteDetailsPage";
import DebitNotesPage from "../pages/invoice-center/debit-notes/DebitNotesPage";
import DebitNoteFormPage from "../pages/invoice-center/debit-notes/DebitNoteFormPage";
import DebitNoteDetailsPage from "../pages/invoice-center/debit-notes/DebitNoteDetailsPage";
import CustomerReceiptsPage from "../pages/invoice-center/customer-receipts/CustomerReceiptsPage";
import CustomerReceiptFormPage from "../pages/invoice-center/customer-receipts/CustomerReceiptFormPage";
import CustomerReceiptDetailsPage from "../pages/invoice-center/customer-receipts/CustomerReceiptDetailsPage";
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

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/control-center/dashboard" replace />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          {/* Control Center Routes */}
          <Route path="/control-center/dashboard" element={<ControlCenterDashboardPage />} />
          <Route path="/control-center/company" element={<CompanyProfilePage />} />
          <Route path="/control-center/branches" element={<BranchesPage />} />
          <Route path="/control-center/departments" element={<DepartmentsPage />} />
          <Route path="/control-center/designations" element={<DesignationsPage />} />
          <Route path="/control-center/software-modules" element={<SoftwareModulesPage />} />
          <Route path="/control-center/users" element={<UsersPage />} />
          <Route path="/control-center/users/create" element={<UserCreatePage />} />
          <Route path="/control-center/users/:id/edit" element={<UserCreatePage />} />
          <Route path="/control-center/users/:id" element={<UserDetailsPage />} />
          <Route path="/control-center/user-branch-access" element={<UserBranchAccessPage />} />
          <Route path="/control-center/user-software-access" element={<UserSoftwareAccessPage />} />
          <Route path="/control-center/roles-permissions" element={<RolesPermissionsPage />} />
          <Route path="/control-center/user-access" element={<AccessMatrixPage />} />
          <Route path="/control-center/access-matrix" element={<AccessMatrixPage />} />
          <Route path="/control-center/user-access-management" element={<AccessMatrixPage />} />
          <Route path="/control-center/audit-logs" element={<AuditLogsPage />} />
          <Route path="/control-center/login-logs" element={<LoginLogsPage />} />
          <Route path="/control-center/settings" element={<PlaceholderPage title="Settings" />} />

          {/* Finance Module */}
          <Route path="/finance/dashboard" element={<FinanceDashboardPage />} />

          <Route path="/finance/setup/chart-of-accounts" element={<ChartOfAccountsPage />} />
          <Route path="/finance/setup/account-groups" element={<AccountGroupsPage />} />
          <Route path="/finance/setup/opening-balances" element={<OpeningBalancesPage />} />
          <Route path="/finance/setup/financial-year" element={<FinancialYearPage />} />
          <Route path="/finance/setup/tax-settings" element={<TaxSettingsPage />} />

          <Route path="/finance/general-ledger/journal-entry" element={<JournalEntryPage />} />
          <Route path="/finance/general-ledger/journal-register" element={<JournalRegisterReportPage />} />
          <Route path="/finance/general-ledger/account-ledger" element={<AccountLedgerReportPage />} />
          <Route path="/finance/general-ledger/trial-balance" element={<TrialBalanceReportPage />} />
          <Route path="/finance/general-ledger/general-ledger-report" element={<GeneralLedgerPage />} />

          <Route path="/finance/banking/bank-accounts" element={<BankAccountsPage />} />
          <Route path="/finance/banking/cash-accounts" element={<CashAccountsPage />} />
          <Route path="/finance/banking/bank-book" element={<BankBookReportPage />} />
          <Route path="/finance/banking/cash-book" element={<CashBookReportPage />} />
          <Route path="/finance/banking/payment-vouchers" element={<PaymentVouchersPage />} />
          <Route path="/finance/banking/receipt-vouchers" element={<ReceiptVouchersPage />} />
          <Route path="/finance/banking/bank-reconciliation" element={<BankReconciliationPage />} />

          <Route path="/finance/reports/reports-dashboard" element={<FinanceReportsDashboard />} />
          <Route path="/finance/reports/profit-and-loss" element={<ProfitLossReportPage />} />
          <Route path="/finance/reports/balance-sheet" element={<BalanceSheetReportPage />} />
          <Route path="/finance/reports/trial-balance" element={<TrialBalanceReportPage />} />
          <Route path="/finance/reports/day-book" element={<DayBookReportPage />} />
          <Route path="/finance/reports/payment-register" element={<PaymentRegisterReportPage />} />
          <Route path="/finance/reports/receipt-register" element={<ReceiptRegisterReportPage />} />

          <Route path="/finance/fixed-assets/categories" element={<FixedAssetCategoriesPage />} />
          <Route path="/finance/fixed-assets/assets" element={<FixedAssetsPage />} />
          <Route path="/finance/fixed-assets/depreciation-runs" element={<DepreciationRunsPage />} />
          <Route path="/finance/fixed-assets/asset-disposals" element={<AssetDisposalsPage />} />

          {/* Finance legacy report URLs */}
          <Route path="/finance/chart-of-accounts" element={<Navigate to="/finance/setup/chart-of-accounts" replace />} />
          <Route path="/finance/account-groups" element={<Navigate to="/finance/setup/account-groups" replace />} />
          <Route path="/finance/opening-balances" element={<Navigate to="/finance/setup/opening-balances" replace />} />
          <Route path="/finance/financial-year" element={<Navigate to="/finance/setup/financial-year" replace />} />
          <Route path="/finance/tax-settings" element={<Navigate to="/finance/setup/tax-settings" replace />} />
          <Route path="/finance/journal-entry" element={<Navigate to="/finance/general-ledger/journal-entry" replace />} />
          <Route path="/finance/journal-register" element={<Navigate to="/finance/general-ledger/journal-register" replace />} />
          <Route path="/finance/account-ledger" element={<Navigate to="/finance/general-ledger/account-ledger" replace />} />
          <Route path="/finance/trial-balance" element={<Navigate to="/finance/reports/trial-balance" replace />} />
          <Route path="/finance/general-ledger-report" element={<Navigate to="/finance/general-ledger/general-ledger-report" replace />} />
          <Route path="/finance/bank-accounts" element={<Navigate to="/finance/banking/bank-accounts" replace />} />
          <Route path="/finance/cash-accounts" element={<Navigate to="/finance/banking/cash-accounts" replace />} />
          <Route path="/finance/bank-book" element={<Navigate to="/finance/banking/bank-book" replace />} />
          <Route path="/finance/cash-book" element={<Navigate to="/finance/banking/cash-book" replace />} />
          <Route path="/finance/payment-register" element={<Navigate to="/finance/reports/payment-register" replace />} />
          <Route path="/finance/receipt-register" element={<Navigate to="/finance/reports/receipt-register" replace />} />
          <Route path="/finance/bank-reconciliation" element={<Navigate to="/finance/banking/bank-reconciliation" replace />} />
          <Route path="/finance/profit-and-loss" element={<Navigate to="/finance/reports/profit-and-loss" replace />} />
          <Route path="/finance/balance-sheet" element={<Navigate to="/finance/reports/balance-sheet" replace />} />
          <Route path="/finance/day-book" element={<Navigate to="/finance/reports/day-book" replace />} />
          <Route path="/finance/fixed-asset-categories" element={<Navigate to="/finance/fixed-assets/categories" replace />} />
          <Route path="/finance/fixed-assets" element={<Navigate to="/finance/fixed-assets/assets" replace />} />
          <Route path="/finance/depreciation-runs" element={<Navigate to="/finance/fixed-assets/depreciation-runs" replace />} />
          <Route path="/finance/asset-disposals" element={<Navigate to="/finance/fixed-assets/asset-disposals" replace />} />
          <Route path="/finance/general-ledger" element={<GeneralLedgerPage />} />
          <Route path="/finance/reports" element={<Navigate to="/finance/reports/reports-dashboard" replace />} />
          <Route path="/finance/reports/account-ledger" element={<AccountLedgerReportPage />} />
          <Route path="/finance/reports/trial-balance" element={<TrialBalanceReportPage />} />
          <Route path="/finance/reports/profit-loss" element={<ProfitLossReportPage />} />
          <Route path="/finance/reports/balance-sheet" element={<BalanceSheetReportPage />} />
          <Route path="/finance/reports/cash-book" element={<CashBookReportPage />} />
          <Route path="/finance/reports/bank-book" element={<BankBookReportPage />} />
          <Route path="/finance/reports/day-book" element={<DayBookReportPage />} />
          <Route path="/finance/reports/journal-register" element={<JournalRegisterReportPage />} />
          <Route path="/finance/reports/payment-register" element={<PaymentRegisterReportPage />} />
          <Route path="/finance/reports/receipt-register" element={<ReceiptRegisterReportPage />} />

          {/* Inventory Module */}
          <Route path="/inventory/dashboard" element={<InventoryDashboardPage />} />
          <Route path="/inventory/products" element={<ProductsPage />} />
          <Route path="/inventory/products/create" element={<ProductFormPage />} />
          <Route path="/inventory/products/:id" element={<ProductDetailsPage />} />
          <Route path="/inventory/products/:id/edit" element={<ProductFormPage />} />
          <Route path="/inventory/product-batches" element={<ProductBatchesPage />} />
          <Route path="/inventory/product-batches/create" element={<ProductBatchFormPage />} />
          <Route path="/inventory/product-batches/:id" element={<ProductBatchDetailsPage />} />
          <Route path="/inventory/product-batches/:id/edit" element={<ProductBatchFormPage />} />
          <Route path="/inventory/warehouses" element={<WarehousesAndLocationsPage />} />
          <Route path="/inventory/grn" element={<GRNPage />} />
          <Route path="/inventory/grns/create" element={<GRNFormPage />} />
          <Route path="/inventory/grns/:id" element={<GRNDetailsPage />} />
          <Route path="/inventory/grns/:id/edit" element={<GRNFormPage />} />
          <Route path="/inventory/stock/opening-stock" element={<OpeningStockPage />} />
          <Route path="/inventory/stock/transfers" element={<StockTransfersPage />} />
          <Route path="/inventory/stock/adjustments" element={<StockAdjustmentsPage />} />
          <Route path="/inventory/stock-transfers/create" element={<StockTransferFormPage />} />
          <Route path="/inventory/stock-transfers/:id" element={<StockTransferDetailsPage />} />
          <Route path="/inventory/stock-transfers/:id/edit" element={<StockTransferFormPage />} />
          <Route path="/inventory/stock-adjustments/create" element={<StockAdjustmentFormPage />} />
          <Route path="/inventory/stock-adjustments/:id" element={<StockAdjustmentDetailsPage />} />
          <Route path="/inventory/stock-adjustments/:id/edit" element={<StockAdjustmentFormPage />} />
          <Route path="/inventory/returns/purchase-returns" element={<PurchaseReturnsPage />} />
          <Route path="/inventory/returns/sales-returns" element={<SalesReturnsPage />} />
          <Route path="/inventory/purchase-returns/create" element={<PurchaseReturnFormPage />} />
          <Route path="/inventory/purchase-returns/:id" element={<PurchaseReturnDetailsPage />} />
          <Route path="/inventory/purchase-returns/:id/edit" element={<PurchaseReturnFormPage />} />
          <Route path="/inventory/sales-returns/create" element={<SalesReturnFormPage />} />
          <Route path="/inventory/sales-returns/:id" element={<SalesReturnDetailsPage />} />
          <Route path="/inventory/sales-returns/:id/edit" element={<SalesReturnFormPage />} />
          <Route path="/inventory/reports/stock-balance" element={<StockBalanceReportPage />} />
          <Route path="/inventory/reports/stock-ledger" element={<StockLedgerReportPage />} />
          <Route path="/inventory/reports/expiry-report" element={<ExpiryReportPage />} />
          <Route path="/inventory/reports/batch-report" element={<BatchReportPage />} />
          <Route path="/inventory/settings/product-setup" element={<ProductSetupPage />} />
          <Route path="/inventory/settings/suppliers" element={<SuppliersPage />} />
          <Route path="/inventory/warehouse-locations" element={<Navigate to="/inventory/warehouses" replace />} />
          <Route path="/inventory/product-categories" element={<Navigate to="/inventory/settings/product-setup" replace />} />
          <Route path="/inventory/product-units" element={<Navigate to="/inventory/settings/product-setup" replace />} />
          <Route path="/inventory/dosage-forms" element={<Navigate to="/inventory/settings/product-setup" replace />} />
          <Route path="/inventory/generic-names" element={<Navigate to="/inventory/settings/product-setup" replace />} />
          <Route path="/inventory/manufacturers" element={<Navigate to="/inventory/settings/product-setup" replace />} />
          <Route path="/inventory/suppliers" element={<Navigate to="/inventory/settings/suppliers" replace />} />
          <Route path="/inventory/grns" element={<Navigate to="/inventory/grn" replace />} />
          <Route path="/inventory/opening-stock" element={<Navigate to="/inventory/stock/opening-stock" replace />} />
          <Route path="/inventory/stock-transfers" element={<Navigate to="/inventory/stock/transfers" replace />} />
          <Route path="/inventory/stock-adjustments" element={<Navigate to="/inventory/stock/adjustments" replace />} />
          <Route path="/inventory/purchase-returns" element={<Navigate to="/inventory/returns/purchase-returns" replace />} />
          <Route path="/inventory/sales-returns" element={<Navigate to="/inventory/returns/sales-returns" replace />} />
          <Route path="/inventory/stock-balances" element={<Navigate to="/inventory/reports/stock-balance" replace />} />
          <Route path="/inventory/stock-ledger" element={<Navigate to="/inventory/reports/stock-ledger" replace />} />
          
          {/* Invoice Center Routes */}
          <Route path="/invoice-center/dashboard" element={<InvoiceCenterDashboard />} />
          <Route path="/invoice-center/customer-categories" element={<CustomerCategoriesPage />} />
          <Route path="/invoice-center/customers" element={<CustomersPage />} />
          <Route path="/invoice-center/customers/create" element={<CustomerFormPage />} />
          <Route path="/invoice-center/customers/:id" element={<CustomerDetailsPage />} />
          <Route path="/invoice-center/customers/:id/edit" element={<CustomerFormPage />} />
          <Route path="/invoice-center/sales-orders" element={<SalesOrdersPage />} />
          <Route path="/invoice-center/sales-orders/create" element={<SalesOrderFormPage />} />
          <Route path="/invoice-center/sales-orders/:id" element={<SalesOrderDetailsPage />} />
          <Route path="/invoice-center/sales-orders/:id/edit" element={<SalesOrderFormPage />} />
          <Route path="/invoice-center/sales-invoices" element={<SalesInvoicesPage />} />
          <Route path="/invoice-center/sales-invoices/create" element={<SalesInvoiceFormPage />} />
          <Route path="/invoice-center/sales-invoices/:id" element={<SalesInvoiceDetailsPage />} />
          <Route path="/invoice-center/sales-invoices/:id/edit" element={<SalesInvoiceFormPage />} />
          
          <Route path="/invoice-center/credit-notes" element={<CreditNotesPage />} />
          <Route path="/invoice-center/credit-notes/create" element={<CreditNoteFormPage />} />
          <Route path="/invoice-center/credit-notes/:id" element={<CreditNoteDetailsPage />} />
          <Route path="/invoice-center/credit-notes/:id/edit" element={<CreditNoteFormPage />} />
          
          <Route path="/invoice-center/debit-notes" element={<DebitNotesPage />} />
          <Route path="/invoice-center/debit-notes/create" element={<DebitNoteFormPage />} />
          <Route path="/invoice-center/debit-notes/:id" element={<DebitNoteDetailsPage />} />
          <Route path="/invoice-center/debit-notes/:id/edit" element={<DebitNoteFormPage />} />

          <Route path="/invoice-center/customer-receipts" element={<CustomerReceiptsPage />} />
          <Route path="/invoice-center/customer-receipts/create" element={<CustomerReceiptFormPage />} />
          <Route path="/invoice-center/customer-receipts/:id" element={<CustomerReceiptDetailsPage />} />
          <Route path="/invoice-center/customer-receipts/:id/edit" element={<CustomerReceiptFormPage />} />

          {/* Invoice Center Reports */}
          <Route path="/invoice-center/reports" element={<InvoiceCenterReportsDashboardPage />} />
          <Route path="/invoice-center/reports/dashboard" element={<InvoiceCenterReportsDashboardPage />} />
          <Route path="/invoice-center/reports/customer-balance" element={<CustomerBalanceReportPage />} />
          <Route path="/invoice-center/reports/customer-statement" element={<CustomerStatementReportPage />} />
          <Route path="/invoice-center/reports/customer-aging" element={<CustomerAgingReportPage />} />
          <Route path="/invoice-center/reports/sales-order-register" element={<SalesOrderRegisterReportPage />} />
          <Route path="/invoice-center/reports/sales-invoice-register" element={<SalesInvoiceRegisterReportPage />} />
          <Route path="/invoice-center/reports/credit-note-register" element={<CreditNoteRegisterReportPage />} />
          <Route path="/invoice-center/reports/debit-note-register" element={<DebitNoteRegisterReportPage />} />
          <Route path="/invoice-center/reports/customer-receipt-register" element={<CustomerReceiptRegisterReportPage />} />
          <Route path="/invoice-center/reports/outstanding-invoices" element={<OutstandingInvoiceReportPage />} />
          <Route path="/invoice-center/reports/sales-by-customer" element={<SalesByCustomerReportPage />} />
          <Route path="/invoice-center/reports/sales-by-product" element={<SalesByProductReportPage />} />
          <Route path="/invoice-center/reports/collection-summary" element={<CollectionSummaryReportPage />} />
          <Route path="/invoice-center/reports/finance-posting-status" element={<FinancePostingStatusReportPage />} />

          <Route path="/compliance-center/dashboard" element={<PlaceholderPage title="Compliance Center Dashboard" />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
