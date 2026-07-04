import { useState, useEffect } from "react";
import Modal from "../../../components/common/Modal";
import Input from "../../../components/common/Input";
import Button from "../../../components/common/Button";
import Select from "../../../components/common/Select";
import FormError from "../../../components/common/FormError";
import { createDepartment, updateDepartment } from "../../../api/controlApi";

import { toast } from "sonner";

const DepartmentFormModal = ({
  isOpen,
  onClose,
  department = null,
  onSuccess,
  existingDepartments = [],
}: {
  isOpen?: boolean;
  onClose?: any;
  department?: any;
  onSuccess?: any;
  existingDepartments?: any[];
}) => {
  const isEdit = !!department;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    department_code: "",
    department_name: "",
    description: "",
    status: "active",
  });

  useEffect(() => {
    if (isOpen) {
      if (department) {
        setFormData({
          department_code: department.department_code || "",
          department_name: department.department_name || "",
          description: department.description || "",
          status: department.status || "active",
        });
      } else {
        setFormData({
          department_code: "",
          department_name: "",
          description: "",
          status: "active",
        });
      }
      setError(null);
      setFieldErrors({});
    }
  }, [isOpen, department]);

  const handleChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setLoading(true);

    const errors: Record<string, string> = {};

    if (!formData.department_code.trim()) {
      errors.department_code = "Department Code is required.";
    }
    if (!formData.department_name.trim()) {
      errors.department_name = "Department Name is required.";
    }

    if (existingDepartments && Array.isArray(existingDepartments)) {
      if (formData.department_code && formData.department_code.trim() !== "" && !isEdit) {
        const duplicateCode = existingDepartments.find(
          (d: any) =>
            d.department_code &&
            d.department_code.trim().toLowerCase() === formData.department_code.trim().toLowerCase()
        );
        if (duplicateCode) {
          errors.department_code = "Department Code is already in use.";
        }
      }

      if (formData.department_name && formData.department_name.trim() !== "") {
        const duplicateName = existingDepartments.find(
          (d: any) =>
            d.department_name &&
            d.department_name.trim().toLowerCase() === formData.department_name.trim().toLowerCase() &&
            (!isEdit || d.id !== department.id)
        );
        if (duplicateName) {
          errors.department_name = "Department Name is already in use.";
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    try {
      if (isEdit) {
        await updateDepartment(department.id, formData);
        toast.success("Department updated successfully!");
      } else {
        await createDepartment(formData);
        toast.success("Department created successfully!");
      }
      onSuccess();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "An error occurred";
      const normalizedMsg = errMsg.toLowerCase();
      if (normalizedMsg.includes("department code") || normalizedMsg.includes("code already exists")) {
        setFieldErrors({ department_code: errMsg });
      } else if (normalizedMsg.includes("department name") || normalizedMsg.includes("name already exists")) {
        setFieldErrors({ department_name: errMsg });
      } else {
        setError(errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? "Edit Department" : "Create New Department"}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <FormError message={error} />
        
        <Input
          label="Department Code *"
          name="department_code"
          value={formData.department_code}
          onChange={handleChange}
          required
          disabled={isEdit}
          placeholder="e.g. IT"
          error={fieldErrors.department_code}
        />
        
        <Input
          label="Department Name *"
          name="department_name"
          value={formData.department_name}
          onChange={handleChange}
          required
          placeholder="e.g. Information Technology"
          error={fieldErrors.department_name}
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            placeholder="e.g. Handles company software and hardware assets"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-900"
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
          error={fieldErrors.status}
        />

        <div className="mt-6 flex justify-end space-x-3 border-t border-gray-200 pt-4">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            {isEdit ? "Update Department" : "Create Department"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default DepartmentFormModal;
