import { useState, useEffect } from "react";
import Modal from "../../../components/common/Modal";
import Input from "../../../components/common/Input";
import Button from "../../../components/common/Button";
import Select from "../../../components/common/Select";
import FormError from "../../../components/common/FormError";
import PermissionCheckboxGroup from "../../../components/common/PermissionCheckboxGroup";
import { createRole, updateRole, getPermissionsGrouped, getRolePermissionMatrix } from "../../../api/controlApi";
import { toast } from "sonner";
import { Shield, Layers, CheckSquare, Square } from "lucide-react";

const RoleFormModal = ({ isOpen, onClose, role, onSuccess, softwareModules }: { isOpen?: boolean; onClose?: unknown; role?: any; onSuccess?: unknown; softwareModules?: any }) => {
  const isEdit = !!role;

  const [formData, setFormData] = useState({
    software_id: "",
    role_name: "",
    role_code: "",
    description: "",
    status: "active",
  });

  const [groupedPermissions, setGroupedPermissions] = useState<any[]>([]);
  const [assignedPermissionIds, setAssignedPermissionIds] = useState<any[]>([]);
  const [loadingPerms, setLoadingPerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (isEdit) {
        setFormData({
          software_id: role.software_id || "",
          role_name: role.role_name || "",
          role_code: role.role_code || "",
          description: role.description || "",
          status: role.status || "active",
        });
        if (role.permission_ids && Array.isArray(role.permission_ids)) {
          setAssignedPermissionIds(role.permission_ids);
        } else if (role.id) {
          getRolePermissionMatrix(role.id).then((res: any) => {
            if (res.success) {
              const perms = Array.isArray(res.data.permissions) ? res.data.permissions : (Array.isArray(res.data) ? res.data : []);
              setAssignedPermissionIds(perms.map((p: any) => p.id));
            }
          });
        }
      } else {
        setFormData({
          software_id: "",
          role_name: "",
          role_code: "",
          description: "",
          status: "active",
        });
        setAssignedPermissionIds([]);
      }
      setError(null);
    }
  }, [isOpen, role, isEdit]);

  useEffect(() => {
    if (formData.software_id) {
      setLoadingPerms(true);
      getPermissionsGrouped({ software_id: formData.software_id, limit: 1000 })
        .then((res: any) => {
          if (res.success) {
            const data = res.data || [];
            const groups = Array.isArray(data) && data.length > 0 && Array.isArray(data[0]?.groups)
              ? data[0].groups
              : (Array.isArray(data) ? data : []);
            setGroupedPermissions(groups);
          }
        })
        .catch(() => {
          setGroupedPermissions([]);
        })
        .finally(() => {
          setLoadingPerms(false);
        });
    } else {
      setGroupedPermissions([]);
    }
  }, [formData.software_id]);

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!formData.software_id) return "Software Module is required.";
    if (!formData.role_name.trim()) return "Role Name is required.";
    if (!formData.role_code.trim()) return "Role Code is required.";
    if (!formData.status) return "Status is required.";
    return null;
  };

  const handleGroupSelectionChange = (groupIds: any[], groupName: string) => {
    const groupPermIds = groupedPermissions
      .find((g: any) => g.permission_group === groupName)
      ?.permissions.map((p: any) => p.id) || [];
      
    let newSelection = assignedPermissionIds.filter((id: any) => !groupPermIds.includes(id));
    newSelection = [...newSelection, ...groupIds];
    setAssignedPermissionIds(newSelection);
  };

  const allPermIds = groupedPermissions.flatMap((g: any) => g.permissions?.map((p: any) => p.id) || []);
  const isAllSelected = allPermIds.length > 0 && allPermIds.every((id: any) => assignedPermissionIds.includes(id));

  const handleSelectAllPerms = () => {
    if (isAllSelected) {
      setAssignedPermissionIds([]);
    } else {
      setAssignedPermissionIds(Array.from(new Set([...assignedPermissionIds, ...allPermIds])));
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    const payload = {
      software_id: parseInt(formData.software_id, 10),
      role_name: formData.role_name,
      role_code: formData.role_code,
      description: formData.description,
      status: formData.status,
      permission_ids: assignedPermissionIds,
    };

    try {
      let res;
      if (isEdit) {
        res = await updateRole(role.id, payload);
      } else {
        res = await createRole(payload);
      }

      if (res.success) {
        if (isEdit) {
          toast.success("Role updated successfully!");
        } else {
          toast.success("Role created successfully!");
        }
        if (typeof onSuccess === "function") onSuccess();
      } else {
        setError(res.message || "An error occurred");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={typeof onClose === "function" ? onClose : undefined}
      title={isEdit ? "Edit Role & Permissions" : "Create Role & Assign Permissions"}
      size="half"
    >
      <form onSubmit={handleSubmit} className="flex flex-col space-y-6 h-full">
        <FormError message={error} />

        {isEdit && role?.is_system && (
          <div className="bg-indigo-50 text-indigo-800 p-3 rounded-md text-sm border border-indigo-100 flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            <span><strong>System Role:</strong> This role is required by the system. Some properties may be restricted from changes.</span>
          </div>
        )}

        <div className="bg-slate-50 p-6 rounded-[10px] border border-slate-200 space-y-5">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2.5">
            <Layers className="w-4 h-4 text-indigo-600" />
            1. Role Details
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Software Module *"
              name="software_id"
              value={formData.software_id}
              onChange={handleChange}
              disabled={isEdit}
              required
              searchable={true}
              placeholder="Select Software Module"
              options={(softwareModules || []).map((s: any) => ({ value: s.id, label: s.software_name }))}
            />

            <Select
              label="Status *"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              options={[
                { value: "active", label: "Active" },
                { value: "inactive", label: "Inactive" },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Role Name *"
              name="role_name"
              value={formData.role_name}
              onChange={handleChange}
              required
              autoFocus
            />

            <Input
              label="Role Code *"
              name="role_code"
              value={formData.role_code}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={2}
              className="w-full rounded-[10px] border border-slate-200 bg-white px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 hover:border-slate-300 transition-all"
              placeholder="Role description..."
            />
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-indigo-600" />
                2. Assign Permissions
              </h4>
              <p className="text-xs text-gray-500 mt-0.5">
                {formData.software_id 
                  ? `Select the permissions this role will grant (${assignedPermissionIds.length} selected)`
                  : "Select a software module above to view available permissions"}
              </p>
            </div>

            {groupedPermissions.length > 0 && (
              <button
                type="button"
                onClick={handleSelectAllPerms}
                className="text-xs font-semibold h-9 px-3.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 transition-all text-slate-700 flex items-center gap-2 shadow-sm self-start sm:self-auto"
              >
                {isAllSelected ? (
                  <>
                    <Square className="w-4 h-4 text-slate-400" />
                    Clear All Permissions
                  </>
                ) : (
                  <>
                    <CheckSquare className="w-4 h-4 text-indigo-600" />
                    Select All Permissions
                  </>
                )}
              </button>
            )}
          </div>

          {!formData.software_id ? (
            <div className="bg-white p-8 text-center rounded-[10px] border border-dashed border-slate-300 text-slate-400">
              <Layers className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm font-medium">No Software Module Selected</p>
              <p className="text-xs mt-1">Choose a software module in step 1 to load permissions.</p>
            </div>
          ) : loadingPerms ? (
            <div className="bg-white p-8 text-center rounded-lg border border-gray-200 text-gray-500 flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mb-2"></div>
              <p className="text-sm">Loading available permissions...</p>
            </div>
          ) : groupedPermissions.length === 0 ? (
            <div className="bg-white p-8 text-center rounded-lg border border-gray-200 text-gray-500">
              <p className="text-sm font-medium">No Permissions Found</p>
              <p className="text-xs mt-1">No permissions are configured for this module yet.</p>
            </div>
          ) : (
            <div className="max-h-[50vh] overflow-y-auto pr-1 space-y-4">
              {groupedPermissions.map((group: any, idx: number) => {
                const groupPermIds = group.permissions?.map((p: any) => p.id) || [];
                const selectedInGroup = assignedPermissionIds.filter((id: any) => groupPermIds.includes(id));

                return (
                  <PermissionCheckboxGroup
                    key={idx}
                    groupName={group.permission_group}
                    permissions={group.permissions}
                    selectedIds={selectedInGroup}
                    onSelectionChange={(newSelectedInGroup: any) => 
                      handleGroupSelectionChange(newSelectedInGroup, group.permission_group)
                    }
                  />
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 sticky bottom-0 bg-white py-3">
          <Button variant="secondary" onClick={typeof onClose === "function" ? onClose : undefined} type="button">
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            {isEdit ? "Update Role" : "Create Role"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RoleFormModal;
