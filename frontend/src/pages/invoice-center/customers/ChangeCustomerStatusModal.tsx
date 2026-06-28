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

const ChangeCustomerStatusModal: React.FC<ChangeCustomerStatusModalProps> = ({ isOpen, onClose, onSuccess, customer }) => {
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
      await invoiceCenterApi.changeCustomerStatus(customer.id, { status, reason });
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Change status error:", err);
      setError(err.response?.data?.message || "Failed to change customer status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-navy-800 rounded-3xl shadow-2xl max-w-md w-full border border-gray-100 dark:border-navy-700 overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-navy-700 bg-amber-50/50 dark:bg-amber-900/10">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold">
            <ShieldAlert className="w-5 h-5" />
            <span>Change Customer Status</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-600 rounded-xl text-sm">{error}</div>}

          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Updating account status for <strong className="text-navy-900 dark:text-white">{customer.customer_name}</strong> ({customer.customer_code}).
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">New Status *</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 dark:border-navy-600 rounded-xl bg-white dark:bg-navy-700 text-sm focus:ring-2 focus:ring-navy-500 outline-none"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="blocked">Blocked</option>
              <option value="on_hold">On Hold</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Reason / Notes</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why the status is being changed..."
              className="w-full px-3 py-2 border border-gray-200 dark:border-navy-600 rounded-xl bg-white dark:bg-navy-700 text-sm focus:ring-2 focus:ring-navy-500 outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-navy-700">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl border border-gray-200 dark:border-navy-600 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-navy-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold shadow-md disabled:opacity-50"
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
