import React, { useState, useEffect } from "react";
import { useAuth } from "../../../auth/AuthContext";
import { invoiceCenterApi } from "../../../api/invoiceCenterApi";
import { CustomerStatusBadge, CustomerTypeBadge, CustomerActionButtons } from "../../../components/invoice-center";
import ChangeCustomerStatusModal from "./ChangeCustomerStatusModal";
import PermissionGuard from "../../../auth/PermissionGuard";
import { Search, Plus, RefreshCw, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Category {
  id: number;
  category_name: string;
}

interface Customer {
  id: number;
  customer_code: string;
  customer_name: string;
  customer_type: string;
  category_id?: number;
  category?: Category;
  phone?: string;
  credit_limit: number;
  current_balance: number;
  status: string;
}

const CustomersPage: React.FC = () => {
  const { activeSoftware } = useAuth();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: "",
    category_id: "",
    customer_type: "",
    status: "",
  });
  const [statusModal, setStatusModal] = useState<{ isOpen: boolean; customer: Customer | null }>({
    isOpen: false,
    customer: null,
  });
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      const res = await invoiceCenterApi.getCustomerCategories({ limit: 100 });
      if (res.data?.success) setCategories(res.data.data || []);
    } catch (e) {
      console.error("Categories fetch error:", e);
    }
  };

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, unknown> = {
        search: filters.search,
        status: filters.status,
        limit: 100,
      };
      if (filters.category_id) params.category_id = filters.category_id;
      if (filters.customer_type) params.customer_type = filters.customer_type;

      const response = await invoiceCenterApi.getCustomers(params);
      if (response.data?.success) {
        setCustomers(response.data.data || []);
      }
    } catch (err) {
      console.error("Fetch customers error:", err);
      setError("Failed to fetch customer list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSoftware?.software_code === "INVOICE_CENTER") {
      fetchCategories();
    }
  }, [activeSoftware]);

  useEffect(() => {
    if (activeSoftware?.software_code === "INVOICE_CENTER") {
      fetchCustomers();
    }
  }, [activeSoftware, filters]);

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete customer "${name}"?`)) return;
    try {
      await invoiceCenterApi.deleteCustomer(id);
      fetchCustomers();
    } catch (err: any) {
      console.error("Delete customer error:", err);
      alert(err.response?.data?.message || "Cannot delete customer. They might have active transactions.");
    }
  };

  if (activeSoftware?.software_code !== "INVOICE_CENTER") {
    return (
      <div className="p-8 text-center bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-2xl font-medium border border-rose-200 dark:border-rose-800 m-6">
        Please switch to Invoice Center module to access this page.
      </div>
    );
  }

  const formatLKR = (val?: number) => `LKR ${Number(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-navy-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-navy-700">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 dark:text-white">Customers</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Manage customer profiles, credit accounts, and contact points</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchCustomers}
            disabled={loading}
            className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-navy-700 dark:hover:bg-navy-600 text-gray-600 dark:text-gray-300 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? "animate-spin" : ""}`} />
          </button>
          <PermissionGuard permission="invoice_center.customer.create">
            <button
              onClick={() => navigate("/invoice-center/customers/create")}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold shadow-md transition-all"
            >
              <Plus className="w-4 h-4" /> Add Customer
            </button>
          </PermissionGuard>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Filters bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white dark:bg-navy-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-navy-700">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="Search code, name, phone..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-navy-700 border border-gray-200 dark:border-navy-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
          />
        </div>

        <select
          value={filters.category_id}
          onChange={(e) => setFilters({ ...filters, category_id: e.target.value })}
          className="px-4 py-2 bg-gray-50 dark:bg-navy-700 border border-gray-200 dark:border-navy-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.category_name}</option>
          ))}
        </select>

        <select
          value={filters.customer_type}
          onChange={(e) => setFilters({ ...filters, customer_type: e.target.value })}
          className="px-4 py-2 bg-gray-50 dark:bg-navy-700 border border-gray-200 dark:border-navy-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
        >
          <option value="">All Types</option>
          <option value="pharmacy">Pharmacy</option>
          <option value="hospital">Hospital</option>
          <option value="clinic">Clinic</option>
          <option value="doctor">Doctor</option>
          <option value="distributor">Distributor</option>
          <option value="retailer">Retailer</option>
          <option value="wholesaler">Wholesaler</option>
          <option value="individual">Individual</option>
          <option value="other">Other</option>
        </select>

        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="px-4 py-2 bg-gray-50 dark:bg-navy-700 border border-gray-200 dark:border-navy-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-500"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="blocked">Blocked</option>
          <option value="on_hold">On Hold</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-100 dark:border-navy-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-navy-700/50 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <th className="py-3.5 px-4">Code</th>
                <th className="py-3.5 px-4">Customer Name</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Phone</th>
                <th className="py-3.5 px-4">Credit Limit</th>
                <th className="py-3.5 px-4">Balance</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-navy-700 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400 animate-pulse font-medium">Loading customers...</td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-500 dark:text-gray-400">No customers found matching filters.</td>
                </tr>
              ) : (
                customers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-gray-50/80 dark:hover:bg-navy-700/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-navy-900 dark:text-white">{cust.customer_code}</td>
                    <td
                      onClick={() => navigate(`/invoice-center/customers/${cust.id}`)}
                      className="py-3.5 px-4 font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400 cursor-pointer"
                    >
                      {cust.customer_name}
                    </td>
                    <td className="py-3.5 px-4"><CustomerTypeBadge type={cust.customer_type} /></td>
                    <td className="py-3.5 px-4 text-gray-700 dark:text-gray-300">{cust.category?.category_name || "—"}</td>
                    <td className="py-3.5 px-4 text-gray-600 dark:text-gray-400">{cust.phone || "—"}</td>
                    <td className="py-3.5 px-4 font-medium text-gray-700 dark:text-gray-300">{formatLKR(cust.credit_limit)}</td>
                    <td className="py-3.5 px-4 font-bold text-navy-900 dark:text-white">{formatLKR(cust.current_balance)}</td>
                    <td className="py-3.5 px-4"><CustomerStatusBadge status={cust.status} /></td>
                    <td className="py-3.5 px-4 text-right">
                      <CustomerActionButtons
                        onView={() => navigate(`/invoice-center/customers/${cust.id}`)}
                        onEdit={() => navigate(`/invoice-center/customers/${cust.id}/edit`)}
                        onChangeStatus={() => setStatusModal({ isOpen: true, customer: cust })}
                        onDelete={() => handleDelete(cust.id, cust.customer_name)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ChangeCustomerStatusModal
        isOpen={statusModal.isOpen}
        customer={statusModal.customer}
        onClose={() => setStatusModal({ isOpen: false, customer: null })}
        onSuccess={fetchCustomers}
      />
    </div>
  );
};

export default CustomersPage;
