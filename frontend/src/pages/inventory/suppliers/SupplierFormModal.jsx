import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import Modal from "../../../components/common/Modal";
import { inventoryApi } from "../../../api/inventoryApi";
import { useAuth } from "../../../auth/AuthContext";
import ProductCategorySelect from "../../../components/inventory/ProductCategorySelect";
import WarehouseSelect from "../../../components/inventory/WarehouseSelect";

const SupplierFormModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [loading, setLoading] = useState(false);
  const { branches } = useAuth();
  
  const [formData, setFormData] = useState({
        supplier_code: "",
        supplier_name: "",
        contact_person: "",
        contact_number: "",
        email: "",
        address: "",
        tax_registration_number: "",
        payment_terms_days: "",
        payable_account_id: "",
        status: "active",

  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData
      });
    } else {
      setFormData({
        supplier_code: "",
        supplier_name: "",
        contact_person: "",
        contact_number: "",
        email: "",
        address: "",
        tax_registration_number: "",
        payment_terms_days: "",
        payable_account_id: "",
        status: "active",

      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCustomChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (initialData) {
        await inventoryApi.updateSupplier(initialData.id, formData);
        toast.success("Updated successfully");
      } else {
        await inventoryApi.createSupplier(formData);
        toast.success("Created successfully");
      }
      onSave();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Supplier" : "Create Supplier"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
                <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Supplier Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="supplier_code"
            value={formData.supplier_code || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200 dark:border-navy-600 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-700 text-gray-700 dark:text-white" required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Supplier Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="supplier_name"
            value={formData.supplier_name || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200 dark:border-navy-600 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-700 text-gray-700 dark:text-white" required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Contact Person 
          </label>
          <input
            type="text"
            name="contact_person"
            value={formData.contact_person || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200 dark:border-navy-600 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-700 text-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Contact Number 
          </label>
          <input
            type="text"
            name="contact_number"
            value={formData.contact_number || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200 dark:border-navy-600 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-700 text-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email 
          </label>
          <input
            type="email"
            name="email"
            value={formData.email || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200 dark:border-navy-600 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-700 text-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Address 
          </label>
          <textarea
            name="address"
            value={formData.address || ""}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 dark:border-navy-600 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-700 text-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Tax Registration Number 
          </label>
          <input
            type="text"
            name="tax_registration_number"
            value={formData.tax_registration_number || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200 dark:border-navy-600 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-700 text-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Payment Terms Days 
          </label>
          <input
            type="number"
            name="payment_terms_days"
            value={formData.payment_terms_days || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200 dark:border-navy-600 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-700 text-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Payable Account 
          </label>
          <input
            type="number"
            name="payable_account_id"
            value={formData.payable_account_id || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200 dark:border-navy-600 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-700 text-gray-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200 dark:border-navy-600 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-700 text-gray-700 dark:text-white" required
          >
            <option value="">Select...</option>
            <option value="active">Active</option><option value="inactive">Inactive</option>
          </select>
        </div>


        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-navy-600 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-navy-600 dark:text-gray-300 dark:hover:bg-navy-500 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-xl disabled:opacity-50 transition-colors"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default SupplierFormModal;
