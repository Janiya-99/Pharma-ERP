import React, { useState, useEffect } from "react";
import Modal from "../../../components/common/Modal";
import Input from "../../../components/common/Input";
import Button from "../../../components/common/Button";
import FormError from "../../../components/common/FormError";
import { createDesignation, updateDesignation } from "../../../api/controlApi";

import { toast } from "sonner";

const DesignationFormModal = ({ isOpen, onClose, designation = null, onSuccess }) => {
  const isEdit = !!designation;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    designation_name: "",
    description: "",
    status: "active",
  });

  useEffect(() => {
    if (isOpen) {
      if (designation) {
        setFormData({
          designation_name: designation.designation_name || "",
          description: designation.description || "",
          status: designation.status || "active",
        });
      } else {
        setFormData({
          designation_name: "",
          description: "",
          status: "active",
        });
      }
      setError(null);
    }
  }, [isOpen, designation]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isEdit) {
        await updateDesignation(designation.id, formData);
        toast.success("Designation updated successfully!");
      } else {
        await createDesignation(formData);
        toast.success("Designation created successfully!");
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
      title={isEdit ? "Edit Designation" : "Create New Designation"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormError message={error} />
        
        <Input
          label="Designation Name *"
          name="designation_name"
          value={formData.designation_name}
          onChange={handleChange}
          required
          placeholder="e.g. Finance Manager"
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

        <div className="mt-6 flex justify-end space-x-3 border-t border-gray-200 pt-4">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            {isEdit ? "Update Designation" : "Create Designation"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default DesignationFormModal;
