import { useState, useEffect } from "react";
import Modal from "../../../components/common/Modal";
import Input from "../../../components/common/Input";
import Button from "../../../components/common/Button";
import Select from "../../../components/common/Select";
import FormError from "../../../components/common/FormError";
import { createBranch, updateBranch } from "../../../api/controlApi";

import { toast } from "sonner";

const BranchFormModal = ({
  isOpen,
  onClose,
  branch = null,
  onSuccess,
  existingBranches = [],
}: {
  isOpen?: boolean;
  onClose?: any;
  branch?: any;
  onSuccess?: any;
  existingBranches?: any[];
}) => {
  const isEdit = !!branch;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    branch_code: "",
    branch_name: "",
    branch_type: "Main Branch",
    address: "",
    phone: "",
    email: "",
    is_main_branch: false,
    status: "active",
  });

  useEffect(() => {
    if (isOpen) {
      if (branch) {
        setFormData({
          branch_code: branch.branch_code || "",
          branch_name: branch.branch_name || "",
          branch_type: branch.branch_type || "Main Branch",
          address: branch.address || "",
          phone: branch.phone || "",
          email: branch.email || "",
          is_main_branch: branch.is_main_branch || false,
          status: branch.status || "active",
        });
      } else {
        setFormData({
          branch_code: "",
          branch_name: "",
          branch_type: "Warehouse",
          address: "",
          phone: "",
          email: "",
          is_main_branch: false,
          status: "active",
        });
      }
      setError(null);
      setFieldErrors({});
    }
  }, [isOpen, branch]);

  const handleChange = (e: any) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});
    setLoading(true);

    const errors: Record<string, string> = {};

    // Required fields check
    if (!formData.branch_code.trim()) {
      errors.branch_code = "Branch Code is required.";
    }
    if (!formData.branch_name.trim()) {
      errors.branch_name = "Branch Name is required.";
    }
    if (!formData.branch_type.trim()) {
      errors.branch_type = "Branch Type is required.";
    }
    if (!formData.status.trim()) {
      errors.status = "Status is required.";
    }

    // Email format validation
    if (formData.email && formData.email.trim() !== "") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        errors.email = "Please enter a valid email address.";
      }
    }

    // Phone format validation (optional check, basic format check if entered)
    if (formData.phone && formData.phone.trim() !== "") {
      const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;
      if (!phoneRegex.test(formData.phone.trim())) {
        errors.phone = "Please enter a valid contact number (7-20 digits).";
      }
    }

    // Uniqueness validation across existing branches
    if (existingBranches && Array.isArray(existingBranches)) {
      if (formData.branch_name && formData.branch_name.trim() !== "") {
        const duplicateName = existingBranches.find(
          (b: any) =>
            b.branch_name &&
            b.branch_name.trim().toLowerCase() === formData.branch_name.trim().toLowerCase() &&
            (!isEdit || b.id !== branch.id)
        );
        if (duplicateName) {
          errors.branch_name = "Branch Name is already in use.";
        }
      }

      if (formData.phone && formData.phone.trim() !== "") {
        const duplicatePhone = existingBranches.find(
          (b: any) =>
            b.phone &&
            b.phone.trim().toLowerCase() === formData.phone.trim().toLowerCase() &&
            (!isEdit || b.id !== branch.id)
        );
        if (duplicatePhone) {
          errors.phone = `Contact number is already registered to branch "${duplicatePhone.branch_name}".`;
        }
      }

      if (formData.email && formData.email.trim() !== "") {
        const duplicateEmail = existingBranches.find(
          (b: any) =>
            b.email &&
            b.email.trim().toLowerCase() === formData.email.trim().toLowerCase() &&
            (!isEdit || b.id !== branch.id)
        );
        if (duplicateEmail) {
          errors.email = `Email address is already registered to branch "${duplicateEmail.branch_name}".`;
        }
      }
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        is_main_branch: Boolean(formData.is_main_branch),
      };

      if (isEdit) {
        await updateBranch(branch.id, payload);
        toast.success("Branch updated successfully!");
      } else {
        await createBranch(payload);
        toast.success("Branch created successfully!");
      }
      onSuccess();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "An error occurred";
      const normalizedMsg = errMsg.toLowerCase();
      if (normalizedMsg.includes("branch code") || normalizedMsg.includes("code already exists")) {
        setFieldErrors({ branch_code: errMsg });
      } else if (normalizedMsg.includes("branch name") || normalizedMsg.includes("name already exists")) {
        setFieldErrors({ branch_name: errMsg });
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
      title={isEdit ? "Edit Branch" : "Create New Branch"}
      size="lg"
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col space-y-4 h-full">
        <FormError message={error} />
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Branch Code *"
            name="branch_code"
            value={formData.branch_code}
            onChange={handleChange}
            required
            disabled={isEdit}
            placeholder="e.g. CMB-01"
            error={fieldErrors.branch_code}
          />
          <Input
            label="Branch Name *"
            name="branch_name"
            value={formData.branch_name}
            onChange={handleChange}
            required
            placeholder="e.g. Colombo Headquarters"
            error={fieldErrors.branch_name}
          />
          
          <Select
            label="Branch Type"
            name="branch_type"
            value={formData.branch_type}
            onChange={handleChange}
            required
            options={[
              { value: "Main Branch", label: "Main Branch" },
              { value: "Warehouse", label: "Warehouse" },
              { value: "Sales Branch", label: "Sales Branch" },
              { value: "Distribution Center", label: "Distribution Center" },
              { value: "Admin Office", label: "Admin Office" },
            ]}
            error={fieldErrors.branch_type}
          />
          
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
 
          <Input
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="e.g. +94 11 234 5678"
            error={fieldErrors.phone}
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="e.g. branch@company.com"
            error={fieldErrors.email}
          />
 
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-950 mb-1.5">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={2}
              placeholder="e.g. 123 Galle Road, Colombo 03"
              className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100/50 transition-all duration-150"
            />
            {fieldErrors.address && <p className="mt-1 text-xs text-red-500">{fieldErrors.address}</p>}
          </div>
 
          <div className="sm:col-span-2 flex items-center mt-2">
            <input
              id="is_main_branch"
              name="is_main_branch"
              type="checkbox"
              checked={formData.is_main_branch}
              onChange={handleChange}
              className="h-4 w-4 rounded-md border-slate-200 text-slate-900 focus:ring-slate-200 cursor-pointer transition-all"
            />
            <label htmlFor="is_main_branch" className="ml-2 block text-sm font-medium text-slate-900 select-none cursor-pointer">
              Set as Main Branch
            </label>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3 border-t border-gray-200 pt-4">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            {isEdit ? "Update Branch" : "Create Branch"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default BranchFormModal;
