import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../auth/ProtectedRoute";
import AppLayout from "../components/layout/AppLayout";
import LoginPage from "../pages/auth/LoginPage";
import ControlCenterDashboard from "../pages/control-center/ControlCenterDashboard";
import PlaceholderPage from "../pages/control-center/PlaceholderPage";

import CompanyProfilePage from "../pages/control-center/company/CompanyProfilePage";
import BranchesPage from "../pages/control-center/branches/BranchesPage";
import DepartmentsPage from "../pages/control-center/departments/DepartmentsPage";
import DesignationsPage from "../pages/control-center/designations/DesignationsPage";
import SoftwareModulesPage from "../pages/control-center/software-modules/SoftwareModulesPage";

import UsersPage from "../pages/control-center/users/UsersPage";
import UserDetailsPage from "../pages/control-center/users/UserDetailsPage";
import UserBranchAccessPage from "../pages/control-center/user-access/UserBranchAccessPage";
import UserSoftwareAccessPage from "../pages/control-center/user-access/UserSoftwareAccessPage";

import RolesPage from "../pages/control-center/roles/RolesPage";
import PermissionsPage from "../pages/control-center/permissions/PermissionsPage";
import RolePermissionMatrixPage from "../pages/control-center/role-permission-matrix/RolePermissionMatrixPage";
import UserAccessMatrixPage from "../pages/control-center/user-access-matrix/UserAccessMatrixPage";

import AuditLogsPage from "../pages/control-center/logs/AuditLogsPage";
import LoginLogsPage from "../pages/control-center/logs/LoginLogsPage";

// Finance General Ledger & Reports
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

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/control-center/dashboard" replace />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          {/* Control Center Routes */}
          <Route path="/control-center/dashboard" element={<ControlCenterDashboard />} />
          <Route path="/control-center/company" element={<CompanyProfilePage />} />
          <Route path="/control-center/branches" element={<BranchesPage />} />
          <Route path="/control-center/departments" element={<DepartmentsPage />} />
          <Route path="/control-center/designations" element={<DesignationsPage />} />
          <Route path="/control-center/software-modules" element={<SoftwareModulesPage />} />
          <Route path="/control-center/users" element={<UsersPage />} />
          <Route path="/control-center/users/:id" element={<UserDetailsPage />} />
          <Route path="/control-center/user-branch-access" element={<UserBranchAccessPage />} />
          <Route path="/control-center/user-software-access" element={<UserSoftwareAccessPage />} />
          <Route path="/control-center/roles" element={<RolesPage />} />
          <Route path="/control-center/permissions" element={<PermissionsPage />} />
          <Route path="/control-center/role-permission-matrix" element={<RolePermissionMatrixPage />} />
          <Route path="/control-center/user-access-matrix" element={<UserAccessMatrixPage />} />
          <Route path="/control-center/audit-logs" element={<AuditLogsPage />} />
          <Route path="/control-center/login-logs" element={<LoginLogsPage />} />
          <Route path="/control-center/settings" element={<PlaceholderPage title="Settings" />} />

          {/* Module Placeholders */}
          <Route path="/finance/dashboard" element={<PlaceholderPage title="Finance Dashboard" />} />
          
          {/* Finance General Ledger & Reports */}
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
          <Route path="/inventory/dashboard" element={<PlaceholderPage title="Inventory Dashboard" />} />
          <Route path="/invoice-center/dashboard" element={<PlaceholderPage title="Invoice Center Dashboard" />} />
          <Route path="/compliance-center/dashboard" element={<PlaceholderPage title="Compliance Center Dashboard" />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
