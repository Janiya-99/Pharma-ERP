import React, { useState, useEffect } from "react";
import Modal from "../../../components/common/Modal";
import Input from "../../../components/common/Input";
import Button from "../../../components/common/Button";
import Select from "../../../components/common/Select";
import FormError from "../../../components/common/FormError";
import { createRole, updateRole } from "../../../api/controlApi";

import { toast } from "sonner";

const RoleFormModal = ({
  isOpen,
  onClose,
  role,
  onSuccess,
  softwareModules,
}: {
  isOpen?: boolean;
  onClose?: unknown;
  role?: unknown;
  onSuccess?: unknown;
  softwareModules?: unknown;
}) => {
  const isEdit = !!role;

  const [formData, setFormData] = useState({
    software_id: "",
    role_name: "",
    role_code: "",
    description: "",
    status: "active",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      if (isEdit) {
        setFormData({
          software_id: role.software_id || "",
          role_name: role.role_name || "",
          role_code: role.role_code || "",
          description: role.description || "",
          status: role.status || "active",
        });
      } else {
        setFormData({
          software_id: "",
          role_name: "",
          role_code: "",
          description: "",
          status: "active",
        });
      }
      setError(null);
    }
  }, [isOpen, role]);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!formData.software_id) return "Software Module is required.";
    if (!formData.role_name.trim()) return "Role Name is required.";
    if (!formData.role_code.trim()) return "Role Code is required.";
    if (!formData.status) return "Status is required.";
    return null;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      software_id: parseInt(formData.software_id, 10),
      role_name: formData.role_name,
      role_code: formData.role_code,
      description: formData.description,
      status: formData.status,
    };

    try {
      let res;
      if (isEdit) {
        res = await updateRole(role.id, payload);
      } else {
        res = await createRole(payload);
      }

      if (res.success) {
        if (isEdit) {
          toast.success("Role updated successfully!");
        } else {
          toast.success("Role created successfully!");
        }
        onSuccess();
      } else {
        setError(res.message || "An error occurred");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Role" : "Create Role"}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormError message={error} />

        {isEdit && role?.is_system && (
          <div className="rounded-md border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800">
            <strong>System Role:</strong> This role is required by the system.
            Some properties may be restricted from changes.
          </div>
        )}

        <Select
          label="Software Module"
          name="software_id"
          value={formData.software_id}
          onChange={handleChange}
          disabled={isEdit}
          required
          searchable={true}
          placeholder="Select Software Module"
          options={softwareModules.map((s: unknown) => ({
            value: s.id,
            label: s.software_name,
          }))}
        />

        <Input
          label="Role Name *"
          name="role_name"
          value={formData.role_name}
          onChange={handleChange}
          required
          autoFocus
        />

        <Input
          label="Role Code *"
          name="role_code"
          value={formData.role_code}
          onChange={handleChange}
          required
        />

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
            placeholder="Role description..."
          />
        </div>

        <Select
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          required
          options={[
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
        />

        <div className="mt-6 flex justify-end space-x-3 border-t border-gray-200 pt-4">
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            {isEdit ? "Update Role" : "Create Role"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RoleFormModal;
