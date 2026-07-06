/**
 * ERPConfirmDialog — Reusable confirmation dialog for delete/cancel/post actions.
 */
import { MdWarning } from "react-icons/md";
import { Button } from "@/components/ui/button";

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

  const confirmButtonVariant =
    confirmVariant === "danger"
      ? "destructive"
      : confirmVariant === "warning"
      ? "secondary"
      : "default";

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-navy-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
            <MdWarning size={22} />
          </div>
          <div>
            <h3 className="text-[15px] font-bold text-navy-700">{title}</h3>
            <p className="mt-1 text-[13px] text-gray-400">{message}</p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant={confirmButtonVariant}
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            ) : (
              confirmLabel
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ERPConfirmDialog;
