import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import {
  Edit,
  Trash2,
  Send,
  CheckCircle,
  XCircle,
  FileInput,
  MoreVertical,
  Eye,
} from "lucide-react";
import Dropdown from "../dropdown";

const GRNActionButtons = ({
  grn,
  onDelete,
  onSubmit,
  onApprove,
  onReject,
  onPost,
  showView = false,
  isDropdown = false,
}: {
  grn?: any;
  onDelete?: (grn: any) => void;
  onSubmit?: (grn: any) => void;
  onApprove?: (grn: any) => void;
  onReject?: (grn: any) => void;
  onPost?: (grn: any) => void;
  showView?: boolean;
  isDropdown?: boolean;
}) => {
  const { hasPermission } = useAuth();

  if (!grn) return null;

  const canEdit =
    hasPermission("inventory.grn.update") &&
    (grn.approval_status === "draft" || grn.approval_status === "rejected") &&
    grn.posted_status === "unposted";
  const canDelete =
    hasPermission("inventory.grn.delete") &&
    (grn.approval_status === "draft" || grn.approval_status === "rejected") &&
    grn.posted_status === "unposted";
  const canSubmit =
    hasPermission("inventory.grn.submit") &&
    (grn.approval_status === "draft" || grn.approval_status === "rejected") &&
    grn.posted_status === "unposted";
  const canApprove =
    hasPermission("inventory.grn.approve") &&
    grn.approval_status === "pending" &&
    grn.posted_status === "unposted";
  const canReject =
    hasPermission("inventory.grn.reject") &&
    grn.approval_status === "pending" &&
    grn.posted_status === "unposted";
  const canPost =
    hasPermission("inventory.grn.post") &&
    grn.approval_status === "approved" &&
    grn.posted_status === "unposted";
  const canView = hasPermission("inventory.grn.view");

  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (isDropdown) {
    return (
      <Dropdown
        button={
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-navy-700"
          >
            <MoreVertical className="h-5 w-5" />
          </button>
        }
        animation="origin-top-right transition-all duration-300 ease-in-out"
        classNames="top-10 right-0 w-48 bg-white dark:bg-navy-800 rounded-xl shadow-xl border border-gray-100 dark:border-navy-700 z-50 py-2"
      >
        <div className="flex flex-col">
          {showView && canView && (
            <Link
              to={`/inventory/grns/${grn.id}`}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-navy-700"
            >
              <Eye className="h-4 w-4 text-brand-500" /> View Details
            </Link>
          )}

          {canEdit && (
            <Link
              to={`/inventory/grns/${grn.id}/edit`}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-navy-700"
            >
              <Edit className="h-4 w-4 text-blue-500" /> Edit GRN
            </Link>
          )}

          {canSubmit && (
            <button
              onClick={() => {
                setDropdownOpen(false);
                onSubmit(grn);
              }}
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-navy-700"
            >
              <Send className="h-4 w-4 text-yellow-500" /> Submit
            </button>
          )}

          {canApprove && (
            <button
              onClick={() => {
                setDropdownOpen(false);
                onApprove(grn);
              }}
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-navy-700"
            >
              <CheckCircle className="h-4 w-4 text-green-500" /> Approve
            </button>
          )}

          {canReject && (
            <button
              onClick={() => {
                setDropdownOpen(false);
                onReject(grn);
              }}
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-navy-700"
            >
              <XCircle className="h-4 w-4 text-red-500" /> Reject
            </button>
          )}

          {canPost && (
            <button
              onClick={() => {
                setDropdownOpen(false);
                onPost(grn);
              }}
              className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm font-medium text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-navy-700"
            >
              <FileInput className="h-4 w-4" /> Post GRN
            </button>
          )}

          {canDelete && (
            <>
              <div className="my-1 h-px bg-gray-100 dark:bg-navy-700"></div>
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  onDelete(grn);
                }}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-navy-700/50"
              >
                <Trash2 className="h-4 w-4" /> Delete
              </button>
            </>
          )}
        </div>
      </Dropdown>
    );
  }

  // Inline buttons version
  return (
    <div className="flex flex-wrap gap-2">
      {canEdit && (
        <Link
          to={`/inventory/grns/${grn.id}/edit`}
          className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100 dark:border-blue-800/50 dark:bg-blue-900/30 dark:text-blue-400"
        >
          <Edit className="h-4 w-4" /> Edit
        </Link>
      )}

      {canSubmit && (
        <button
          onClick={() => onSubmit(grn)}
          className="flex items-center gap-1.5 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-1.5 text-sm font-medium text-yellow-700 hover:bg-yellow-100 dark:border-yellow-800/50 dark:bg-yellow-900/30 dark:text-yellow-400"
        >
          <Send className="h-4 w-4" /> Submit
        </button>
      )}

      {canApprove && (
        <button
          onClick={() => onApprove(grn)}
          className="flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-100 dark:border-green-800/50 dark:bg-green-900/30 dark:text-green-400"
        >
          <CheckCircle className="h-4 w-4" /> Approve
        </button>
      )}

      {canReject && (
        <button
          onClick={() => onReject(grn)}
          className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 dark:border-red-800/50 dark:bg-red-900/30 dark:text-red-400"
        >
          <XCircle className="h-4 w-4" /> Reject
        </button>
      )}

      {canPost && (
        <button
          onClick={() => onPost(grn)}
          className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-brand-700"
        >
          <FileInput className="h-4 w-4" /> Post GRN
        </button>
      )}

      {canDelete && (
        <button
          onClick={() => onDelete(grn)}
          className="ml-auto flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 dark:border-red-800/50 dark:bg-red-900/30 dark:text-red-400"
        >
          <Trash2 className="h-4 w-4" /> Delete
        </button>
      )}
    </div>
  );
};

export default GRNActionButtons;
