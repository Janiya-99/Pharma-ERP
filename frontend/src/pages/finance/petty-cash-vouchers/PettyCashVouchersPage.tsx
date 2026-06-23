import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { financeApi } from "../../../../api/financeApi";
import { useAuth } from "../../../../auth/AuthContext";
import FinancePageHeader from "../../../../components/finance/FinancePageHeader";
import MoneyDisplay from "../../../../components/finance/MoneyDisplay";
import PettyCashVoucherTypeBadge from "../../../../components/finance/PettyCashVoucherTypeBadge";
import PettyCashStatusBadge from "../../../../components/finance/PettyCashStatusBadge";
import PettyCashPostedStatusBadge from "../../../../components/finance/PettyCashPostedStatusBadge";
import PettyCashActionButtons from "../../../../components/finance/PettyCashActionButtons";

import SubmitPettyCashModal from "../petty-cash/shared/SubmitPettyCashModal";
import ApprovePettyCashModal from "../petty-cash/shared/ApprovePettyCashModal";
import RejectPettyCashModal from "../petty-cash/shared/RejectPettyCashModal";
import PostPettyCashConfirmModal from "../petty-cash/shared/PostPettyCashConfirmModal";
import { toast } from "react-hot-toast";
import { MdVisibility } from "react-icons/md";

