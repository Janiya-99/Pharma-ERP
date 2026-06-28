import React, { useEffect, useState } from "react";
import Widget from "components/widget/Widget";
import {
  MdAccountBalanceWallet,
  MdDateRange,
  MdCalendarToday,
  MdOutlineAccountBalance,
} from "react-icons/md";
import { useAuth } from "auth/AuthContext";
import { financeApi } from "api/financeApi";

export default function FinanceDashboard() {
  const { user, company, activeBranch, activeSoftware } = useAuth();
  const [stats, setStats] = useState({
    activeFinancialYear: "Loading...",
    openPeriods: 0,
    accounts: 0,
    openingBalances: 0,
  });

  const fetchStats = async () => {
    try {
      // Run parallel requests
      const [fyRes, apRes, coaRes, obRes] = await Promise.all([
        financeApi.getFinancialYears({ status: "active", limit: 1 }),
        financeApi.getAccountingPeriods({ is_closed: false, limit: 100 }),
        financeApi.getChartOfAccounts({ limit: 1 }),
        financeApi.getOpeningBalances({ limit: 1 }),
      ]);

      const activeFy = fyRes.data?.data?.[0]?.year_name || "None";
      const totalAccounts = coaRes.data?.pagination?.total || 0;
      const totalBalances = obRes.data?.pagination?.total || 0;

      // Filter periods manually if API doesn't support is_closed filter
      let periods = apRes.data?.data || [];
      const openPeriods = periods.filter((p: any) => !p.is_closed).length;

      setStats({
        activeFinancialYear: activeFy,
        openPeriods: openPeriods,
        accounts: totalAccounts,
        openingBalances: totalBalances,
      });
    } catch (err) {
      console.error("Failed to fetch finance stats", err);
      setStats((prev: unknown) => ({
        ...prev,
        activeFinancialYear: "Error loading",
      }));
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="flex flex-col gap-5 py-5">
      <div className="mb-4 flex flex-col">
        <h1 className="text-2xl font-bold text-navy-700 dark:text-white">
          Finance Dashboard
        </h1>
        <p className="text-sm text-gray-400">
          Overview of your financial configurations and current status
        </p>
      </div>

      <div className="mb-2 rounded-xl border border-gray-100 bg-white p-4 shadow-sm dark:border-navy-700 dark:bg-navy-800">
        <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
          <div>
            <p className="text-gray-500 dark:text-gray-400">Company</p>
            <p className="font-semibold text-navy-700 dark:text-white">
              {company?.company_name || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Active Branch</p>
            <p className="font-semibold text-navy-700 dark:text-white">
              {activeBranch?.branch_name || "N/A"}
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Active Software</p>
            <p className="font-semibold text-navy-700 dark:text-white">
              {activeSoftware?.software?.software_name || "Finance"}
            </p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400">Logged-in User</p>
            <p className="font-semibold text-navy-700 dark:text-white">
              {user?.full_name || user?.email || "N/A"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        <Widget
          icon={
            <MdDateRange className="h-6 w-6 text-brand-500 dark:text-white" />
          }
          title="Active Financial Year"
          subtitle={stats.activeFinancialYear}
        />
        <Widget
          icon={
            <MdCalendarToday className="h-6 w-6 text-brand-500 dark:text-white" />
          }
          title="Open Accounting Periods"
          subtitle={stats.openPeriods.toString()}
        />
        <Widget
          icon={
            <MdAccountBalanceWallet className="h-6 w-6 text-brand-500 dark:text-white" />
          }
          title="Chart of Accounts"
          subtitle={stats.accounts.toString()}
        />
        <Widget
          icon={
            <MdOutlineAccountBalance className="h-6 w-6 text-brand-500 dark:text-white" />
          }
          title="Opening Balances"
          subtitle={stats.openingBalances.toString()}
        />
      </div>
    </div>
  );
}
