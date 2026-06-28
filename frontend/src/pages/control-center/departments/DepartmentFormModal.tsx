import { useState, useEffect } from "react";
import Modal from "../../../components/common/Modal";
import Input from "../../../components/common/Input";
import Button from "../../../components/common/Button";
import Select from "../../../components/common/Select";
import FormError from "../../../components/common/FormError";
import { createDepartment, updateDepartment } from "../../../api/controlApi";

import { toast } from "sonner";

const DepartmentFormModal = ({ isOpen, onClose, department = null, onSuccess }: { isOpen?: boolean; onClose?: unknown; department?: unknown; onSuccess?: unknown }) => {
  const isEdit = !!department;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    setLoading(true);

    try {
      if (isEdit) {
        await updateDepartment(department.id, formData);
        toast.success("Department updated successfully!");
      } else {
        await createDepartment(formData);
        toast.success("Department created successfully!");
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred");
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
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormError message={error} />
        
        <Input
          label="Department Code *"
          name="department_code"
          value={formData.department_code}
          onChange={handleChange}
          required
          disabled={isEdit}
          placeholder="e.g. IT"
        />
        
        <Input
          label="Department Name *"
          name="department_name"
          value={formData.department_name}
          onChange={handleChange}
          required
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
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
