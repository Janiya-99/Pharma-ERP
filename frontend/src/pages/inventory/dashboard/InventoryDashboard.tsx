import { useState, useEffect } from "react";
import { Package, AlertTriangle, AlertCircle, TrendingDown, DollarSign, Database, ShieldAlert, Archive } from "lucide-react";
import { inventoryApi } from "../../../api/inventoryApi";
import { useAuth } from "../../../auth/AuthContext";

const StatCard = ({ title, value, icon: Icon, colorClass, subtitle }: { title?: unknown; value?: unknown; Icon?: unknown; colorClass?: unknown; subtitle?: unknown }) => (
  <div className="bg-white dark:bg-navy-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-navy-700">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold text-navy-700 dark:text-white mt-1">{value}</h3>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-xl ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </div>
);

const InventoryDashboard = () => {
  const { user, activeSoftware, activeBranch } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await inventoryApi.getInventoryDashboard();
        if (response.data?.success) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <div className="p-6 text-center">Loading dashboard...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-700 dark:text-white">Inventory Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Overview of inventory health and metrics</p>
        </div>
        <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400 bg-white dark:bg-navy-800 px-4 py-2 rounded-xl shadow-sm border border-gray-100 dark:border-navy-700">
          <div>
            <span className="block text-[10px] uppercase font-bold text-gray-400">Branch</span>
            <span className="font-medium text-navy-700 dark:text-white">{activeBranch?.branch_name || "Head Office"}</span>
          </div>
          <div className="w-px bg-gray-200 dark:bg-navy-600"></div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-gray-400">Software</span>
            <span className="font-medium text-brand-600 dark:text-brand-400">{activeSoftware?.software_name}</span>
          </div>
          <div className="w-px bg-gray-200 dark:bg-navy-600"></div>
          <div>
            <span className="block text-[10px] uppercase font-bold text-gray-400">User</span>
            <span className="font-medium text-navy-700 dark:text-white">{user?.name}</span>
          </div>
        </div>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Products" value={stats.total_products} icon={Package} colorClass="bg-blue-50 text-blue-600" subtitle={`${stats.active_products} active products`} />
          <StatCard title="Total Stock Value" value={`Rs. ${Number(stats.total_stock_value || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}`} icon={DollarSign} colorClass="bg-emerald-50 text-emerald-600" />
          <StatCard title="Total Warehouses" value={stats.total_warehouses} icon={Database} colorClass="bg-indigo-50 text-indigo-600" />
          <StatCard title="Low Stock Products" value={stats.low_stock_products} icon={TrendingDown} colorClass="bg-orange-50 text-orange-600" subtitle="Below reorder level" />
          
          <StatCard title="Total Batches" value={stats.total_batches} icon={Archive} colorClass="bg-gray-50 text-gray-600" />
          <StatCard title="Near Expiry Batches" value={stats.near_expiry_batches} icon={AlertTriangle} colorClass="bg-yellow-50 text-yellow-600" subtitle="Expiring within 90 days" />
          <StatCard title="Expired Batches" value={stats.expired_batches} icon={AlertCircle} colorClass="bg-red-50 text-red-600" subtitle="Past expiration date" />
          <StatCard title="Blocked Batches" value={stats.blocked_batches} icon={ShieldAlert} colorClass="bg-purple-50 text-purple-600" subtitle="Quarantined or recalled" />
        </div>
      )}
    </div>
  );
};

export default InventoryDashboard;
