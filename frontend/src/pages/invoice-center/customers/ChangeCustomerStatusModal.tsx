import React, { useState, useEffect } from "react";
import { invoiceCenterApi } from "../../../api/invoiceCenterApi";
import { ShieldAlert } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "../../../components/ui/sheet";

interface Customer {
  id: number;
  customer_code: string;
  customer_name: string;
  status: string;
}

interface ChangeCustomerStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  customer?: Customer | null;
}

const ChangeCustomerStatusModal: React.FC<ChangeCustomerStatusModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  customer,
}) => {
  const [status, setStatus] = useState("active");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (customer) {
      setStatus(customer.status || "active");
    }
    setReason("");
    setError(null);
  }, [customer, isOpen]);

  if (!customer) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await invoiceCenterApi.changeCustomerStatus(customer.id, {
        status,
        reason,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Change status error:", err);
      setError(
        err.response?.data?.message || "Failed to change customer status."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-[calc(100vw-1rem)] overflow-y-auto rounded-l-xl border-slate-200 bg-white p-0 shadow-2xl sm:max-w-md"
      >
        <SheetHeader className="border-b border-gray-100 bg-amber-50/50 px-6 py-5  ">
          <SheetTitle className="flex items-center gap-2 font-bold text-amber-700 ">
            <ShieldAlert className="h-5 w-5" />
            <span>Change Customer Status</span>
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-600">
              {error}
            </div>
          )}

          <div>
            <p className="text-sm text-gray-600 ">
              Updating account status for{" "}
              <strong className="text-navy-900 ">
                {customer.customer_name}
              </strong>{" "}
              ({customer.customer_code}).
            </p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
              New Status *
            </label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="blocked">Blocked</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
              Reason / Notes
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why the status is being changed..."
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-navy-500  "
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 ">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50   "
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-amber-600 px-5 py-2 text-sm font-semibold text-white shadow-md hover:bg-amber-700 disabled:opacity-50"
            >
              {loading ? "Updating..." : "Update Status"}
            </button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default ChangeCustomerStatusModal;
