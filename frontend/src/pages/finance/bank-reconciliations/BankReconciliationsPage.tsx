import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { financeApi } from "../../../../api/financeApi";
import { useAuth } from "../../../../auth/AuthContext";
import FinancePageHeader from "../../../../components/finance/FinancePageHeader";
import BankAccountSelect from "../../../../components/finance/BankAccountSelect";
import ReconciliationStatusBadge from "../../../../components/finance/ReconciliationStatusBadge";
import MoneyDisplay from "../../../../components/finance/MoneyDisplay";
import { MdEdit, MdDelete, MdVisibility } from "react-icons/md";
import { DataTableToolbar } from "../shared/DataTableToolbar";

export default function BankReconciliationsPage() {
  const history = useHistory();
  const { hasPermission, activeSoftware } = useAuth();
  
  const [reconciliations, setReconciliations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    bank_account_id: "",
    status: "",
    search: ""
  });

  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  const fetchReconciliations = async () => {
    setLoading(true);
    try {
      const params = { ...filters, page: pagination.page, limit: pagination.limit };
      const res = await financeApi.getBankReconciliations(params);
      if (res.data?.success) {
        setReconciliations(res.data.data);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      console.error("Failed to load bank reconciliations", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSoftware?.software_code === "FINANCE") {
      fetchReconciliations();
    }
  }, [filters, pagination.page, activeSoftware]);

  const handleDelete = async (rec: unknown) => {
    if (rec.status !== "draft") {
      alert("Only draft reconciliations can be deleted.");
      return;
    }
    if (window.confirm("Are you sure you want to delete this draft reconciliation?")) {
      try {
        await financeApi.deleteBankReconciliation(rec.id);
        fetchReconciliations();
      } catch (err) {
        alert("Failed to delete: " + (err.response?.data?.message || err.message));
      }
    }
  };

  if (activeSoftware?.software_code !== "FINANCE") {
    return <div className="p-8 text-center text-red-500 font-medium">Please switch to Finance module to access this page.</div>;
  }

  return (
    <div className="flex flex-col gap-4 py-4 h-full">
      <FinancePageHeader
        title="Bank Reconciliations"
        subtitle="Match system transactions with bank statements"
        onAdd={hasPermission("finance.bank_reconciliation.create") ? () => history.push("/admin/finance/bank-reconciliations/create") : undefined}
        addLabel="New Reconciliation"
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <DataTableToolbar
          searchQuery={filters.search}
          onSearchChange={(value) =>
            setFilters((current: unknown) => ({ ...current, search: value }))
          }
          statusFilter={true}
          statusValue={filters.status || "all"}
          onStatusChange={(value) =>
            setFilters((current: unknown) => ({ ...current, status: value === "all" ? "" : value }))
          }
          customFilters={
            <div className="w-48">
              <BankAccountSelect
                value={filters.bank_account_id}
                onChange={(val: unknown) => setFilters((prev: unknown) => ({ ...prev, bank_account_id: val }))}
                placeholder="All Bank Accounts"
              />
            </div>
          }
        />
      </div>

      <div className="flex-1 bg-white  rounded-xl shadow-sm border border-gray-100  overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/80 border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 text-xs uppercase font-bold text-slate-500 tracking-wide">Reference</th>
                <th className="px-4 py-3 text-xs uppercase font-bold text-slate-500 tracking-wide">Bank Account</th>
                <th className="px-4 py-3 text-xs uppercase font-bold text-slate-500 tracking-wide">Statement Date</th>
                <th className="px-4 py-3 text-xs uppercase font-bold text-slate-500 tracking-wide text-right">Statement Balance</th>
                <th className="px-4 py-3 text-xs uppercase font-bold text-slate-500 tracking-wide text-right">System Balance</th>
                <th className="px-4 py-3 text-xs uppercase font-bold text-slate-500 tracking-wide text-right">Difference</th>
                <th className="px-4 py-3 text-xs uppercase font-bold text-slate-500 tracking-wide text-center">Status</th>
                <th className="px-4 py-3 text-xs uppercase font-bold text-slate-500 tracking-wide text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 ">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : reconciliations.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-4 py-8 text-center text-gray-500">No reconciliations found.</td>
                </tr>
              ) : (
                reconciliations.map((rec: unknown) => {
                  const diff = Math.abs((rec.statement_closing_balance || 0) - (rec.system_closing_balance || 0));
                  return (
                    <tr key={rec.id} className="hover:bg-gray-50 ">
                      <td className="px-4 py-3 font-medium text-navy-700">
                        <button 
                          onClick={() => history.push(`/admin/finance/bank-reconciliations/${rec.id}`)}
                          className="text-brand-500 hover:underline"
                        >
                          {rec.reference_number || `REC-${rec.id}`}
                        </button>
                      </td>
                      <td className="px-4 py-3">{rec.bank_account?.bank_name} - {rec.bank_account?.account_number}</td>
                      <td className="px-4 py-3">{new Date(rec.statement_date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right"><MoneyDisplay amount={rec.statement_closing_balance} /></td>
                      <td className="px-4 py-3 text-right"><MoneyDisplay amount={rec.system_closing_balance} /></td>
                      <td className={`px-4 py-3 text-right font-medium ${diff > 0.01 ? 'text-red-600' : 'text-green-600'}`}>
                        <MoneyDisplay amount={diff} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <ReconciliationStatusBadge status={rec.status} />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {hasPermission("finance.bank_reconciliation.view") && (
                            <button onClick={() => history.push(`/admin/finance/bank-reconciliations/${rec.id}`)} className="text-gray-500 hover:text-navy-700">
                              <MdVisibility className="h-5 w-5" />
                            </button>
                          )}
                          {hasPermission("finance.bank_reconciliation.update") && rec.status === "draft" && (
                            <button onClick={() => history.push(`/admin/finance/bank-reconciliations/${rec.id}/edit`)} className="text-brand-500 hover:text-brand-700">
                              <MdEdit className="h-5 w-5" />
                            </button>
                          )}
                          {hasPermission("finance.bank_reconciliation.delete") && rec.status === "draft" && (
                            <button onClick={() => handleDelete(rec)} className="text-red-500 hover:text-red-700">
                              <MdDelete className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 ">
          <span className="text-gray-500">Total Records: {pagination.total}</span>
          <div className="flex gap-2">
            <button disabled={pagination.page <= 1} onClick={() => setPagination((prev: unknown) => ({ ...prev, page: prev.page - 1 }))} className="px-3 py-1 border rounded disabled:opacity-50">Previous</button>
            <span className="px-3 py-1">Page {pagination.page}</span>
            <button disabled={reconciliations.length < pagination.limit} onClick={() => setPagination((prev: unknown) => ({ ...prev, page: prev.page + 1 }))} className="px-3 py-1 border rounded disabled:opacity-50">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
