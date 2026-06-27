import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getPermissionsGrouped, getRolePermissionMatrix, assignRolePermissions } from "../../../api/controlApi";
import { useAuth } from "../../../auth/AuthContext";
import PageHeader from "../../../components/common/PageHeader";
import Button from "../../../components/common/Button";
import FormError from "../../../components/common/FormError";
import SoftwareSelector from "../../../components/common/SoftwareSelector";
import RoleSelector from "../../../components/common/RoleSelector";
import PermissionCheckboxGroup from "../../../components/common/PermissionCheckboxGroup";
import PermissionGuard from "../../../auth/PermissionGuard";
import { Save, AlertTriangle, CheckCircle2, Layers, Shield } from "lucide-react";

const RolePermissionMatrixPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { hasPermission } = useAuth();
  const canAssign = hasPermission("control.permission.assign");

  const initialSoftwareId = searchParams.get("software_id") || "";
  const initialRoleId = searchParams.get("role_id") || "";

  const [selectedSoftware, setSelectedSoftware] = useState(initialSoftwareId);
  const [selectedRole, setSelectedRole] = useState(initialRoleId);

  const [groupedPermissions, setGroupedPermissions] = useState([]);
  const [assignedPermissionIds, setAssignedPermissionIds] = useState([]);
  const [initialAssignedIds, setInitialAssignedIds] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Sync state when selections change
  useEffect(() => {
    if (selectedSoftware) {
      fetchGroupedPermissions(selectedSoftware);
    } else {
      setGroupedPermissions([]);
      setSelectedRole("");
    }
  }, [selectedSoftware]);

  useEffect(() => {
    if (selectedRole) {
      fetchRolePermissions(selectedRole);
    } else {
      setAssignedPermissionIds([]);
      setInitialAssignedIds([]);
      setHasUnsavedChanges(false);
    }
  }, [selectedRole]);

  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    if (selectedSoftware) {
      newParams.set("software_id", selectedSoftware);
    } else {
      newParams.delete("software_id");
    }
    if (selectedRole) {
      newParams.set("role_id", selectedRole);
    } else {
      newParams.delete("role_id");
    }
    if (newParams.toString() !== searchParams.toString()) {
      setSearchParams(newParams, { replace: true });
    }
  }, [selectedSoftware, selectedRole, searchParams, setSearchParams]);

  // Check for unsaved changes
  useEffect(() => {
    const isDifferent = 
      assignedPermissionIds.length !== initialAssignedIds.length ||
      !assignedPermissionIds.every((id: string | number) => initialAssignedIds.includes(id)) ||
      !initialAssignedIds.every((id: string | number) => assignedPermissionIds.includes(id));
      
    setHasUnsavedChanges(isDifferent);
  }, [assignedPermissionIds, initialAssignedIds]);

  const fetchGroupedPermissions = async (softwareId: string | number) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getPermissionsGrouped({ software_id: softwareId, limit: 1000 });
      if (res.success) {
        setGroupedPermissions(res.data || []);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load permissions for software");
    } finally {
      setLoading(false);
    }
  };

  const fetchRolePermissions = async (roleId: string | number) => {
    try {
      setLoading(true);
      setError(null);
      setSuccessMsg(null);
      const res = await getRolePermissionMatrix(roleId);
      if (res.success) {
        // Backend could return an array of objects or IDs. Assuming array of objects.
        const perms = Array.isArray(res.data.permissions) ? res.data.permissions : (Array.isArray(res.data) ? res.data : []);
        const ids = perms.map((p: unknown) => p.id);
        setAssignedPermissionIds(ids);
        setInitialAssignedIds(ids);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load role permissions");
    } finally {
      setLoading(false);
    }
  };

  const handleGroupSelectionChange = (groupIds: any, groupName: any) => {
    const groupPermIds = groupedPermissions
      .find((g: any) => g.permission_group === groupName)
      ?.permissions.map((p: any) => p.id) || [];
      
    // Remove old ids for this group
    let newSelection = assignedPermissionIds.filter((id: string | number) => !groupPermIds.includes(id));
    // Add new ones
    newSelection = [...newSelection, ...groupIds];
    setAssignedPermissionIds(newSelection);
  };

  const handleSave = async () => {
    if (!selectedRole || !canAssign) return;
    
    try {
      setSaving(true);
      setError(null);
      setSuccessMsg(null);
      
      const payload = { permission_ids: assignedPermissionIds };
      const res = await assignRolePermissions(selectedRole, payload);
      
      if (res.success) {
        setSuccessMsg("Permissions saved successfully!");
        setInitialAssignedIds([...assignedPermissionIds]);
        setHasUnsavedChanges(false);
      } else {
        setError(res.message || "Failed to save permissions.");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save permissions.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Role Permission Matrix"
        description="Manage the exact permissions assigned to each role across software modules."
      />

      <FormError message={error} />
      {successMsg && (
        <div className="mb-6 bg-green-50 text-green-800 p-3 rounded-md text-sm border border-green-200 flex items-center">
          <CheckCircle2 className="w-5 h-5 mr-2 text-green-500" />
          {successMsg}
        </div>
      )}

      {/* Top Filter Bar */}
      <div className="bg-white p-5 rounded-lg border border-gray-200 mb-6 flex flex-col md:flex-row gap-4 shadow-sm items-end justify-between">
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="w-full md:w-64">
            <label className="block text-sm font-medium text-gray-700 mb-1">1. Select Software Module</label>
            <SoftwareSelector
              value={selectedSoftware}
              onChange={setSelectedSoftware}
            />
          </div>
          <div className="w-full md:w-64">
            <label className="block text-sm font-medium text-gray-700 mb-1">2. Select Role</label>
            <RoleSelector
              softwareId={selectedSoftware}
              value={selectedRole}
              onChange={setSelectedRole}
              disabled={!selectedSoftware}
            />
          </div>
        </div>

        {selectedRole && canAssign && (
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            {hasUnsavedChanges && (
              <span className="text-orange-600 text-sm font-medium flex items-center bg-orange-50 px-3 py-1.5 rounded border border-orange-200">
                <AlertTriangle className="w-4 h-4 mr-1.5" /> Unsaved changes
              </span>
            )}
            <Button onClick={handleSave} isLoading={saving} disabled={!hasUnsavedChanges}>
              <Save className="w-4 h-4 mr-2" /> Save Permissions
            </Button>
          </div>
        )}
      </div>

      {/* Main Area */}
      {!selectedSoftware ? (
        <div className="bg-white p-12 text-center rounded-lg border border-gray-200 shadow-sm text-gray-500">
          <Layers className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-lg font-medium text-gray-900">No Software Module Selected</p>
          <p className="text-sm mt-1">Please select a software module to begin managing role permissions.</p>
        </div>
      ) : !selectedRole ? (
        <div className="bg-white p-12 text-center rounded-lg border border-gray-200 shadow-sm text-gray-500">
          <Shield className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-lg font-medium text-gray-900">No Role Selected</p>
          <p className="text-sm mt-1">Please select a role to view or assign its permissions.</p>
        </div>
      ) : loading ? (
        <div className="bg-white p-12 text-center rounded-lg border border-gray-200 shadow-sm text-gray-500 flex flex-col items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p>Loading permissions...</p>
        </div>
      ) : groupedPermissions.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-lg border border-gray-200 shadow-sm text-gray-500">
          <p className="text-lg font-medium text-gray-900">No Permissions Found</p>
          <p className="text-sm mt-1">There are no permissions seeded for this software module.</p>
        </div>
      ) : (
        <div className="space-y-6 pb-20">
          {!canAssign && (
            <div className="bg-blue-50 text-blue-800 p-4 rounded-lg border border-blue-200 mb-6 flex items-start">
              <Shield className="w-5 h-5 mr-3 mt-0.5 text-blue-500" />
              <div>
                <p className="font-semibold">View-Only Mode</p>
                <p className="text-sm mt-1">You do not have permission to assign or modify permissions. The matrix below is read-only.</p>
              </div>
            </div>
          )}

          {groupedPermissions.map((group: any, idx: any) => {
            const groupPermIds = group.permissions.map((p: any) => p.id);
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
                readOnly={!canAssign || saving}
              />
            );
          })}

          {canAssign && hasUnsavedChanges && (
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg flex justify-end px-8 z-50">
              <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
                <span className="text-orange-600 font-medium flex items-center">
                  <AlertTriangle className="w-5 h-5 mr-2" /> You have unsaved changes
                </span>
                <Button onClick={handleSave} isLoading={saving}>
                  <Save className="w-4 h-4 mr-2" /> Save Permissions
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RolePermissionMatrixPage;
