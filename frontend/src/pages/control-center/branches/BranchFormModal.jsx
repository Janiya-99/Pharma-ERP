import React, { useState, useEffect } from "react";
import Modal from "../../../components/common/Modal";
import Input from "../../../components/common/Input";
import Button from "../../../components/common/Button";
import FormError from "../../../components/common/FormError";
import { createBranch, updateBranch } from "../../../api/controlApi";

import { toast } from "sonner";

const BranchFormModal = ({ isOpen, onClose, branch = null, onSuccess }) => {
  const isEdit = !!branch;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const handleChange = (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

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
      title={isEdit ? "Edit Branch" : "Create New Branch"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
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
          />
          <Input
            label="Branch Name *"
            name="branch_name"
            value={formData.branch_name}
            onChange={handleChange}
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Branch Type *</label>
            <select
              name="branch_type"
              value={formData.branch_type}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
            >
              <option value="Main Branch">Main Branch</option>
              <option value="Warehouse">Warehouse</option>
              <option value="Sales Branch">Sales Branch</option>
              <option value="Distribution Center">Distribution Center</option>
              <option value="Admin Office">Admin Office</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <Input
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
          />

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={2}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
            />
          </div>

          <div className="sm:col-span-2 flex items-center mt-2">
            <input
              id="is_main_branch"
              name="is_main_branch"
              type="checkbox"
              checked={formData.is_main_branch}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-blue-900 focus:ring-blue-900"
            />
            <label htmlFor="is_main_branch" className="ml-2 block text-sm text-gray-900">
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
