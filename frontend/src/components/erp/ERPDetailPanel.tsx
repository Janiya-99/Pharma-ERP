/**
 * ERPDetailPanel — Slide-over panel to view record details.
 * Shows key-value pairs, status badge, and action buttons.
 */
import React from "react";
import { MdClose, MdEdit, MdDelete, MdCheck, MdBlock } from "react-icons/md";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "components/ui/sheet";
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
  return (
    <Sheet open={open} onOpenChange={(val: unknown) => !val && onClose()}>
      <SheetContent
        side="right"
        className="flex w-[400px] flex-col border-none bg-white p-0 shadow-2xl sm:w-[500px] sm:max-w-none"
      >
        {/* Header */}
        <SheetHeader className="border-b border-gray-100 px-6 py-4 text-left">
          <div className="flex items-center gap-2">
            <SheetTitle className="truncate text-lg font-bold text-navy-700">
              {title}
            </SheetTitle>
            {status && <StatusBadge status={status} />}
          </div>
          {subtitle && (
            <SheetDescription className="mt-0.5 text-[12px] text-gray-400">
              {subtitle}
            </SheetDescription>
          )}
        </SheetHeader>

        {/* Action buttons */}
        {(onEdit || onDelete || onApprove || onReject) && (
          <div className="flex items-center gap-2 border-b border-gray-50 px-6 py-3">
            {onEdit && (
              <button
                onClick={onEdit}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-[13px] font-medium text-gray-600 transition-colors hover:bg-gray-50"
              >
                <MdEdit size={16} /> Edit
              </button>
            )}
            {onApprove && (
              <button
                onClick={onApprove}
                className="flex items-center gap-1.5 rounded-lg border border-green-200 px-3 py-2 text-[13px] font-medium text-green-600 transition-colors hover:bg-green-50"
              >
                <MdCheck size={16} /> Approve
              </button>
            )}
            {onReject && (
              <button
                onClick={onReject}
                className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-2 text-[13px] font-medium text-red-500 transition-colors hover:bg-red-50"
              >
                <MdBlock size={16} /> Reject
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-medium text-red-500 transition-colors hover:bg-red-50"
              >
                <MdDelete size={16} /> Delete
              </button>
            )}
          </div>
        )}

        {/* Detail Fields */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            {fields.map((field: unknown, i: unknown) => (
              <div key={i} className={field.span === 2 ? "col-span-2" : ""}>
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
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
      </SheetContent>
    </Sheet>
  );
}

export default ERPDetailPanel;
