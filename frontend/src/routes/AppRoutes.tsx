import React from "react";
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
import FinanceSetupPlaceholderPage from "../pages/finance/setup/FinanceSetupPlaceholderPage";
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

// Inventory Module
import InventoryDashboard from "../pages/inventory/dashboard/InventoryDashboard";
import WarehousesPage from "../pages/inventory/warehouses/WarehousesPage";
import WarehouseLocationsPage from "../pages/inventory/warehouse-locations/WarehouseLocationsPage";
import ProductCategoriesPage from "../pages/inventory/product-categories/ProductCategoriesPage";
import ProductUnitsPage from "../pages/inventory/product-units/ProductUnitsPage";
import DosageFormsPage from "../pages/inventory/dosage-forms/DosageFormsPage";
import GenericNamesPage from "../pages/inventory/generic-names/GenericNamesPage";
import ManufacturersPage from "../pages/inventory/manufacturers/ManufacturersPage";
import SuppliersPage from "../pages/inventory/suppliers/SuppliersPage";
import ProductsPage from "../pages/inventory/products/ProductsPage";
import ProductFormPage from "../pages/inventory/products/ProductFormPage";
import ProductDetailsPage from "../pages/inventory/products/ProductDetailsPage";
import ProductBatchesPage from "../pages/inventory/product-batches/ProductBatchesPage";
import ProductBatchFormPage from "../pages/inventory/product-batches/ProductBatchFormPage";
import ProductBatchDetailsPage from "../pages/inventory/product-batches/ProductBatchDetailsPage";
import StockBalancesPage from "../pages/inventory/stock-balances/StockBalancesPage";
import StockLedgerPage from "../pages/inventory/stock-ledger/StockLedgerPage";
import StockTransfersPage from "../pages/inventory/stock-transfers/StockTransfersPage";
import StockTransferFormPage from "../pages/inventory/stock-transfers/StockTransferFormPage";
import StockTransferDetailsPage from "../pages/inventory/stock-transfers/StockTransferDetailsPage";
import StockAdjustmentsPage from "../pages/inventory/stock-adjustments/StockAdjustmentsPage";
import StockAdjustmentFormPage from "../pages/inventory/stock-adjustments/StockAdjustmentFormPage";
import StockAdjustmentDetailsPage from "../pages/inventory/stock-adjustments/StockAdjustmentDetailsPage";
import PurchaseReturnsPage from "../pages/inventory/purchase-returns/PurchaseReturnsPage";
import PurchaseReturnFormPage from "../pages/inventory/purchase-returns/PurchaseReturnFormPage";
import PurchaseReturnDetailsPage from "../pages/inventory/purchase-returns/PurchaseReturnDetailsPage";
import SalesReturnsPage from "../pages/inventory/sales-returns/SalesReturnsPage";
import SalesReturnFormPage from "../pages/inventory/sales-returns/SalesReturnFormPage";
import SalesReturnDetailsPage from "../pages/inventory/sales-returns/SalesReturnDetailsPage";
import OpeningStockEntriesPage from "../pages/inventory/opening-stock/OpeningStockEntriesPage";
import OpeningStockEntryFormPage from "../pages/inventory/opening-stock/OpeningStockEntryFormPage";
import OpeningStockEntryDetailsPage from "../pages/inventory/opening-stock/OpeningStockEntryDetailsPage";
import GRNsPage from "../pages/inventory/grns/GRNsPage";
import GRNFormPage from "../pages/inventory/grns/GRNFormPage";
import GRNDetailsPage from "../pages/inventory/grns/GRNDetailsPage";

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
          <Route path="/finance/chart-of-accounts" element={<ChartOfAccountsPage />} />
          <Route path="/finance/account-groups" element={<FinanceSetupPlaceholderPage title="Account Groups" description="Create and maintain account groups used to organize the chart of accounts and finance reports." />} />
          <Route path="/finance/opening-balances" element={<FinanceSetupPlaceholderPage title="Opening Balances" description="Capture opening debit and credit balances before the company starts posting finance transactions." />} />
          <Route path="/finance/financial-year" element={<FinanceSetupPlaceholderPage title="Financial Year" description="Configure financial years, accounting periods, and close controls for ledger reporting." />} />
          <Route path="/finance/tax-settings" element={<FinanceSetupPlaceholderPage title="Tax Settings" description="Maintain tax accounts, rates, and posting defaults for purchases, sales, payments, and receipts." />} />
          <Route path="/finance/journal-entry" element={<FinanceSetupPlaceholderPage eyebrow="General Ledger" title="Journal Entry" description="Create balanced debit and credit journal vouchers that post to the general ledger." />} />
          <Route path="/finance/journal-register" element={<JournalRegisterReportPage />} />
          <Route path="/finance/account-ledger" element={<AccountLedgerReportPage />} />
          <Route path="/finance/trial-balance" element={<TrialBalanceReportPage />} />
          <Route path="/finance/general-ledger-report" element={<GeneralLedgerPage />} />
          <Route path="/finance/cash-book" element={<CashBookReportPage />} />
          <Route path="/finance/bank-book" element={<BankBookReportPage />} />
          <Route path="/finance/payment-register" element={<PaymentRegisterReportPage />} />
          <Route path="/finance/receipt-register" element={<ReceiptRegisterReportPage />} />
          <Route path="/finance/bank-reconciliation" element={<FinanceSetupPlaceholderPage eyebrow="Banking & Cash" title="Bank Reconciliation" description="Match bank statement lines with posted bank transactions and track reconciliation differences." />} />
          <Route path="/finance/profit-and-loss" element={<ProfitLossReportPage />} />
          <Route path="/finance/balance-sheet" element={<BalanceSheetReportPage />} />
          <Route path="/finance/day-book" element={<DayBookReportPage />} />
          <Route path="/finance/fixed-asset-categories" element={<FinanceSetupPlaceholderPage eyebrow="Fixed Assets" title="Fixed Asset Categories" description="Define asset categories, control accounts, and depreciation defaults for fixed assets." />} />
          <Route path="/finance/fixed-assets" element={<FinanceSetupPlaceholderPage eyebrow="Fixed Assets" title="Fixed Assets" description="Register fixed assets and connect them to asset accounts and depreciation expense accounts." />} />
          <Route path="/finance/depreciation-runs" element={<FinanceSetupPlaceholderPage eyebrow="Fixed Assets" title="Depreciation Runs" description="Prepare periodic depreciation runs for active fixed assets and review ledger impact before posting." />} />
          <Route path="/finance/asset-disposals" element={<FinanceSetupPlaceholderPage eyebrow="Fixed Assets" title="Asset Disposals" description="Record asset sales, write-offs, and disposal gains or losses with supporting ledger entries." />} />

          {/* Finance legacy report URLs */}
          <Route path="/finance/general-ledger" element={<GeneralLedgerPage />} />
          <Route path="/finance/reports" element={<FinanceReportsDashboard />} />
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
          <Route path="/inventory/dashboard" element={<InventoryDashboard />} />
          <Route path="/inventory/warehouses" element={<WarehousesPage />} />
          <Route path="/inventory/warehouse-locations" element={<WarehouseLocationsPage />} />
          <Route path="/inventory/product-categories" element={<ProductCategoriesPage />} />
          <Route path="/inventory/product-units" element={<ProductUnitsPage />} />
          <Route path="/inventory/dosage-forms" element={<DosageFormsPage />} />
          <Route path="/inventory/generic-names" element={<GenericNamesPage />} />
          <Route path="/inventory/manufacturers" element={<ManufacturersPage />} />
          <Route path="/inventory/suppliers" element={<SuppliersPage />} />
          <Route path="/inventory/products" element={<ProductsPage />} />
          <Route path="/inventory/products/create" element={<ProductFormPage />} />
          <Route path="/inventory/products/:id" element={<ProductDetailsPage />} />
          <Route path="/inventory/products/:id/edit" element={<ProductFormPage />} />
          <Route path="/inventory/product-batches" element={<ProductBatchesPage />} />
          <Route path="/inventory/product-batches/create" element={<ProductBatchFormPage />} />
          <Route path="/inventory/product-batches/:id" element={<ProductBatchDetailsPage />} />
          <Route path="/inventory/product-batches/:id/edit" element={<ProductBatchFormPage />} />
          <Route path="/inventory/stock-balances" element={<StockBalancesPage />} />
          <Route path="/inventory/stock-ledger" element={<StockLedgerPage />} />
          <Route path="/inventory/opening-stock" element={<OpeningStockEntriesPage />} />
          <Route path="/inventory/opening-stock/create" element={<OpeningStockEntryFormPage />} />
          <Route path="/inventory/opening-stock/:id" element={<OpeningStockEntryDetailsPage />} />
          <Route path="/inventory/opening-stock/:id/edit" element={<OpeningStockEntryFormPage />} />
          <Route path="/inventory/grns" element={<GRNsPage />} />
          <Route path="/inventory/grns/create" element={<GRNFormPage />} />
          <Route path="/inventory/grns/:id" element={<GRNDetailsPage />} />
          <Route path="/inventory/grns/:id/edit" element={<GRNFormPage />} />
          <Route path="/inventory/stock-transfers" element={<StockTransfersPage />} />
          <Route path="/inventory/stock-transfers/create" element={<StockTransferFormPage />} />
          <Route path="/inventory/stock-transfers/:id" element={<StockTransferDetailsPage />} />
          <Route path="/inventory/stock-transfers/:id/edit" element={<StockTransferFormPage />} />
          <Route path="/inventory/stock-adjustments" element={<StockAdjustmentsPage />} />
          <Route path="/inventory/stock-adjustments/create" element={<StockAdjustmentFormPage />} />
          <Route path="/inventory/stock-adjustments/:id" element={<StockAdjustmentDetailsPage />} />
          <Route path="/inventory/stock-adjustments/:id/edit" element={<StockAdjustmentFormPage />} />
          <Route path="/inventory/purchase-returns" element={<PurchaseReturnsPage />} />
          <Route path="/inventory/purchase-returns/create" element={<PurchaseReturnFormPage />} />
          <Route path="/inventory/purchase-returns/:id" element={<PurchaseReturnDetailsPage />} />
          <Route path="/inventory/purchase-returns/:id/edit" element={<PurchaseReturnFormPage />} />
          <Route path="/inventory/sales-returns" element={<SalesReturnsPage />} />
          <Route path="/inventory/sales-returns/create" element={<SalesReturnFormPage />} />
          <Route path="/inventory/sales-returns/:id" element={<SalesReturnDetailsPage />} />
          <Route path="/inventory/sales-returns/:id/edit" element={<SalesReturnFormPage />} />
          <Route path="/invoice-center/dashboard" element={<PlaceholderPage title="Invoice Center Dashboard" />} />
          <Route path="/compliance-center/dashboard" element={<PlaceholderPage title="Compliance Center Dashboard" />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
