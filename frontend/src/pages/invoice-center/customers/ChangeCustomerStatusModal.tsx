import React, { useState, useEffect } from "react";
import { invoiceCenterApi } from "../../../api/invoiceCenterApi";
import { X, ShieldAlert } from "lucide-react";

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

  if (!isOpen || !customer) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl dark:border-navy-700 dark:bg-navy-800">
        <div className="flex items-center justify-between border-b border-gray-100 bg-amber-50/50 p-6 dark:border-navy-700 dark:bg-amber-900/10">
          <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-400">
            <ShieldAlert className="h-5 w-5" />
            <span>Change Customer Status</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error && (
            <div className="bg-rose-50 border-rose-200 text-rose-600 rounded-xl border p-3 text-sm">
              {error}
            </div>
          )}

          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Updating account status for{" "}
              <strong className="text-navy-900 dark:text-white">
                {customer.customer_name}
              </strong>{" "}
              ({customer.customer_code}).
            </p>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold uppercase text-gray-500">
              New Status *
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-navy-500 dark:border-navy-600 dark:bg-navy-700"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="blocked">Blocked</option>
              <option value="on_hold">On Hold</option>
            </select>
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
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-navy-500 dark:border-navy-600 dark:bg-navy-700"
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-gray-100 pt-4 dark:border-navy-700">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 dark:border-navy-600 dark:text-gray-300 dark:hover:bg-navy-700"
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
      </div>
    </div>
  );
};

export default ChangeCustomerStatusModal;
