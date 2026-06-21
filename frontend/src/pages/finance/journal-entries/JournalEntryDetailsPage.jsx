import React, { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { financeApi } from "../../../../api/financeApi";
import JournalStatusBadge from "../../../../components/finance/JournalStatusBadge";
import PostedStatusBadge from "../../../../components/finance/PostedStatusBadge";
import JournalActionButtons from "../../../../components/finance/JournalActionButtons";
import MoneyDisplay from "../../../../components/finance/MoneyDisplay";
import { MdArrowBack } from "react-icons/md";

import SubmitJournalModal from "./SubmitJournalModal";
import ApproveJournalModal from "./ApproveJournalModal";
import RejectJournalModal from "./RejectJournalModal";
import PostJournalConfirmModal from "./PostJournalConfirmModal";
import ReverseJournalModal from "./ReverseJournalModal";

export default function JournalEntryDetailsPage() {
  const { id } = useParams();
  const history = useHistory();
  const [journal, setJournal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalState, setModalState] = useState({
    type: null, // "submit", "approve", "reject", "post", "reverse"
    journal: null
  });

  const loadJournal = async () => {
    setLoading(true);
    try {
      const res = await financeApi.getJournalEntryById(id);
      if (res.data?.success) {
        setJournal(res.data.data);
      }
    } catch (err) {
      setError("Failed to load journal entry details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJournal();
  }, [id]);

  const handleAction = async (action, jnl) => {
    if (action === "edit") {
      history.push(`/admin/finance/journal-entries/${jnl.id}/edit`);
    } else if (action === "delete") {
      if (window.confirm("Are you sure you want to delete this journal entry?")) {
        try {
          await financeApi.deleteJournalEntry(jnl.id);
          history.push("/admin/finance/journal-entries");
        } catch (err) {
          alert("Failed to delete: " + (err.response?.data?.message || err.message));
        }
      }
    } else {
      setModalState({ type: action, journal: jnl });
    }
  };

  const closeModal = () => setModalState({ type: null, journal: null });

  if (loading) return <div className="p-8 text-center">Loading details...</div>;
  if (error || !journal) return <div className="p-8 text-center text-red-500">{error || "Journal not found"}</div>;

  return (
    <div className="flex flex-col gap-4 py-4 h-full max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => history.push("/admin/finance/journal-entries")}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-navy-700 transition-colors"
          >
            <MdArrowBack className="h-6 w-6 text-gray-500 dark:text-gray-400" />
          </button>
          <h1 className="text-2xl font-bold text-navy-800 dark:text-white">
            Journal Entry {journal.journal_number}
          </h1>
        </div>
        <div>
          <JournalActionButtons journal={journal} onAction={handleAction} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Header Summary */}
        <div className="md:col-span-2 space-y-4">
          <div className="bg-white dark:bg-navy-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-navy-700">
            <h3 className="text-lg font-medium text-navy-800 dark:text-white mb-4">Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500 mb-1">Journal Date</p>
                <p className="font-medium text-navy-800 dark:text-white">
                  {new Date(journal.journal_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-gray-500 mb-1">Reference Number</p>
                <p className="font-medium text-navy-800 dark:text-white">{journal.reference_number || "-"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-gray-500 mb-1">Description</p>
                <p className="font-medium text-navy-800 dark:text-white">{journal.description || "-"}</p>
              </div>
              {journal.is_reversed && (
                <div className="col-span-2 bg-orange-50 text-orange-800 p-3 rounded mt-2 border border-orange-200">
                  <p><strong>Reversed Journal:</strong> This entry was reversed on {new Date(journal.reversal_date).toLocaleDateString()} due to: {journal.reversal_reason}</p>
                  <p><strong>Reversal Reference:</strong> {journal.reversal_journal_id}</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white dark:bg-navy-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-navy-700">
            <h3 className="text-lg font-medium text-navy-800 dark:text-white mb-4">Line Items</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-navy-700/50 text-gray-500 dark:text-gray-300 font-semibold border-b border-gray-200 dark:border-navy-700">
                  <tr>
                    <th className="px-4 py-3">Account Code</th>
                    <th className="px-4 py-3">Account Name</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3 text-right">Debit</th>
                    <th className="px-4 py-3 text-right">Credit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-navy-700">
                  {journal.lines?.map(line => (
                    <tr key={line.id}>
                      <td className="px-4 py-3">{line.account?.account_code || "-"}</td>
                      <td className="px-4 py-3">{line.account?.account_name || "-"}</td>
                      <td className="px-4 py-3">{line.line_description || "-"}</td>
                      <td className="px-4 py-3 text-right"><MoneyDisplay amount={line.debit_amount} /></td>
                      <td className="px-4 py-3 text-right"><MoneyDisplay amount={line.credit_amount} /></td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 dark:bg-navy-700/50 font-bold">
                    <td colSpan="3" className="px-4 py-3 text-right text-gray-700 dark:text-gray-300">Total</td>
                    <td className="px-4 py-3 text-right text-navy-800 dark:text-white"><MoneyDisplay amount={journal.total_debit} /></td>
                    <td className="px-4 py-3 text-right text-navy-800 dark:text-white"><MoneyDisplay amount={journal.total_credit} /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Status & History */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-navy-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-navy-700">
            <h3 className="text-lg font-medium text-navy-800 dark:text-white mb-4">Status</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Approval Status</span>
                <JournalStatusBadge status={journal.approval_status} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500 text-sm">Posted Status</span>
                <PostedStatusBadge status={journal.posted_status} />
              </div>
              <hr className="my-2 border-gray-100 dark:border-navy-700" />
              <div className="text-sm space-y-2">
                <p><span className="text-gray-500">Created:</span> {new Date(journal.created_at).toLocaleString()}</p>
                {journal.approved_at && (
                  <p><span className="text-gray-500">Approved:</span> {new Date(journal.approved_at).toLocaleString()}</p>
                )}
                {journal.posted_at && (
                  <p><span className="text-gray-500">Posted:</span> {new Date(journal.posted_at).toLocaleString()}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-navy-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-navy-700">
            <h3 className="text-lg font-medium text-navy-800 dark:text-white mb-4">Approval History</h3>
            {journal.approvals?.length > 0 ? (
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                {journal.approvals.map((approval, idx) => (
                  <div key={approval.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-blue-100 text-blue-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                      {idx + 1}
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-3 rounded border border-gray-100 bg-white shadow-sm">
                      <div className="flex items-center justify-between mb-1 text-xs">
                        <span className="font-semibold text-navy-800 uppercase">{approval.action}</span>
                        <span className="text-gray-500">{new Date(approval.action_at).toLocaleString()}</span>
                      </div>
                      <p className="text-sm text-gray-600">{approval.remarks || "No remarks"}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">No approval history available.</p>
            )}
          </div>
        </div>
      </div>

      <SubmitJournalModal
        isOpen={modalState.type === "submit"}
        onClose={closeModal}
        journal={modalState.journal}
        onSuccess={loadJournal}
      />
      <ApproveJournalModal
        isOpen={modalState.type === "approve"}
        onClose={closeModal}
        journal={modalState.journal}
        onSuccess={loadJournal}
      />
      <RejectJournalModal
        isOpen={modalState.type === "reject"}
        onClose={closeModal}
        journal={modalState.journal}
        onSuccess={loadJournal}
      />
      <PostJournalConfirmModal
        isOpen={modalState.type === "post"}
        onClose={closeModal}
        journal={modalState.journal}
        onSuccess={loadJournal}
      />
      <ReverseJournalModal
        isOpen={modalState.type === "reverse"}
        onClose={closeModal}
        journal={modalState.journal}
        onSuccess={loadJournal}
      />
    </div>
  );
}
