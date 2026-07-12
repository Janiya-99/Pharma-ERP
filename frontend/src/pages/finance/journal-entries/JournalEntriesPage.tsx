import { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { financeApi } from "../../../../api/financeApi";
import { useAuth } from "../../../../auth/AuthContext";
import FinancePageHeader from "../../../../components/finance/FinancePageHeader";
import JournalStatusBadge from "../../../../components/finance/JournalStatusBadge";
import PostedStatusBadge from "../../../../components/finance/PostedStatusBadge";
import JournalActionButtons from "../../../../components/finance/JournalActionButtons";
import MoneyDisplay from "../../../../components/finance/MoneyDisplay";
import FinancialYearSelect from "../../../../components/finance/FinancialYearSelect";
import AccountingPeriodSelect from "../../../../components/finance/AccountingPeriodSelect";

// Note: Modals will be implemented next.
// import SubmitJournalModal from "./SubmitJournalModal";
// import ApproveJournalModal from "./ApproveJournalModal";
// import RejectJournalModal from "./RejectJournalModal";
// import PostJournalConfirmModal from "./PostJournalConfirmModal";
// import ReverseJournalModal from "./ReverseJournalModal";

export default function JournalEntriesPage() {
  const history = useHistory();
  const { hasPermission, activeSoftware } = useAuth();
  
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [filters, setFilters] = useState({
    financial_year_id: "",
    accounting_period_id: "",
    approval_status: "",
    posted_status: "",
    from_date: "",
    to_date: "",
    search: ""
  });

  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  const [modalState, setModalState] = useState({
    type: null, // "submit", "approve", "reject", "post", "reverse"
    journal: null
  });

  const fetchJournals = async () => {
    setLoading(true);
    try {
      const params = { ...filters, page: pagination.page, limit: pagination.limit };
      const res = await financeApi.getJournalEntries(params);
      if (res.data?.success) {
        setJournals(res.data.data);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      console.error("Failed to load journal entries", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeSoftware?.software_code === "FINANCE") {
      fetchJournals();
    }
  }, [filters, pagination.page, activeSoftware]);

  const handleAction = async (action: unknown, journal: unknown) => {
    if (action === "edit") {
      history.push(`/admin/finance/journal-entries/${journal.id}/edit`);
    } else if (action === "delete") {
      if (window.confirm("Are you sure you want to delete this journal entry?")) {
        try {
          await financeApi.deleteJournalEntry(journal.id);
          fetchJournals();
        } catch (err) {
          alert("Failed to delete: " + (err.response?.data?.message || err.message));
        }
      }
    } else {
      setModalState({ type: action, journal });
    }
  };

  if (activeSoftware?.software_code !== "FINANCE") {
    return <div className="p-8 text-center text-red-500 font-medium">Please switch to Finance module to access this page.</div>;
  }

  return (
    <div className="flex flex-col gap-4 py-4 h-full">
      <FinancePageHeader
        title="Journal Entries"
        subtitle="Manage financial journal entries and approvals"
        onAdd={hasPermission("finance.journal.create") ? () => history.push("/admin/finance/journal-entries/create") : undefined}
        addLabel="Create Journal Entry"
      />

      {/* Filters Section */}
      <div className="bg-white  p-4 rounded-xl shadow-sm border border-gray-100 ">
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
            <option value="reversed">Reversed</option>
          </select>
          <input
            type="date"
            value={filters.from_date}
            onChange={(e: any) => setFilters((prev: unknown) => ({ ...prev, from_date: e.target.value }))}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-navy-500"
            title="From Date"
          />
          <input
            type="date"
            value={filters.to_date}
            onChange={(e: any) => setFilters((prev: unknown) => ({ ...prev, to_date: e.target.value }))}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-navy-500"
            title="To Date"
          />
          <input
            type="text"
            placeholder="Search Reference or Description..."
            value={filters.search}
            onChange={(e: any) => setFilters((prev: unknown) => ({ ...prev, search: e.target.value }))}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-navy-500"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="flex-1 bg-white  rounded-xl shadow-sm border border-gray-100  overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50  text-gray-500  font-semibold border-b border-gray-200 ">
              <tr>
                <th className="px-4 py-3">Journal Number</th>
                <th className="px-4 py-3">Journal Date</th>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3 text-right">Total Debit</th>
                <th className="px-4 py-3 text-right">Total Credit</th>
                <th className="px-4 py-3 text-center">Approval Status</th>
                <th className="px-4 py-3 text-center">Posted Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 ">
              {loading ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-gray-500">Loading...</td>
                </tr>
              ) : journals.length === 0 ? (
                <tr>
                  <td colSpan="9" className="px-4 py-8 text-center text-gray-500">No journal entries found.</td>
                </tr>
              ) : (
                journals.map((journal: unknown) => (
                  <tr key={journal.id} className="hover:bg-gray-50 ">
                    <td className="px-4 py-3 font-medium text-navy-700">
                      <button 
                        onClick={() => history.push(`/admin/finance/journal-entries/${journal.id}`)}
                        className="text-brand-500 hover:underline"
                      >
                        {journal.journal_number}
                      </button>
                    </td>
                    <td className="px-4 py-3">{new Date(journal.journal_date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{journal.reference_number || "-"}</td>
                    <td className="px-4 py-3 truncate max-w-[200px]" title={journal.description}>{journal.description}</td>
                    <td className="px-4 py-3 text-right"><MoneyDisplay amount={journal.total_debit} /></td>
                    <td className="px-4 py-3 text-right"><MoneyDisplay amount={journal.total_credit} /></td>
                    <td className="px-4 py-3 text-center">
                      <JournalStatusBadge status={journal.approval_status} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <PostedStatusBadge status={journal.posted_status} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <JournalActionButtons journal={journal} onAction={handleAction} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 ">
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
              disabled={journals.length < pagination.limit}
              onClick={() => setPagination((prev: unknown) => ({ ...prev, page: prev.page + 1 }))}
              className="px-3 py-1 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
