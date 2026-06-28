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
  const { activeSoftware } = useAuth();
  const [journal, setJournal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalState, setModalState] = useState({
    type: null, // "submit", "approve", "reject", "post", "reverse"
    journal: null,
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
    if (activeSoftware?.software_code === "FINANCE") {
      loadJournal();
    }
  }, [id, activeSoftware]);

  const handleAction = async (action: unknown, jnl: unknown) => {
    if (action === "edit") {
      history.push(`/admin/finance/journal-entries/${jnl.id}/edit`);
    } else if (action === "delete") {
      if (
        window.confirm("Are you sure you want to delete this journal entry?")
      ) {
        try {
          await financeApi.deleteJournalEntry(jnl.id);
          history.push("/admin/finance/journal-entries");
        } catch (err) {
          alert(
            "Failed to delete: " + (err.response?.data?.message || err.message)
          );
        }
      }
    } else {
      setModalState({ type: action, journal: jnl });
    }
  };

  const closeModal = () => setModalState({ type: null, journal: null });

  if (activeSoftware?.software_code !== "FINANCE") {
    return (
      <div className="p-8 text-center font-medium text-red-500">
        Please switch to Finance module to access this page.
      </div>
    );
  }

  if (loading) return <div className="p-8 text-center">Loading details...</div>;
  if (error || !journal)
    return (
      <div className="p-8 text-center text-red-500">
        {error || "Journal not found"}
      </div>
    );

  return (
    <div className="mx-auto flex h-full max-w-7xl flex-col gap-4 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => history.push("/admin/finance/journal-entries")}
            className="rounded-full p-2 transition-colors hover:bg-gray-100 dark:hover:bg-navy-700"
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

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Header Summary */}
        <div className="space-y-4 md:col-span-2">
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
            <h3 className="mb-4 text-lg font-medium text-navy-800 dark:text-white">
              Details
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="mb-1 text-gray-500">Journal Date</p>
                <p className="font-medium text-navy-800 dark:text-white">
                  {new Date(journal.journal_date).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="mb-1 text-gray-500">Reference Number</p>
                <p className="font-medium text-navy-800 dark:text-white">
                  {journal.reference_number || "-"}
                </p>
              </div>
              <div className="col-span-2">
                <p className="mb-1 text-gray-500">Description</p>
                <p className="font-medium text-navy-800 dark:text-white">
                  {journal.description || "-"}
                </p>
              </div>
              {journal.is_reversed && (
                <div className="col-span-2 mt-2 rounded border border-orange-200 bg-orange-50 p-3 text-orange-800">
                  <p>
                    <strong>Reversed Journal:</strong> This entry was reversed
                    on {new Date(journal.reversal_date).toLocaleDateString()}{" "}
                    due to: {journal.reversal_reason}
                  </p>
                  <p>
                    <strong>Reversal Reference:</strong>{" "}
                    {journal.reversal_journal_id}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
            <h3 className="mb-4 text-lg font-medium text-navy-800 dark:text-white">
              Line Items
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-gray-200 bg-gray-50 font-semibold text-gray-500 dark:border-navy-700 dark:bg-navy-700/50 dark:text-gray-300">
                  <tr>
                    <th className="px-4 py-3">Account Code</th>
                    <th className="px-4 py-3">Account Name</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3 text-right">Debit</th>
                    <th className="px-4 py-3 text-right">Credit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-navy-700">
                  {journal.lines?.map((line: unknown) => (
                    <tr key={line.id}>
                      <td className="px-4 py-3">
                        {line.account?.account_code || "-"}
                      </td>
                      <td className="px-4 py-3">
                        {line.account?.account_name || "-"}
                      </td>
                      <td className="px-4 py-3">
                        {line.line_description || "-"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <MoneyDisplay amount={line.debit_amount} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <MoneyDisplay amount={line.credit_amount} />
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-bold dark:bg-navy-700/50">
                    <td
                      colSpan="3"
                      className="px-4 py-3 text-right text-gray-700 dark:text-gray-300"
                    >
                      Total
                    </td>
                    <td className="px-4 py-3 text-right text-navy-800 dark:text-white">
                      <MoneyDisplay amount={journal.total_debit} />
                    </td>
                    <td className="px-4 py-3 text-right text-navy-800 dark:text-white">
                      <MoneyDisplay amount={journal.total_credit} />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Status & History */}
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
            <h3 className="mb-4 text-lg font-medium text-navy-800 dark:text-white">
              Status
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Approval Status</span>
                <JournalStatusBadge status={journal.approval_status} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Posted Status</span>
                <PostedStatusBadge status={journal.posted_status} />
              </div>
              <hr className="my-2 border-gray-100 dark:border-navy-700" />
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-gray-500">Created:</span>{" "}
                  {new Date(journal.created_at).toLocaleString()}
                </p>
                {journal.approved_at && (
                  <p>
                    <span className="text-gray-500">Approved:</span>{" "}
                    {new Date(journal.approved_at).toLocaleString()}
                  </p>
                )}
                {journal.posted_at && (
                  <p>
                    <span className="text-gray-500">Posted:</span>{" "}
                    {new Date(journal.posted_at).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
            <h3 className="mb-4 text-lg font-medium text-navy-800 dark:text-white">
              Approval History
            </h3>
            {journal.approvals?.length > 0 ? (
              <div className="relative space-y-4 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:-translate-x-px before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent md:before:mx-auto md:before:translate-x-0">
                {journal.approvals.map((approval: unknown, idx: unknown) => (
                  <div
                    key={approval.id}
                    className="is-active group relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white bg-blue-100 text-blue-500 shadow md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                      {idx + 1}
                    </div>
                    <div className="w-[calc(100%-4rem)] rounded border border-gray-100 bg-white p-3 shadow-sm md:w-[calc(50%-2.5rem)]">
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="font-semibold uppercase text-navy-800">
                          {approval.action}
                        </span>
                        <span className="text-gray-500">
                          {new Date(approval.action_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {approval.remarks || "No remarks"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-sm text-gray-500">
                No approval history available.
              </p>
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
