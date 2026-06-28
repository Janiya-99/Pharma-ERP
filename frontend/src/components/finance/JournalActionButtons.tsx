import React from "react";
import { useAuth } from "../../../auth/AuthContext";
import {
  MdEdit,
  MdDelete,
  MdSend,
  MdCheckCircle,
  MdCancel,
  MdPostAdd,
  MdRestore,
} from "react-icons/md";

export default function JournalActionButtons({
  journal,
  onAction,
}: {
  journal?: unknown;
  onAction?: unknown;
}) {
  const { hasPermission } = useAuth();

  if (!journal) return null;

  const status = journal.approval_status || "draft";
  const postedStatus = journal.posted_status || "unposted";
  const isReversed = journal.is_reversed || false;

  const canEdit =
    hasPermission("finance.journal.update") &&
    (status === "draft" || status === "rejected");
  const canDelete =
    hasPermission("finance.journal.delete") &&
    (status === "draft" || status === "rejected");
  const canSubmit =
    hasPermission("finance.journal.submit") &&
    (status === "draft" || status === "rejected");
  const canApprove =
    hasPermission("finance.journal.approve") && status === "pending";
  const canReject =
    hasPermission("finance.journal.reject") && status === "pending";
  const canPost =
    hasPermission("finance.journal.post") &&
    status === "approved" &&
    postedStatus === "unposted";
  const canReverse =
    hasPermission("finance.journal.reverse") &&
    postedStatus === "posted" &&
    !isReversed;

  return (
    <div className="flex flex-wrap gap-2">
      {canEdit && (
        <button
          onClick={() => onAction("edit", journal)}
          className="inline-flex items-center rounded border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <MdEdit className="mr-1.5 h-4 w-4" /> Edit
        </button>
      )}

      {canSubmit && (
        <button
          onClick={() => onAction("submit", journal)}
          className="inline-flex items-center rounded border border-transparent bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          <MdSend className="mr-1.5 h-4 w-4" /> Submit
        </button>
      )}

      {canApprove && (
        <button
          onClick={() => onAction("approve", journal)}
          className="inline-flex items-center rounded border border-transparent bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
        >
          <MdCheckCircle className="mr-1.5 h-4 w-4" /> Approve
        </button>
      )}

      {canReject && (
        <button
          onClick={() => onAction("reject", journal)}
          className="inline-flex items-center rounded border border-transparent bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
        >
          <MdCancel className="mr-1.5 h-4 w-4" /> Reject
        </button>
      )}

      {canPost && (
        <button
          onClick={() => onAction("post", journal)}
          className="inline-flex items-center rounded border border-transparent bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <MdPostAdd className="mr-1.5 h-4 w-4" /> Post
        </button>
      )}

      {canReverse && (
        <button
          onClick={() => onAction("reverse", journal)}
          className="inline-flex items-center rounded border border-transparent bg-orange-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-600"
        >
          <MdRestore className="mr-1.5 h-4 w-4" /> Reverse
        </button>
      )}

      {canDelete && (
        <button
          onClick={() => onAction("delete", journal)}
          className="ml-auto inline-flex items-center rounded border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          <MdDelete className="mr-1.5 h-4 w-4" /> Delete
        </button>
      )}
    </div>
  );
}
