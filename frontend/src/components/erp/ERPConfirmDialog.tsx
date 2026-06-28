/**
 * ERPConfirmDialog — Reusable confirmation dialog for delete/cancel/post actions.
 */
import { MdWarning } from "react-icons/md";

type ERPConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  confirmVariant?: "danger" | "warning" | "primary";
  isLoading?: boolean;
};

export function ERPConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  confirmVariant = "danger",
  isLoading = false,
}: ERPConfirmDialogProps) {
  if (!open) return null;

  const btnColors = {
    danger: "bg-red-500 hover:bg-red-600 text-white shadow-red-200",
    warning: "bg-amber-500 hover:bg-amber-600 text-white shadow-amber-200",
    primary: "bg-brand-500 hover:bg-brand-600 text-white shadow-brand-200",
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-navy-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl mx-4 p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-500 shrink-0">
            <MdWarning size={22} />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-navy-700">{title}</h3>
            <p className="text-[13px] text-gray-400 mt-1">{message}</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm disabled:opacity-50 ${btnColors[confirmVariant]}`}
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ERPConfirmDialog;
