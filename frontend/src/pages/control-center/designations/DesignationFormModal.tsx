import { useState, useEffect } from "react";
import Modal from "../../../components/common/Modal";
import Input from "../../../components/common/Input";
import Button from "../../../components/common/Button";
import Select from "../../../components/common/Select";
import MultiSelect from "../../../components/common/MultiSelect";
import FormError from "../../../components/common/FormError";
import { 
  createDesignation, updateDesignation, 
  getDepartments, getRoles,
  getDesignationDepartments, getDesignationDefaultRoles,
  setDesignationDepartments, setDesignationDefaultRoles
} from "../../../api/controlApi";

import { toast } from "sonner";

const DesignationFormModal = ({ isOpen, onClose, designation = null, onSuccess }: { isOpen?: boolean; onClose?: unknown; designation?: any; onSuccess?: any }) => {
  const isEdit = !!designation;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    designation_name: "",
    description: "",
    status: "active",
  });

  const [allDepartments, setAllDepartments] = useState<any[]>([]);
  const [allRoles, setAllRoles] = useState<any[]>([]);
  const [selectedDepartments, setSelectedDepartments] = useState<any[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchDropdowns();
      if (designation) {
        setFormData({
          designation_name: designation.designation_name || "",
          description: designation.description || "",
          status: designation.status || "active",
        });
        fetchMappings(designation.id);
      } else {
        setFormData({
          designation_name: "",
          description: "",
          status: "active",
        });
        setSelectedDepartments([]);
        setSelectedRoles([]);
      }
      setError(null);
    }
  }, [isOpen, designation]);

  const fetchDropdowns = async () => {
    try {
      const [deptRes, roleRes] = await Promise.all([
        getDepartments({ limit: 200 }),
        getRoles({ limit: 200 })
      ]);
      setAllDepartments(deptRes.data || deptRes.items || deptRes || []);
      const rawRoles = roleRes.data || roleRes.items || roleRes || [];
      setAllRoles(rawRoles.filter((r: any) => r.role_code !== "SUPER_ADMIN"));
    } catch (err) {
      console.error("Failed to fetch dropdowns", err);
    }
  };

  const fetchMappings = async (id: number) => {
    try {
      const [deptRes, roleRes] = await Promise.all([
        getDesignationDepartments(id),
        getDesignationDefaultRoles(id)
      ]);
      
      const depts = (deptRes.data || deptRes || []).map((dd: any) => dd.department || dd);
      const roles = (roleRes.data || roleRes || []).map((dr: any) => dr.role || dr);
      
      setSelectedDepartments(depts.filter(Boolean));
      setSelectedRoles(roles.filter(Boolean));
    } catch (err) {
      console.error("Failed to fetch mappings", err);
    }
  };

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
      let desigId = designation?.id;
      if (isEdit) {
        await updateDesignation(desigId, formData);
        toast.success("Designation updated successfully!");
      } else {
        const res = await createDesignation(formData);
        desigId = res.data?.id || res.id;
        toast.success("Designation created successfully!");
      }

      if (desigId) {
        await Promise.all([
          setDesignationDepartments(desigId, { department_ids: selectedDepartments.map(d => d.id) }),
          setDesignationDefaultRoles(desigId, { role_ids: selectedRoles.map(r => r.id) })
        ]);
      }

      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose as any}
      title={isEdit ? "Edit Designation" : "Create New Designation"}
    >
      <form onSubmit={handleSubmit} className="flex flex-col space-y-4 h-full">
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
            rows={2}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-900"
           placeholder="Enter text..." />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Allowed Departments</label>
          <MultiSelect 
            options={allDepartments}
            selectedValues={selectedDepartments}
            onChange={setSelectedDepartments}
            placeholder="Select departments..."
            displayKey="department_name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Suggested Default Roles</label>
          <p className="text-xs text-gray-500 mb-1">Roles suggested when assigning this designation to a user.</p>
          <MultiSelect 
            options={allRoles}
            selectedValues={selectedRoles}
            onChange={setSelectedRoles}
            placeholder="Select default roles..."
            displayKey="role_name"
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
          <Button variant="secondary" onClick={onClose as any} disabled={loading}>
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
