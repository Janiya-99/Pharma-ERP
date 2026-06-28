import React from "react";
import { useAuth } from "../../../auth/AuthContext";
import {
  MdEdit,
  MdDelete,
  MdSend,
  MdCheckCircle,
  MdCancel,
  MdPostAdd,
} from "react-icons/md";

export default function VoucherActionButtons({
  voucher,
  type,
  onAction,
}: {
  voucher?: unknown;
  type?: unknown;
  onAction?: unknown;
}) {
  const { hasPermission } = useAuth();

  if (!voucher) return null;

  const status = voucher.approval_status || "draft";
  const postedStatus = voucher.posted_status || "unposted";

  const permPrefix = type === "payment" ? "finance.payment" : "finance.receipt";

  const canEdit =
    hasPermission(`${permPrefix}.update`) &&
    (status === "draft" || status === "rejected") &&
    postedStatus !== "posted";
  const canDelete =
    hasPermission(`${permPrefix}.delete`) &&
    (status === "draft" || status === "rejected") &&
    postedStatus !== "posted";
  const canSubmit =
    hasPermission(`${permPrefix}.submit`) &&
    (status === "draft" || status === "rejected");
  const canApprove =
    hasPermission(`${permPrefix}.approve`) && status === "pending";
  const canReject =
    hasPermission(`${permPrefix}.reject`) && status === "pending";
  const canPost =
    hasPermission(`${permPrefix}.post`) &&
    status === "approved" &&
    postedStatus === "unposted";

  return (
    <div className="flex flex-wrap gap-2">
      {canEdit && (
        <button
          onClick={() => onAction("edit", voucher)}
          className="inline-flex items-center rounded border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <MdEdit className="mr-1.5 h-4 w-4" /> Edit
        </button>
      )}

      {canSubmit && (
        <button
          onClick={() => onAction("submit", voucher)}
          className="inline-flex items-center rounded border border-transparent bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
        >
          <MdSend className="mr-1.5 h-4 w-4" /> Submit
        </button>
      )}

      {canApprove && (
        <button
          onClick={() => onAction("approve", voucher)}
          className="inline-flex items-center rounded border border-transparent bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-700"
        >
          <MdCheckCircle className="mr-1.5 h-4 w-4" /> Approve
        </button>
      )}

      {canReject && (
        <button
          onClick={() => onAction("reject", voucher)}
          className="inline-flex items-center rounded border border-transparent bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700"
        >
          <MdCancel className="mr-1.5 h-4 w-4" /> Reject
        </button>
      )}

      {canPost && (
        <button
          onClick={() => onAction("post", voucher)}
          className="inline-flex items-center rounded border border-transparent bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <MdPostAdd className="mr-1.5 h-4 w-4" /> Post
        </button>
      )}

      {canDelete && (
        <button
          onClick={() => onAction("delete", voucher)}
          className="ml-auto inline-flex items-center rounded border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          <MdDelete className="mr-1.5 h-4 w-4" /> Delete
        </button>
      )}
    </div>
  );
}
