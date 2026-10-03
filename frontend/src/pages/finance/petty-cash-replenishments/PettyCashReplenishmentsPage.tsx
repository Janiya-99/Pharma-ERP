import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { financeApi } from "../../../api/financeApi";
import { useAuth } from "../../../auth/AuthContext";
import FinancePageHeader from "../../../components/finance/FinancePageHeader";
import MoneyDisplay from "../../../components/finance/MoneyDisplay";
import PettyCashStatusBadge from "../../../components/finance/PettyCashStatusBadge";
import PettyCashPostedStatusBadge from "../../../components/finance/PettyCashPostedStatusBadge";
import PettyCashActionButtons from "../../../components/finance/PettyCashActionButtons";

import SubmitPettyCashModal from "../petty-cash/shared/SubmitPettyCashModal";
import ApprovePettyCashModal from "../petty-cash/shared/ApprovePettyCashModal";
import RejectPettyCashModal from "../petty-cash/shared/RejectPettyCashModal";
import PostPettyCashConfirmModal from "../petty-cash/shared/PostPettyCashConfirmModal";
import { toast } from "react-hot-toast";
import { MdVisibility } from "react-icons/md";

export default function PettyCashReplenishmentsPage() {
  const history = useHistory();
  const { hasPermission, activeSoftware } = useAuth();
  
  const [replenishments, setReplenishments] = useState([]);
  const [funds, setFunds] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    petty_cash_fund_id: "",
    bank_account_id: "",
    approval_status: "",
    posted_status: "",
    search: ""
  });

  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  // Modals state
  const [actionReplenishmentId, setActionReplenishmentId] = useState(null);
  const [modals, setModals] = useState({
    submit: false,
    approve: false,
    reject: false,
    post: false
  });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDependencies = async () => {
    try {
      const [fundsRes, banksRes] = await Promise.all([
        financeApi.getPettyCashFunds({ limit: 100 }),
        financeApi.getBankAccounts({ limit: 100 })
      ]);
      if (fundsRes.data?.success) setFunds(fundsRes.data.data);
      if (banksRes.data?.success) setBankAccounts(banksRes.data.data);
    } catch (err) {
      console.error("Failed to load dependencies", err);
    }
  };

  const fetchReplenishments = async () => {
    setLoading(true);
    try {
      const params = { ...filters, page: pagination.page, limit: pagination.limit };
      const res = await financeApi.getPettyCashReplenishments(params);
      if (res.data?.success) {
        setReplenishments(res.data.data);
        if (res.data.pagination) setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error("Failed to load petty cash replenishments", err);
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
      fetchReplenishments();
    }
  }, [filters, pagination.page, activeSoftware]);

  const handleDelete = async (id: string | number) => {
    if (window.confirm("Are you sure you want to delete this petty cash replenishment?")) {
      try {
        await financeApi.deletePettyCashReplenishment(id);
        toast.success("Replenishment deleted successfully");
        fetchReplenishments();
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
      fetchReplenishments();
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
        title="Petty Cash Replenishments"
        subtitle="Manage and track petty cash fund replenishments"
        onAdd={hasPermission("finance.petty_cash_replenishment.create") ? () => history.push("/admin/finance/petty-cash-replenishments/create") : undefined}
        addLabel="Create Replenishment"
      />

      <div className="bg-white  p-4 rounded-xl shadow-sm border border-gray-100 ">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <select value={filters.petty_cash_fund_id} onChange={(e: any) => setFilters((prev: unknown) => ({ ...prev, petty_cash_fund_id: e.target.value }))} className="w-full px-3 py-2 border rounded-md   ">
            <option value="">All Funds</option>
            {funds.map((f: unknown) => <option key={f.id} value={f.id}>{f.fund_code} - {f.fund_name}</option>)}
          </select>
          <select value={filters.bank_account_id} onChange={(e: any) => setFilters((prev: unknown) => ({ ...prev, bank_account_id: e.target.value }))} className="w-full px-3 py-2 border rounded-md   ">
            <option value="">All Bank Accounts</option>
            {bankAccounts.map((b: unknown) => <option key={b.id} value={b.id}>{b.bank_name} - {b.account_number}</option>)}
          </select>
          <select value={filters.approval_status} onChange={(e: any) => setFilters((prev: unknown) => ({ ...prev, approval_status: e.target.value }))} className="w-full px-3 py-2 border rounded-md   ">
            <option value="">All Approval Statuses</option>
            <option value="draft">Draft</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <select value={filters.posted_status} onChange={(e: any) => setFilters((prev: unknown) => ({ ...prev, posted_status: e.target.value }))} className="w-full px-3 py-2 border rounded-md   ">
            <option value="">All Posted Statuses</option>
            <option value="unposted">Unposted</option>
            <option value="posted">Posted</option>
          </select>
          <input type="text" placeholder="Search Number or Ref..." value={filters.search} onChange={(e: any) => setFilters((prev: unknown) => ({ ...prev, search: e.target.value }))} className="w-full px-3 py-2 border rounded-md   " />
        </div>
      </div>

      <div className="flex-1 bg-white  rounded-xl shadow-sm border border-gray-100  overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50  text-gray-500  font-semibold border-b border-gray-200 ">
              <tr>
                <th className="px-4 py-3">Replenishment Number</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Fund</th>
                <th className="px-4 py-3">Funding Bank</th>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100  text-gray-700 ">
              {loading ? (
                <tr><td colSpan="8" className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
              ) : replenishments.length === 0 ? (
                <tr><td colSpan="8" className="px-4 py-8 text-center text-gray-500">No petty cash replenishments found.</td></tr>
              ) : (
                replenishments.map((r: unknown) => (
                  <tr key={r.id} className="hover:bg-gray-50 ">
                    <td className="px-4 py-3 font-medium text-navy-700 ">{r.replenishment_number || '-'}</td>
                    <td className="px-4 py-3">{r.replenishment_date}</td>
                    <td className="px-4 py-3">{r.petty_cash_fund?.fund_code}</td>
                    <td className="px-4 py-3">{r.bank_account?.bank_name} - {r.bank_account?.account_number}</td>
                    <td className="px-4 py-3">{r.reference_number || '-'}</td>
                    <td className="px-4 py-3 text-right font-medium"><MoneyDisplay amount={r.replenishment_amount} /></td>
                    <td className="px-4 py-3 text-center space-y-1">
                      <div className="flex flex-col items-center gap-1">
                        <PettyCashStatusBadge status={r.approval_status} />
                        {r.approval_status === "approved" && <PettyCashPostedStatusBadge status={r.posted_status} />}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex flex-col gap-2 justify-center items-center">
                        <div className="flex items-center gap-2">
                          {hasPermission("finance.petty_cash_replenishment.view") && (
                            <button onClick={() => history.push(`/admin/finance/petty-cash-replenishments/${r.id}`)} className="text-gray-500 hover:text-navy-700 " title="View Details">
                              <MdVisibility className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                        <PettyCashActionButtons
                          approvalStatus={r.approval_status}
                          postedStatus={r.posted_status}
                          permissions={{
                            update: "finance.petty_cash_replenishment.update",
                            delete: "finance.petty_cash_replenishment.delete",
                            submit: "finance.petty_cash_replenishment.submit",
                            approve: "finance.petty_cash_replenishment.approve",
                            reject: "finance.petty_cash_replenishment.reject",
                            post: "finance.petty_cash_replenishment.post"
                          }}
                          onEdit={() => history.push(`/admin/finance/petty-cash-replenishments/${r.id}/edit`)}
                          onDelete={() => handleDelete(r.id)}
                          onSubmit={() => { setActionReplenishmentId(r.id); setModals((m: unknown) => ({ ...m, submit: true })); }}
                          onApprove={() => { setActionReplenishmentId(r.id); setModals((m: unknown) => ({ ...m, approve: true })); }}
                          onReject={() => { setActionReplenishmentId(r.id); setModals((m: unknown) => ({ ...m, reject: true })); }}
                          onPost={() => { setActionReplenishmentId(r.id); setModals((m: unknown) => ({ ...m, post: true })); }}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100  bg-gray-50  text-gray-500 ">
          <span>Total Records: {pagination.total}</span>
          <div className="flex gap-2">
            <button disabled={pagination.page <= 1} onClick={() => setPagination((prev: unknown) => ({ ...prev, page: prev.page - 1 }))} className="px-3 py-1 border border-gray-300  rounded disabled:opacity-50 hover:bg-gray-100  transition-colors">Previous</button>
            <span className="px-3 py-1">Page {pagination.page}</span>
            <button disabled={replenishments.length < pagination.limit} onClick={() => setPagination((prev: unknown) => ({ ...prev, page: prev.page + 1 }))} className="px-3 py-1 border border-gray-300  rounded disabled:opacity-50 hover:bg-gray-100  transition-colors">Next</button>
          </div>
        </div>
      </div>

      {/* Action Modals */}
      <SubmitPettyCashModal
        isOpen={modals.submit}
        onClose={() => setModals((m: unknown) => ({ ...m, submit: false }))}
        isSubmitting={actionLoading}
        onSubmit={(payload: Record<string, unknown>) => handleAction(financeApi.submitPettyCashReplenishment, actionReplenishmentId, payload, "submit")}
      />
      <ApprovePettyCashModal
        isOpen={modals.approve}
        onClose={() => setModals((m: unknown) => ({ ...m, approve: false }))}
        isSubmitting={actionLoading}
        onApprove={(payload: Record<string, unknown>) => handleAction(financeApi.approvePettyCashReplenishment, actionReplenishmentId, payload, "approve")}
      />
      <RejectPettyCashModal
        isOpen={modals.reject}
        onClose={() => setModals((m: unknown) => ({ ...m, reject: false }))}
        isSubmitting={actionLoading}
        onReject={(payload: Record<string, unknown>) => handleAction(financeApi.rejectPettyCashReplenishment, actionReplenishmentId, payload, "reject")}
      />
      <PostPettyCashConfirmModal
        isOpen={modals.post}
        onClose={() => setModals((m: unknown) => ({ ...m, post: false }))}
        isSubmitting={actionLoading}
        onConfirm={() => handleAction(financeApi.postPettyCashReplenishment, actionReplenishmentId, undefined, "post")}
      />
    </div>
  );
}
