import React, { useState, useEffect } from "react";
import { useAuth } from "../../../auth/AuthContext";
import { invoiceCenterApi } from "../../../api/invoiceCenterApi";
import {
  CustomerStatusBadge,
  CustomerTypeBadge,
  CustomerActionButtons,
} from "../../../components/invoice-center";
import ChangeCustomerStatusModal from "./ChangeCustomerStatusModal";
import PermissionGuard from "../../../auth/PermissionGuard";
import { Search, Plus, RefreshCw, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../../components/common/PageHeader";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { TablePagination } from "../../../components/common/TablePagination";

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
  const [statusModal, setStatusModal] = useState<{
    isOpen: boolean;
    customer: Customer | null;
  }>({
    isOpen: false,
    customer: null,
  });
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    if (page > 0 && page * pageSize >= customers.length) {
      setPage(0);
    }
  }, [customers, page, pageSize]);

  const pagedCustomers = React.useMemo(() => {
    const start = page * pageSize;
    return customers.slice(start, start + pageSize);
  }, [customers, page, pageSize]);

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
    if (!window.confirm(`Are you sure you want to delete customer "${name}"?`))
      return;
    try {
      await invoiceCenterApi.deleteCustomer(id);
      fetchCustomers();
    } catch (err: any) {
      console.error("Delete customer error:", err);
      alert(
        err.response?.data?.message ||
          "Cannot delete customer. They might have active transactions."
      );
    }
  };

  if (activeSoftware?.software_code !== "INVOICE_CENTER") {
    return (
      <div className="bg-rose-50  text-rose-600  border-rose-200  m-6 rounded-2xl border p-8 text-center font-medium">
        Please switch to Invoice Center module to access this page.
      </div>
    );
  }

  const formatLKR = (val?: number) =>
    `LKR ${Number(val || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
    })}`;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-6">
      {/* Header */}
      <PageHeader
        title="Customers"
        description="Manage customer profiles, credit accounts, and contact points"
        action={
          <div className="flex items-center gap-3">
            <button
              onClick={fetchCustomers}
              disabled={loading}
              className="rounded-xl border border-slate-200 bg-white/80 p-2.5 text-slate-600 transition-colors hover:bg-slate-100 shadow-xs"
              title="Refresh"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <PermissionGuard permission="invoice_center.customer.create">
              <button
                onClick={() => navigate("/invoice-center/customers/create")}
                className="flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-all hover:bg-brand-600"
              >
                <Plus className="h-4 w-4" /> Add Customer
              </button>
            </PermissionGuard>
          </div>
        }
      />

      {error && (
        <div className="bg-rose-50 border-rose-200 text-rose-700 flex items-center gap-2 rounded-xl border p-4 text-sm">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Filters bar */}
      <div className="grid grid-cols-1 gap-4 rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-md p-4 shadow-xs sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="Search code, name, phone..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-navy-500  "
          />
        </div>

        <Select
          value={filters.category_id || "all"}
          onValueChange={(value) =>
            setFilters({ ...filters, category_id: value === "all" ? "" : value })
          }
        >
          <SelectTrigger className="bg-gray-50">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={String(c.id)}>
              {c.category_name}
            </SelectItem>
          ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.customer_type || "all"}
          onValueChange={(value) =>
            setFilters({ ...filters, customer_type: value === "all" ? "" : value })
          }
        >
          <SelectTrigger className="bg-gray-50">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="pharmacy">Pharmacy</SelectItem>
            <SelectItem value="hospital">Hospital</SelectItem>
            <SelectItem value="clinic">Clinic</SelectItem>
            <SelectItem value="doctor">Doctor</SelectItem>
            <SelectItem value="distributor">Distributor</SelectItem>
            <SelectItem value="retailer">Retailer</SelectItem>
            <SelectItem value="wholesaler">Wholesaler</SelectItem>
            <SelectItem value="individual">Individual</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.status || "all"}
          onValueChange={(value) =>
            setFilters({ ...filters, status: value === "all" ? "" : value })
          }
        >
          <SelectTrigger className="bg-gray-50">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="blocked">Blocked</SelectItem>
            <SelectItem value="on_hold">On Hold</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-md shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-400 ">
                <th className="px-4 py-3.5">Code</th>
                <th className="px-4 py-3.5">Customer Name</th>
                <th className="px-4 py-3.5">Type</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Phone</th>
                <th className="px-4 py-3.5">Credit Limit</th>
                <th className="px-4 py-3.5">Balance</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm ">
              {loading ? (
                <tr>
                  <td
                    colSpan={9}
                    className="animate-pulse py-12 text-center font-medium text-gray-400"
                  >
                    Loading customers...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="py-12 text-center text-gray-500 "
                  >
                    No customers found matching filters.
                  </td>
                </tr>
              ) : (
                pagedCustomers.map((cust) => (
                  <tr
                    key={cust.id}
                    className="transition-colors hover:bg-gray-50/80 "
                  >
                    <td className="px-4 py-3.5 font-mono font-semibold text-navy-900 ">
                      {cust.customer_code}
                    </td>
                    <td
                      onClick={() =>
                        navigate(`/invoice-center/customers/${cust.id}`)
                      }
                      className="cursor-pointer px-4 py-3.5 font-bold text-brand-600 hover:text-brand-700 "
                    >
                      {cust.customer_name}
                    </td>
                    <td className="px-4 py-3.5">
                      <CustomerTypeBadge type={cust.customer_type} />
                    </td>
                    <td className="px-4 py-3.5 text-gray-700 font-medium">
                      {cust.customer_category_name || cust.category_name || cust.category?.category_name || "—"}
                    </td>
                    <td className="px-4 py-3.5 text-gray-600 font-mono text-xs">
                      {cust.primary_contact_number || cust.phone || cust.mobile || "—"}
                    </td>
                    <td className="px-4 py-3.5 font-medium text-gray-700 ">
                      {formatLKR(cust.credit_limit)}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-navy-900 ">
                      {formatLKR(cust.current_balance)}
                    </td>
                    <td className="px-4 py-3.5">
                      <CustomerStatusBadge status={cust.status} />
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <CustomerActionButtons
                        onView={() =>
                          navigate(`/invoice-center/customers/${cust.id}`)
                        }
                        onEdit={() =>
                          navigate(`/invoice-center/customers/${cust.id}/edit`)
                        }
                        onChangeStatus={() =>
                          setStatusModal({ isOpen: true, customer: cust })
                        }
                        onDelete={() =>
                          handleDelete(cust.id, cust.customer_name)
                        }
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {customers.length > 0 && (
          <TablePagination
            pageIndex={page}
            pageSize={pageSize}
            totalItems={customers.length}
            onPageChange={setPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setPage(0);
            }}
          />
        )}
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
