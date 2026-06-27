import React, { useState, useEffect } from "react";
import Modal from "../../../components/common/Modal";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import FormError from "../../../components/common/FormError";
import { resetUserPassword } from "../../../api/controlApi";

const ResetPasswordModal = ({ isOpen, onClose, user, onSuccess }: { isOpen?: boolean; onClose?: unknown; user?: unknown; onSuccess?: unknown }) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setPassword("");
      setConfirmPassword("");
      setError(null);
    }
  }, [isOpen]);

  const validate = () => {
    if (!password) return "New password is required.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (password !== confirmPassword) return "Passwords do not match.";
    return null;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!user) return;
    
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await resetUserPassword(user.id, { password });
      if (res.success) {
        onSuccess();
      } else {
        setError(res.message || "Failed to reset password");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reset Password"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-orange-50 p-3 rounded-md mb-4 text-sm text-orange-800">
          Resetting password for: <span className="font-semibold">{user?.full_name}</span>
        </div>

        <FormError message={error} />

        <Input
          label="New Password *"
          type="password"
          value={password}
          onChange={(e: any) => setPassword(e.target.value)}
          required
          autoFocus
        />

        <Input
          label="Confirm Password *"
          type="password"
          value={confirmPassword}
          onChange={(e: any) => setConfirmPassword(e.target.value)}
          required
        />

        <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" variant="info" isLoading={loading}>
            Reset Password
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ResetPasswordModal;
