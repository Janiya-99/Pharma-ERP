import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { financeApi } from "../../../../api/financeApi";
import { useAuth } from "../../../../auth/AuthContext";
import FinancePageHeader from "../../../../components/finance/FinancePageHeader";
import VoucherStatusBadge from "../../../../components/finance/VoucherStatusBadge";
import VoucherPostedStatusBadge from "../../../../components/finance/VoucherPostedStatusBadge";
import PaymentMethodBadge from "../../../../components/finance/PaymentMethodBadge";
import VoucherActionButtons from "../../../../components/finance/VoucherActionButtons";
import MoneyDisplay from "../../../../components/finance/MoneyDisplay";
import FinancialYearSelect from "../../../../components/finance/FinancialYearSelect";
import AccountingPeriodSelect from "../../../../components/finance/AccountingPeriodSelect";
import SubmitVoucherModal from "../shared/SubmitVoucherModal";
import ApproveVoucherModal from "../shared/ApproveVoucherModal";
import RejectVoucherModal from "../shared/RejectVoucherModal";
import PostVoucherConfirmModal from "../shared/PostVoucherConfirmModal";

export default function ReceiptVouchersPage() {
  const history = useHistory();
  const { hasPermission, activeSoftware } = useAuth();
  
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    financial_year_id: "",
    accounting_period_id: "",
    receipt_type: "",
    receipt_method: "",
    approval_status: "",
    posted_status: "",
    receipt_date_from: "",
    receipt_date_to: "",
    search: ""
  });

  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  const [modalState, setModalState] = useState({
    type: null, // "submit", "approve", "reject", "post"
    voucher: null
  });

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const params = { ...filters, page: pagination.page, limit: pagination.limit };
      const res = await financeApi.getReceiptVouchers(params);
      if (res.data?.success) {
        setVouchers(res.data.data);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      console.error("Failed to load receipt vouchers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSoftware?.software_code === "FINANCE") {
      fetchVouchers();
    }
  }, [filters, pagination.page, activeSoftware]);

  const handleAction = async (action: unknown, voucher: unknown) => {
    if (action === "edit") {
      history.push(`/admin/finance/receipt-vouchers/${voucher.id}/edit`);
    } else if (action === "delete") {
      if (window.confirm("Are you sure you want to delete this receipt voucher?")) {
        try {
          await financeApi.deleteReceiptVoucher(voucher.id);
          fetchVouchers();
        } catch (err) {
          alert("Failed to delete: " + (err.response?.data?.message || err.message));
        }
      }
    } else {
      setModalState({ type: action, voucher });
    }
  };

  if (activeSoftware?.software_code !== "FINANCE") {
    return <div className="p-8 text-center text-red-500 font-medium">Please switch to Finance module to access this page.</div>;
  }

  return (
    <div className="flex flex-col gap-4 py-4 h-full">
      <FinancePageHeader
        title="Receipt Vouchers"
        subtitle="Manage incoming receipts and approvals"
        onAdd={hasPermission("finance.receipt.create") ? () => history.push("/admin/finance/receipt-vouchers/create") : undefined}
        addLabel="Create Receipt Voucher"
      />

      {/* Filters Section */}
      <div className="bg-white dark:bg-navy-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-navy-700">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <FinancialYearSelect
            value={filters.financial_year_id}
            onChange={(val: unknown) => setFilters((prev: unknown) => ({ ...prev, financial_year_id: val, accounting_period_id: "" }))}
            placeholder="All Financial Years"
          />
          <AccountingPeriodSelect
            financialYearId={filters.financial_year_id}
            value={filters.accounting_period_id}
            onChange={(val: unknown) => setFilters((prev: unknown) => ({ ...prev, accounting_period_id: val }))}
            placeholder="All Accounting Periods"
          />
          <select
            value={filters.receipt_type}
            onChange={(e: any) => setFilters((prev: unknown) => ({ ...prev, receipt_type: e.target.value }))}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-navy-500"
          >
            <option value="">All Receipt Types</option>
            <option value="customer_receipt">Customer Receipt</option>
            <option value="supplier_refund">Supplier Refund</option>
            <option value="other_receipt">Other Receipt</option>
          </select>
          <select
            value={filters.receipt_method}
            onChange={(e: any) => setFilters((prev: unknown) => ({ ...prev, receipt_method: e.target.value }))}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-navy-500"
          >
            <option value="">All Receipt Methods</option>
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cheque">Cheque</option>
            <option value="online_transfer">Online Transfer</option>
            <option value="card">Card</option>
          </select>
          <select
            value={filters.approval_status}
            onChange={(e: any) => setFilters((prev: unknown) => ({ ...prev, approval_status: e.target.value }))}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-navy-500"
          >
            <option value="">All Approval Statuses</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={filters.posted_status}
            onChange={(e: any) => setFilters((prev: unknown) => ({ ...prev, posted_status: e.target.value }))}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-navy-500"
          >
            <option value="">All Posted Statuses</option>
            <option value="unposted">Unposted</option>
            <option value="posted">Posted</option>
          </select>
          <input
            type="date"
            value={filters.receipt_date_from}
            onChange={(e: any) => setFilters((prev: unknown) => ({ ...prev, receipt_date_from: e.target.value }))}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-navy-500"
            title="Receipt Date From"
          />
          <input
            type="date"
            value={filters.receipt_date_to}
            onChange={(e: any) => setFilters((prev: unknown) => ({ ...prev, receipt_date_to: e.target.value }))}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-navy-500"
            title="Receipt Date To"
          />
          <input
            type="text"
            placeholder="Search Reference..."
            value={filters.search}
            onChange={(e: any) => setFilters((prev: unknown) => ({ ...prev, search: e.target.value }))}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-navy-500"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="flex-1 bg-white dark:bg-navy-800 rounded-xl shadow-sm border border-gray-100 dark:border-navy-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-navy-700/50 text-gray-500 dark:text-gray-300 font-semibold border-b border-gray-200 dark:border-navy-700">
              <tr>
                <th className="px-4 py-3">Voucher Number</th>
                <th className="px-4 py-3">Receipt Date</th>
                <th className="px-4 py-3">Receipt Type</th>
                <th className="px-4 py-3">Method</th>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3 text-right">Total Amount</th>
                <th className="px-4 py-3 text-center">Approval Status</th>
                <th className="px-4 py-3 text-center">Posted Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-navy-700">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : vouchers.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-gray-500">No receipt vouchers found.</td>
                </tr>
              ) : (
                vouchers.map((voucher: unknown) => (
                  <tr key={voucher.id} className="hover:bg-gray-50 dark:hover:bg-navy-700/30">
                    <td className="px-4 py-3 font-medium text-navy-700">
                      <button 
                        onClick={() => history.push(`/admin/finance/receipt-vouchers/${voucher.id}`)}
                        className="text-brand-500 hover:underline"
                      >
                        {voucher.receipt_voucher_number}
                      </button>
                    </td>
                    <td className="px-4 py-3">{new Date(voucher.receipt_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 capitalize">{voucher.receipt_type?.replace(/_/g, " ")}</td>
                    <td className="px-4 py-3">
                      <PaymentMethodBadge method={voucher.receipt_method} />
                    </td>
                    <td className="px-4 py-3">{voucher.reference_number || "-"}</td>
                    <td className="px-4 py-3 text-right"><MoneyDisplay amount={voucher.total_amount} /></td>
                    <td className="px-4 py-3 text-center">
                      <VoucherStatusBadge status={voucher.approval_status} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <VoucherPostedStatusBadge status={voucher.posted_status} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <VoucherActionButtons voucher={voucher} type="receipt" onAction={handleAction} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-navy-700">
          <span className="text-gray-500">Total Records: {pagination.total}</span>
          <div className="flex gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => setPagination((prev: unknown) => ({ ...prev, page: prev.page - 1 }))}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1">Page {pagination.page}</span>
            <button
              disabled={vouchers.length < pagination.limit}
              onClick={() => setPagination((prev: unknown) => ({ ...prev, page: prev.page + 1 }))}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      <SubmitVoucherModal
        isOpen={modalState.type === "submit"}
        onClose={() => setModalState({ type: null, voucher: null })}
        voucher={modalState.voucher}
        type="receipt"
        onSuccess={fetchVouchers}
      />
      <ApproveVoucherModal
        isOpen={modalState.type === "approve"}
        onClose={() => setModalState({ type: null, voucher: null })}
        voucher={modalState.voucher}
        type="receipt"
        onSuccess={fetchVouchers}
      />
      <RejectVoucherModal
        isOpen={modalState.type === "reject"}
        onClose={() => setModalState({ type: null, voucher: null })}
        voucher={modalState.voucher}
        type="receipt"
        onSuccess={fetchVouchers}
      />
      <PostVoucherConfirmModal
        isOpen={modalState.type === "post"}
        onClose={() => setModalState({ type: null, voucher: null })}
        voucher={modalState.voucher}
        type="receipt"
        onSuccess={fetchVouchers}
      />
    </div>
  );
}
