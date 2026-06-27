import React, { useState, useEffect } from "react";
import Button from "../../../components/common/Button";
import Select from "../../../components/common/Select";
import FormError from "../../../components/common/FormError";
import RoleSelector from "../../../components/common/RoleSelector";
import { getUserBranches, getUserSoftware, assignUserAccessMatrix } from "../../../api/controlApi";
import { Plus } from "lucide-react";

const UserAccessMatrixForm = ({ user, onSuccess }: { user?: unknown; onSuccess?: unknown }) => {
  const [branches, setBranches] = useState([]);
  const [softwareModules, setSoftwareModules] = useState([]);
  
  const [formData, setFormData] = useState({
    branch_id: "",
    software_id: "",
    role_id: ""
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchUserAccessData();
      // Reset form
      setFormData({
        branch_id: "",
        software_id: "",
        role_id: ""
      });
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchUserAccessData = async () => {
    try {
      setLoading(true);
      const [branchRes, softwareRes] = await Promise.all([
        getUserBranches(user.id),
        getUserSoftware(user.id)
      ]);

      if (branchRes.success) setBranches(branchRes.data.branches || []);
      if (softwareRes.success) setSoftwareModules(softwareRes.data.software_modules || []);
      
    } catch (err) {
      console.error("Failed to fetch user access data", err);
      setError("Failed to load this user's branch and software access. Assign branch and software access before adding a role.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev: unknown) => ({
      ...prev,
      [name]: value,
      // Reset role if software changes
      ...(name === 'software_id' ? { role_id: '' } : {})
    }));
  };

  const validate = () => {
    if (!formData.branch_id) return "Branch is required.";
    if (!formData.software_id) return "Software Module is required.";
    if (!formData.role_id) return "Role is required.";
    return null;
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload = {
      access: [
        {
          branch_id: parseInt(formData.branch_id, 10),
          software_id: parseInt(formData.software_id, 10),
          role_id: parseInt(formData.role_id, 10)
        }
      ]
    };

    try {
      const res = await assignUserAccessMatrix(user.id, payload);
      if (res.success) {
        setFormData({
          branch_id: "",
          software_id: "",
          role_id: ""
        });
        onSuccess("Role successfully assigned to user for the selected branch and software.");
      } else {
        setError(res.message || "Failed to assign access.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign access.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">Add Access Assignment</h2>
      
      <FormError message={error} />
      
      {loading ? (
        <div className="text-sm text-gray-500 py-4">Loading user's allowed branches and software...</div>
      ) : branches.length === 0 ? (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-100">
          This user has no assigned branches. Assign branch access first, then return here to add roles.
        </div>
      ) : softwareModules.length === 0 ? (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md border border-red-100">
          This user has no assigned software modules. Assign software access first, then return here to add roles.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <Select
              label="Branch"
              name="branch_id"
              value={formData.branch_id}
              onChange={handleChange}
              searchable={true}
              placeholder="Select Branch"
              options={branches.map((b: unknown) => ({ value: b.id, label: b.branch_name }))}
            />

            <Select
              label="Software Module"
              name="software_id"
              value={formData.software_id}
              onChange={handleChange}
              searchable={true}
              placeholder="Select Software"
              options={softwareModules.map((s: unknown) => ({ value: s.id, label: s.software_name }))}
            />

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Role *</label>
              <RoleSelector
                softwareId={formData.software_id}
                value={formData.role_id}
                onChange={(val: unknown) => setFormData((prev: unknown) => ({ ...prev, role_id: val }))}
                disabled={!formData.software_id}
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" isLoading={submitting}>
              <Plus className="w-4 h-4 mr-2" /> Add Assignment
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default UserAccessMatrixForm;
