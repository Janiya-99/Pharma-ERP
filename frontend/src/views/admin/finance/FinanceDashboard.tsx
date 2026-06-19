import React, { useEffect, useState } from "react";
import Widget from "components/widget/Widget";
import { MdAccountBalanceWallet, MdReceiptLong, MdAttachMoney } from "react-icons/md";
import api from "lib/api";

export default function FinanceDashboard() {
  const [stats, setStats] = useState({
    accounts: 0,
    journals: 0,
  });

  const fetchStats = async () => {
    try {
      const [accounts, journals] = await Promise.all([
        api.get("/finance/accounts"),
        api.get("/finance/journals"),
      ]);

      setStats({
        accounts: accounts.data.data?.length || 0,
        journals: journals.data.data?.length || 0,
      });
    } catch (err) {
      console.error("Failed to fetch finance stats", err);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-5 py-5">
      <div className="flex flex-col mb-4">
        <h1 className="text-2xl font-bold text-navy-700 dark:text-white">Finance Dashboard</h1>
        <p className="text-sm text-gray-400">Realtime overview of financial transactions and accounts</p>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3">
        <Widget
          icon={<MdAccountBalanceWallet className="h-6 w-6 text-brand-500 dark:text-white" />}
          title="Chart of Accounts"
          subtitle={stats.accounts.toString()}
        />
        <Widget
          icon={<MdReceiptLong className="h-6 w-6 text-brand-500 dark:text-white" />}
          title="Journal Entries"
          subtitle={stats.journals.toString()}
        />
        <Widget
          icon={<MdAttachMoney className="h-6 w-6 text-brand-500 dark:text-white" />}
          title="Pending Payments"
          subtitle="0"
        />
      </div>
    </div>
  );
}
