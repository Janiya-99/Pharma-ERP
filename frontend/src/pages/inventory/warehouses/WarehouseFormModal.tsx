import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import Modal from "../../../components/common/Modal";
import { inventoryApi } from "../../../api/inventoryApi";
import { useAuth } from "../../../auth/AuthContext";

const WarehouseFormModal = ({ isOpen, onClose, onSave, initialData }: { isOpen?: boolean; onClose?: unknown; onSave?: unknown; initialData?: unknown }) => {
  const [loading, setLoading] = useState(false);
  const { branches } = useAuth();
  
  const [formData, setFormData] = useState({
        branch_id: "",
        warehouse_code: "",
        warehouse_name: "",
        warehouse_type: "",
        address: "",
        contact_person: "",
        contact_number: "",
        is_default: false,
        status: "active",

  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData
      });
    } else {
      setFormData({
        branch_id: "",
        warehouse_code: "",
        warehouse_name: "",
        warehouse_type: "",
        address: "",
        contact_person: "",
        contact_number: "",
        is_default: false,
        status: "active",

      });
    }
  }, [initialData, isOpen]);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev: unknown) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };


  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (initialData) {
        await inventoryApi.updateWarehouse(initialData.id, formData);
        toast.success("Updated successfully");
      } else {
        await inventoryApi.createWarehouse(formData);
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
      title={initialData ? "Edit Warehouse" : "Create Warehouse"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
                <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Branch <span className="text-red-500">*</span>
          </label>
          <select
            name="branch_id"
            value={formData.branch_id}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200 dark:border-navy-600 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-700 text-gray-700 dark:text-white" required
          >
            <option value="">Select Branch...</option>
            {branches.map((b: unknown) => (
              <option key={b.id} value={b.id}>
                {b.branch_name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Warehouse Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="warehouse_code"
            value={formData.warehouse_code || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200 dark:border-navy-600 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-700 text-gray-700 dark:text-white" required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Warehouse Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="warehouse_name"
            value={formData.warehouse_name || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200 dark:border-navy-600 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-700 text-gray-700 dark:text-white" required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Warehouse Type <span className="text-red-500">*</span>
          </label>
          <select
            name="warehouse_type"
            value={formData.warehouse_type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200 dark:border-navy-600 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-700 text-gray-700 dark:text-white" required
          >
            <option value="">Select...</option>
            <option value="main">Main</option><option value="secondary">Secondary</option><option value="cold_storage">Cold Storage</option><option value="quarantine">Quarantine</option><option value="damaged">Damaged</option><option value="expired">Expired</option><option value="return">Return</option>
          </select>
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
        <div><label className="flex items-center gap-2 cursor-pointer mt-2">
            <input
              type="checkbox"
              name="is_default"
              checked={formData.is_default || false}
              onChange={handleChange}
              className="h-4 w-4 text-brand-500 focus:ring-brand-500 border-gray-300 rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Is Default</span>
          </label></div>
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

export default WarehouseFormModal;
