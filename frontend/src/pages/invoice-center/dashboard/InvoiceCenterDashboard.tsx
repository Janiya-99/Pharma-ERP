import React, { useState, useEffect } from "react";
import { useAuth } from "../../../auth/AuthContext";
import { invoiceCenterApi } from "../../../api/invoiceCenterApi";
import { CustomerStatusBadge, CustomerTypeBadge } from "../../../components/invoice-center";
import { Users, UserCheck, UserX, ShieldAlert, PauseCircle, DollarSign, CreditCard, RefreshCw, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, colorClass, subtitle }) => (
  <div className="bg-white dark:bg-navy-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-navy-700 flex items-start justify-between transition-all hover:shadow-md">
    <div>
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{title}</p>
      <h3 className="text-2xl font-extrabold text-navy-900 dark:text-white mt-1">{value}</h3>
      {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
    </div>
    <div className={`p-3 rounded-xl ${colorClass}`}>
      <Icon className="w-6 h-6" />
    </div>
  </div>
);

interface DashboardSummary {
  total_customers?: number;
  active_customers?: number;
  inactive_customers?: number;
  blocked_customers?: number;
  on_hold_customers?: number;
  customers_over_credit_limit?: number;
  total_credit_limit?: number;
  total_customer_balance?: number;
  total_customer_categories?: number;
}

interface Customer {
  id: number;
  customer_code: string;
  customer_name: string;
  customer_type: string;
  credit_limit: number;
  current_balance: number;
  status: string;
}

const InvoiceCenterDashboard: React.FC = () => {
  const { activeSoftware } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentCustomers, setRecentCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [sumRes, custRes] = await Promise.all([
        invoiceCenterApi.getInvoiceCenterDashboard(),
        invoiceCenterApi.getCustomers({ limit: 5 }),
      ]);

      if (sumRes.data?.success) {
        setSummary(sumRes.data.data);
      }
      if (custRes.data?.success) {
        setRecentCustomers(custRes.data.data || []);
      }
    } catch (err) {
      console.error("Dashboard load error:", err);
      setError("Failed to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (activeSoftware?.software_code === "INVOICE_CENTER") {
      fetchData();
    }
  }, [activeSoftware]);

  if (activeSoftware?.software_code !== "INVOICE_CENTER") {
    return (
      <div className="p-8 text-center bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-2xl font-medium border border-rose-200 dark:border-rose-800 m-6">
        Please switch to Invoice Center module to access this page.
      </div>
    );
  }

  const formatLKR = (val?: number) => `LKR ${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-navy-900 via-navy-800 to-indigo-900 text-white p-6 rounded-3xl shadow-lg">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Invoice Center Dashboard</h1>
          <p className="text-navy-200 text-sm mt-1">Manage customer masters, credit allocations, and sales pipelines.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchData(true)}
            disabled={refreshing || loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium backdrop-blur-md transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            onClick={() => navigate("/invoice-center/customers/create")}
            className="px-4 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold shadow-md transition-all"
          >
            + New Customer
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 dark:bg-navy-800 rounded-2xl"></div>
          ))}
        </div>
      ) : summary ? (
        <>
          {/* Summary Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard title="Total Customers" value={summary.total_customers || 0} icon={Users} colorClass="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" subtitle={`${summary.total_customer_categories || 0} categories`} />
            <StatCard title="Active Customers" value={summary.active_customers || 0} icon={UserCheck} colorClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" />
            <StatCard title="Inactive Customers" value={summary.inactive_customers || 0} icon={UserX} colorClass="bg-gray-100 text-gray-600 dark:bg-navy-700 dark:text-gray-300" />
            <StatCard title="Blocked Customers" value={summary.blocked_customers || 0} icon={ShieldAlert} colorClass="bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400" />
            
            <StatCard title="On Hold Customers" value={summary.on_hold_customers || 0} icon={PauseCircle} colorClass="bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" />
            <StatCard title="Over Credit Limit" value={summary.customers_over_credit_limit || 0} icon={CreditCard} colorClass="bg-rose-50 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400" subtitle="Requires action" />
            <StatCard title="Total Credit Limit" value={formatLKR(summary.total_credit_limit)} icon={DollarSign} colorClass="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" />
            <StatCard title="Total Outstanding" value={formatLKR(summary.total_customer_balance)} icon={DollarSign} colorClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" subtitle="Total accounts receivable" />
          </div>

          {/* Quick Statistics Table */}
          <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-100 dark:border-navy-700 overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-navy-700 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-navy-900 dark:text-white">Recent Customers</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Recently added or updated customer records</p>
              </div>
              <button
                onClick={() => navigate("/invoice-center/customers")}
                className="flex items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400"
              >
                View All <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-navy-700/50 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Code</th>
                    <th className="py-3 px-4">Customer Name</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Credit Limit</th>
                    <th className="py-3 px-4">Balance</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-navy-700 text-sm">
                  {recentCustomers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">
                        No customers registered yet.
                      </td>
                    </tr>
                  ) : (
                    recentCustomers.map((cust) => (
                      <tr
                        key={cust.id}
                        onClick={() => navigate(`/invoice-center/customers/${cust.id}`)}
                        className="hover:bg-gray-50/80 dark:hover:bg-navy-700/50 cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-4 font-mono font-medium text-navy-900 dark:text-white">{cust.customer_code}</td>
                        <td className="py-3 px-4 font-semibold text-navy-900 dark:text-white">{cust.customer_name}</td>
                        <td className="py-3 px-4"><CustomerTypeBadge type={cust.customer_type} /></td>
                        <td className="py-3 px-4 font-medium text-gray-700 dark:text-gray-300">{formatLKR(cust.credit_limit)}</td>
                        <td className="py-3 px-4 font-bold text-navy-900 dark:text-white">{formatLKR(cust.current_balance)}</td>
                        <td className="py-3 px-4"><CustomerStatusBadge status={cust.status} /></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default InvoiceCenterDashboard;
