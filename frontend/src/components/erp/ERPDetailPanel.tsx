/**
 * ERPDetailPanel — Slide-over panel to view record details.
 * Shows key-value pairs, status badge, and action buttons.
 */
import React from "react";
import { MdClose, MdEdit, MdDelete, MdCheck, MdBlock } from "react-icons/md";
import { StatusBadge } from "./ERPListPage";

export type DetailField = {
  label: string;
  value: React.ReactNode;
  span?: 1 | 2;
};

type ERPDetailPanelProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  status?: string;
  fields: DetailField[];
  onEdit?: () => void;
  onDelete?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  children?: React.ReactNode; // Additional tabs or content
};

export function ERPDetailPanel({
  open,
  onClose,
  title,
  subtitle,
  status,
  fields,
  onEdit,
  onDelete,
  onApprove,
  onReject,
  children,
}: ERPDetailPanelProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-navy-900/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-lg bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3 min-w-0">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-navy-700 truncate">
                  {title}
                </h2>
                {status && <StatusBadge status={status} />}
              </div>
              {subtitle && (
                <p className="text-[12px] text-gray-400 mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors shrink-0"
          >
            <MdClose size={20} />
          </button>
        </div>

        {/* Action buttons */}
        {(onEdit || onDelete || onApprove || onReject) && (
          <div className="flex items-center gap-2 px-6 py-3 border-b border-gray-50">
            {onEdit && (
              <button
                onClick={onEdit}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <MdEdit size={16} /> Edit
              </button>
            )}
            {onApprove && (
              <button
                onClick={onApprove}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium text-green-600 border border-green-200 hover:bg-green-50 transition-colors"
              >
                <MdCheck size={16} /> Approve
              </button>
            )}
            {onReject && (
              <button
                onClick={onReject}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium text-red-500 border border-red-200 hover:bg-red-50 transition-colors"
              >
                <MdBlock size={16} /> Reject
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-medium text-red-500 hover:bg-red-50 transition-colors ml-auto"
              >
                <MdDelete size={16} /> Delete
              </button>
            )}
          </div>
        )}

        {/* Detail Fields */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            {fields.map((field, i) => (
              <div
                key={i}
                className={field.span === 2 ? "col-span-2" : ""}
              >
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
                  {field.label}
                </p>
                <div className="text-[13px] font-medium text-navy-700">
                  {field.value || <span className="text-gray-300">—</span>}
                </div>
              </div>
            ))}
          </div>

          {/* Additional content (tabs, audit trail, etc.) */}
          {children && <div className="mt-6">{children}</div>}
        </div>
      </div>
    </div>
  );
}

export default ERPDetailPanel;
