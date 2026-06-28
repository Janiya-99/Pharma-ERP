import { useState, useEffect } from "react";
import Modal from "../../../components/common/Modal";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import Select from "../../../components/common/Select";
import FormError from "../../../components/common/FormError";
import { changeUserStatus } from "../../../api/controlApi";

const ChangeUserStatusModal = ({ isOpen, onClose, user, onSuccess }: { isOpen?: boolean; onClose?: unknown; user?: unknown; onSuccess?: unknown }) => {
  const [status, setStatus] = useState("active");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && user) {
      setStatus(user.status || "active");
      setReason("");
      setError(null);
    }
  }, [isOpen, user]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    setError(null);

    try {
      const res = await changeUserStatus(user.id, { status, reason });
      if (res.success) {
        onSuccess();
      } else {
        setError(res.message || "Failed to change status");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to change status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Change User Status"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-blue-50 p-3 rounded-md mb-4 text-sm text-blue-800">
          Updating status for: <span className="font-semibold">{user?.name || user?.full_name}</span> ({user?.email})
        </div>

        <FormError message={error} />

        <Select
          label="Status"
          name="status"
          value={status}
          onChange={(e: any) => setStatus(e.target.value)}
          required
          options={[
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
            { value: "suspended", label: "Suspended" },
            { value: "locked", label: "Locked" },
          ]}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reason (Optional)</label>
          <Input
            placeholder="Enter reason for status change"
            value={reason}
            onChange={(e: any) => setReason(e.target.value)}
          />
        </div>

        {(status === "locked" || status === "suspended") && (
          <p className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-100">
            Warning: Setting the status to <strong>{status}</strong> will immediately prevent this user from logging in or accessing the system.
          </p>
        )}

        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            Update Status
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ChangeUserStatusModal;
