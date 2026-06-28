import React, { useState, useEffect } from "react";
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
    }
  }, [isOpen, branch]);

  const handleChange = (e: any) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Email format validation
    if (formData.email && formData.email.trim() !== "") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        setError("Please enter a valid email address.");
        setLoading(false);
        return;
      }
    }

    // Phone format validation (optional check, basic format check if entered)
    if (formData.phone && formData.phone.trim() !== "") {
      const phoneRegex = /^\+?[0-9\s\-()]{7,20}$/;
      if (!phoneRegex.test(formData.phone.trim())) {
        setError("Please enter a valid contact number (7-20 digits).");
        setLoading(false);
        return;
      }
    }

    // Uniqueness validation across existing branches
    if (existingBranches && Array.isArray(existingBranches)) {
      if (formData.phone && formData.phone.trim() !== "") {
        const duplicatePhone = existingBranches.find(
          (b: any) =>
            b.phone &&
            b.phone.trim().toLowerCase() ===
              formData.phone.trim().toLowerCase() &&
            (!isEdit || b.id !== branch.id)
        );
        if (duplicatePhone) {
          setError(
            `Contact number is already registered to branch "${duplicatePhone.branch_name}".`
          );
          setLoading(false);
          return;
        }
      }

      if (formData.email && formData.email.trim() !== "") {
        const duplicateEmail = existingBranches.find(
          (b: any) =>
            b.email &&
            b.email.trim().toLowerCase() ===
              formData.email.trim().toLowerCase() &&
            (!isEdit || b.id !== branch.id)
        );
        if (duplicateEmail) {
          setError(
            `Email address is already registered to branch "${duplicateEmail.branch_name}".`
          );
          setLoading(false);
          return;
        }
      }
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
      setError(err.response?.data?.message || "An error occurred");
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
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormError message={error} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Branch Code *"
            name="branch_code"
            value={formData.branch_code}
            onChange={handleChange}
            required
            disabled={isEdit}
            placeholder="e.g. CMB-01"
          />
          <Input
            label="Branch Name *"
            name="branch_name"
            value={formData.branch_name}
            onChange={handleChange}
            required
            placeholder="e.g. Colombo Headquarters"
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
          />

          <Input
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="e.g. +94 11 234 5678"
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="e.g. branch@company.com"
          />

          <div className="sm:col-span-2">
            <label className="text-slate-950 mb-1.5 block text-xs font-semibold">
              Address
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={2}
              placeholder="e.g. 123 Galle Road, Colombo 03"
              className="border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:ring-slate-100/50 w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm shadow-sm transition-all duration-150 focus:outline-none focus:ring-2"
            />
          </div>

          <div className="mt-2 flex items-center sm:col-span-2">
            <input
              id="is_main_branch"
              name="is_main_branch"
              type="checkbox"
              checked={formData.is_main_branch}
              onChange={handleChange}
              className="border-slate-200 text-slate-900 focus:ring-slate-200 h-4 w-4 cursor-pointer rounded-md transition-all"
            />
            <label
              htmlFor="is_main_branch"
              className="text-slate-900 ml-2 block cursor-pointer select-none text-sm font-medium"
            >
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
