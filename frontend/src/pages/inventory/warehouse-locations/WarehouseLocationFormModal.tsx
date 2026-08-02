import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import Modal from "../../../components/common/Modal";
import { inventoryApi } from "../../../api/inventoryApi";
import { useAuth } from "../../../auth/AuthContext";
import WarehouseSelect from "../../../components/inventory/WarehouseSelect";

const WarehouseLocationFormModal = ({ isOpen, onClose, onSave, initialData }: { isOpen?: boolean; onClose?: unknown; onSave?: unknown; initialData?: unknown }) => {
  const [loading, setLoading] = useState(false);
  const { branches } = useAuth();
  
  const [formData, setFormData] = useState({
        warehouse_id: "",
        location_code: "",
        location_name: "",
        rack: "",
        shelf: "",
        bin: "",
        storage_condition: "",
        status: "active",

  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData
      });
    } else {
      setFormData({
        warehouse_id: "",
        location_code: "",
        location_name: "",
        rack: "",
        shelf: "",
        bin: "",
        storage_condition: "",
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

  const handleCustomChange = (name: unknown, value: unknown) => {
    setFormData((prev: unknown) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (initialData) {
        await inventoryApi.updateWarehouseLocation(initialData.id, formData);
        toast.success("Updated successfully");
      } else {
        await inventoryApi.createWarehouseLocation(formData);
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
      title={initialData ? "Edit Warehouse Location" : "Create Warehouse Location"}
    >
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4 h-full">
                <div>
          <label className="block text-sm font-medium text-gray-700  mb-1">
            Warehouse <span className="text-red-500">*</span>
          </label>
          <WarehouseSelect
            value={formData.warehouse_id}
            onChange={(v: unknown) => handleCustomChange("warehouse_id", v)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700  mb-1">
            Location Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="location_code"
            value={formData.location_code || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200  rounded-xl text-sm focus:ring-2 focus:ring-brand-500 bg-white  text-gray-700 " required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700  mb-1">
            Location Name 
          </label>
          <input
            type="text"
            name="location_name"
            value={formData.location_name || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200  rounded-xl text-sm focus:ring-2 focus:ring-brand-500 bg-white  text-gray-700 "
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700  mb-1">
            Rack 
          </label>
          <input
            type="text"
            name="rack"
            value={formData.rack || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200  rounded-xl text-sm focus:ring-2 focus:ring-brand-500 bg-white  text-gray-700 "
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700  mb-1">
            Shelf 
          </label>
          <input
            type="text"
            name="shelf"
            value={formData.shelf || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200  rounded-xl text-sm focus:ring-2 focus:ring-brand-500 bg-white  text-gray-700 "
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700  mb-1">
            Bin 
          </label>
          <input
            type="text"
            name="bin"
            value={formData.bin || ""}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200  rounded-xl text-sm focus:ring-2 focus:ring-brand-500 bg-white  text-gray-700 "
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700  mb-1">
            Storage Condition <span className="text-red-500">*</span>
          </label>
          <select
            name="storage_condition"
            value={formData.storage_condition}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200  rounded-xl text-sm focus:ring-2 focus:ring-brand-500 bg-white  text-gray-700 " required
          >
            <option value="">Select...</option>
            <option value="normal">Normal</option><option value="cool">Cool</option><option value="cold_chain">Cold Chain</option><option value="controlled_drug">Controlled Drug</option><option value="hazardous">Hazardous</option><option value="quarantine">Quarantine</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700  mb-1">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-200  rounded-xl text-sm focus:ring-2 focus:ring-brand-500 bg-white  text-gray-700 " required
          >
            <option value="">Select...</option>
            <option value="active">Active</option><option value="inactive">Inactive</option>
          </select>
        </div>


        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100  mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200    rounded-xl transition-colors"
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

export default WarehouseLocationFormModal;