export default function PettyCashVouchersPage() {
  const history = useHistory();
  const { hasPermission, activeSoftware } = useAuth();
  
  const [vouchers, setVouchers] = useState([]);
  const [funds, setFunds] = useState([]);
  const [financialYears, setFinancialYears] = useState([]);
  const [accountingPeriods, setAccountingPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    petty_cash_fund_id: "",
    financial_year_id: "",
    accounting_period_id: "",
    voucher_type: "",
    approval_status: "",
    posted_status: "",
    voucher_date_from: "",
    voucher_date_to: "",
    search: ""
  });

  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  // Modals state
  const [actionVoucherId, setActionVoucherId] = useState(null);
  const [modals, setModals] = useState({
    submit: false,
    approve: false,
    reject: false,
    post: false
  });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDependencies = async () => {
    try {
      const [fundsRes, fyRes, apRes] = await Promise.all([
        financeApi.getPettyCashFunds({ limit: 100 }),
        financeApi.getFinancialYears({ limit: 100 }),
        financeApi.getAccountingPeriods({ limit: 100 })
      ]);
      if (fundsRes.data?.success) setFunds(fundsRes.data.data);
      if (fyRes.data?.success) setFinancialYears(fyRes.data.data);
      if (apRes.data?.success) setAccountingPeriods(apRes.data.data);
    } catch (err) {
      console.error("Failed to load dependencies", err);
    }
  };

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const params = { ...filters, page: pagination.page, limit: pagination.limit };
      const res = await financeApi.getPettyCashVouchers(params);
      if (res.data?.success) {
        setVouchers(res.data.data);
        if (res.data.pagination) setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error("Failed to load petty cash vouchers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSoftware?.software_code === "FINANCE") {
      fetchDependencies();
    }
  }, [activeSoftware]);

  useEffect(() => {
    if (activeSoftware?.software_code === "FINANCE") {
      fetchVouchers();
    }
  }, [filters, pagination.page, activeSoftware]);

  const handleDelete = async (id: string | number) => {
    if (window.confirm("Are you sure you want to delete this petty cash voucher?")) {
      try {
        await financeApi.deletePettyCashVoucher(id);
        toast.success("Voucher deleted successfully");
        fetchVouchers();
      } catch (err) {
        toast.error("Failed to delete: " + (err.response?.data?.message || err.message));
      }
    }
  };

  // Workflow Handlers
  const handleAction = async (actionFn: unknown, id: string | number, payload: Record<string, unknown>, modalName: unknown) => {
    setActionLoading(true);
    try {
      await actionFn(id, payload);
      toast.success(`Action successful`);
      setModals((prev: unknown) => ({ ...prev, [modalName]: false }));
      fetchVouchers();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to perform action`);
    } finally {
      setActionLoading(false);
    }
  };

  if (activeSoftware?.software_code !== "FINANCE") {
    return <div className="p-8 text-center text-red-500 font-medium">Please switch to Finance module to access this page.</div>;
  }

  return (
    <div className="flex flex-col gap-4 py-4 h-full">
      <FinancePageHeader
        title="Petty Cash Vouchers"
        subtitle="Manage and track petty cash expenses, advances, and refunds"
        onAdd={hasPermission("finance.petty_cash_voucher.create") ? () => history.push("/admin/finance/petty-cash-vouchers/create") : undefined}
        addLabel="Create Petty Cash Voucher"
      />

      <div className="bg-white dark:bg-navy-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-navy-700">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <select value={filters.petty_cash_fund_id} onChange={(e: any) => setFilters((prev: unknown) => ({ ...prev, petty_cash_fund_id: e.target.value }))} className="w-full px-3 py-2 border rounded-md dark:bg-navy-900 dark:border-navy-600 dark:text-white">
            <option value="">All Funds</option>
            {funds.map((f: unknown) => <option key={f.id} value={f.id}>{f.fund_code} - {f.fund_name}</option>)}
          </select>
          <select value={filters.voucher_type} onChange={(e: any) => setFilters((prev: unknown) => ({ ...prev, voucher_type: e.target.value }))} className="w-full px-3 py-2 border rounded-md dark:bg-navy-900 dark:border-navy-600 dark:text-white">
            <option value="">All Types</option>
            <option value="expense">Expense</option>
            <option value="advance">Advance</option>
            <option value="refund">Refund</option>
            <option value="adjustment">Adjustment</option>
          </select>
          <select value={filters.approval_status} onChange={(e: any) => setFilters((prev: unknown) => ({ ...prev, approval_status: e.target.value }))} className="w-full px-3 py-2 border rounded-md dark:bg-navy-900 dark:border-navy-600 dark:text-white">
            <option value="">All Approval Statuses</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select value={filters.posted_status} onChange={(e: any) => setFilters((prev: unknown) => ({ ...prev, posted_status: e.target.value }))} className="w-full px-3 py-2 border rounded-md dark:bg-navy-900 dark:border-navy-600 dark:text-white">
            <option value="">All Posted Statuses</option>
            <option value="unposted">Unposted</option>
            <option value="posted">Posted</option>
          </select>
          <input type="text" placeholder="Search Payee/Ref/Voucher No..." value={filters.search} onChange={(e: any) => setFilters((prev: unknown) => ({ ...prev, search: e.target.value }))} className="w-full px-3 py-2 border rounded-md dark:bg-navy-900 dark:border-navy-600 dark:text-white" />
        </div>
      </div>

      <div className="flex-1 bg-white dark:bg-navy-800 rounded-xl shadow-sm border border-gray-100 dark:border-navy-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-navy-700/50 text-gray-500 dark:text-gray-300 font-semibold border-b border-gray-200 dark:border-navy-700">
              <tr>
                <th className="px-4 py-3">Voucher Number</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Fund</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Payee</th>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-navy-700 text-gray-700 dark:text-gray-300">
              {loading ? (
                <tr><td colSpan="9" className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : vouchers.length === 0 ? (
                <tr><td colSpan="9" className="px-4 py-8 text-center text-gray-500">No petty cash vouchers found.</td></tr>
              ) : (
                vouchers.map((v: unknown) => (
                  <tr key={v.id} className="hover:bg-gray-50 dark:hover:bg-navy-700/30">
                    <td className="px-4 py-3 font-medium text-navy-700 dark:text-white">{v.voucher_number || '-'}</td>
                    <td className="px-4 py-3">{v.voucher_date}</td>
                    <td className="px-4 py-3">{v.petty_cash_fund?.fund_code}</td>
                    <td className="px-4 py-3"><PettyCashVoucherTypeBadge type={v.voucher_type} /></td>
                    <td className="px-4 py-3">{v.payee_name}</td>
                    <td className="px-4 py-3">{v.reference_number}</td>
                    <td className="px-4 py-3 text-right font-medium"><MoneyDisplay amount={v.total_amount} /></td>
                    <td className="px-4 py-3 text-center space-y-1">
                      <div className="flex flex-col items-center gap-1">
                        <PettyCashStatusBadge status={v.approval_status} />
                        {v.approval_status === "approved" && <PettyCashPostedStatusBadge status={v.posted_status} />}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col gap-2 justify-center items-center">
                        <div className="flex items-center gap-2">
                          {hasPermission("finance.petty_cash_voucher.view") && (
                            <button onClick={() => history.push(`/admin/finance/petty-cash-vouchers/${v.id}`)} className="text-gray-500 hover:text-navy-700 dark:hover:text-white" title="View Details">
                              <MdVisibility className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                        <PettyCashActionButtons
                          approvalStatus={v.approval_status}
                          postedStatus={v.posted_status}
                          permissions={{
                            update: "finance.petty_cash_voucher.update",
                            delete: "finance.petty_cash_voucher.delete",
                            submit: "finance.petty_cash_voucher.submit",
                            approve: "finance.petty_cash_voucher.approve",
                            reject: "finance.petty_cash_voucher.reject",
                            post: "finance.petty_cash_voucher.post"
                          }}
                          onEdit={() => history.push(`/admin/finance/petty-cash-vouchers/${v.id}/edit`)}
                          onDelete={() => handleDelete(v.id)}
                          onSubmit={() => { setActionVoucherId(v.id); setModals((m: unknown) => ({ ...m, submit: true })); }}
                          onApprove={() => { setActionVoucherId(v.id); setModals((m: unknown) => ({ ...m, approve: true })); }}
                          onReject={() => { setActionVoucherId(v.id); setModals((m: unknown) => ({ ...m, reject: true })); }}
                          onPost={() => { setActionVoucherId(v.id); setModals((m: unknown) => ({ ...m, post: true })); }}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-navy-700 bg-gray-50 dark:bg-navy-800 text-gray-500 dark:text-gray-400">
          <span>Total Records: {pagination.total}</span>
          <div className="flex gap-2">
            <button disabled={pagination.page <= 1} onClick={() => setPagination((prev: unknown) => ({ ...prev, page: prev.page - 1 }))} className="px-3 py-1 border border-gray-300 dark:border-navy-600 rounded disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-navy-700 transition-colors">Previous</button>
            <span className="px-3 py-1">Page {pagination.page}</span>
            <button disabled={vouchers.length < pagination.limit} onClick={() => setPagination((prev: unknown) => ({ ...prev, page: prev.page + 1 }))} className="px-3 py-1 border border-gray-300 dark:border-navy-600 rounded disabled:opacity-50 hover:bg-gray-100 dark:hover:bg-navy-700 transition-colors">Next</button>
          </div>
        </div>
      </div>

      {/* Action Modals */}
      <SubmitPettyCashModal
        isOpen={modals.submit}
        onClose={() => setModals((m: unknown) => ({ ...m, submit: false }))}
        isSubmitting={actionLoading}
        onSubmit={(payload: Record<string, unknown>) => handleAction(financeApi.submitPettyCashVoucher, actionVoucherId, payload, "submit")}
      />
      <ApprovePettyCashModal
        isOpen={modals.approve}
        onClose={() => setModals((m: unknown) => ({ ...m, approve: false }))}
        isSubmitting={actionLoading}
        onApprove={(payload: Record<string, unknown>) => handleAction(financeApi.approvePettyCashVoucher, actionVoucherId, payload, "approve")}
      />
      <RejectPettyCashModal
        isOpen={modals.reject}
        onClose={() => setModals((m: unknown) => ({ ...m, reject: false }))}
        isSubmitting={actionLoading}
        onReject={(payload: Record<string, unknown>) => handleAction(financeApi.rejectPettyCashVoucher, actionVoucherId, payload, "reject")}
      />
      <PostPettyCashConfirmModal
        isOpen={modals.post}
        onClose={() => setModals((m: unknown) => ({ ...m, post: false }))}
        isSubmitting={actionLoading}
        onConfirm={() => handleAction(financeApi.postPettyCashVoucher, actionVoucherId, undefined, "post")}
      />
    </div>
  );
}
