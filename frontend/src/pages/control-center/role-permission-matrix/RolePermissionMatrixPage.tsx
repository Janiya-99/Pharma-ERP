import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getPermissionsGrouped,
  getRolePermissionMatrix,
  assignRolePermissions,
} from "../../../api/controlApi";
import { useAuth } from "../../../auth/AuthContext";
import PageHeader from "../../../components/common/PageHeader";
import Button from "../../../components/common/Button";
import FormError from "../../../components/common/FormError";
import SoftwareSelector from "../../../components/common/SoftwareSelector";
import RoleSelector from "../../../components/common/RoleSelector";
import PermissionCheckboxGroup from "../../../components/common/PermissionCheckboxGroup";
import PermissionGuard from "../../../auth/PermissionGuard";
import {
  Save,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Shield,
} from "lucide-react";

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
      !assignedPermissionIds.every((id: string | number) =>
        initialAssignedIds.includes(id)
      ) ||
      !initialAssignedIds.every((id: string | number) =>
        assignedPermissionIds.includes(id)
      );

    setHasUnsavedChanges(isDifferent);
  }, [assignedPermissionIds, initialAssignedIds]);

  const fetchGroupedPermissions = async (softwareId: string | number) => {
    try {
      setLoading(true);
      setError(null);
      const res = await getPermissionsGrouped({
        software_id: softwareId,
        limit: 1000,
      });
      if (res.success) {
        const data = res.data || [];
        const groups =
          Array.isArray(data) &&
          data.length > 0 &&
          Array.isArray((data[0] as any)?.groups)
            ? (data[0] as any).groups
            : Array.isArray(data)
            ? data
            : [];
        setGroupedPermissions(groups);
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Failed to load permissions for software"
      );
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
        const perms = Array.isArray(res.data.permissions)
          ? res.data.permissions
          : Array.isArray(res.data)
          ? res.data
          : [];
        const ids = perms.map((p: any) => p.id);
        setAssignedPermissionIds(ids);
        setInitialAssignedIds(ids);
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message || "Failed to load role permissions"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGroupSelectionChange = (groupIds: any, groupName: any) => {
    const groupPermIds =
      groupedPermissions
        .find((g: any) => g.permission_group === groupName)
        ?.permissions.map((p: any) => p.id) || [];

    // Remove old ids for this group
    let newSelection = assignedPermissionIds.filter(
      (id: string | number) => !groupPermIds.includes(id)
    );
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
    <div className="mx-auto max-w-7xl p-6">
      <PageHeader
        title="Role Permission Matrix"
        description="Manage the exact permissions assigned to each role across software modules."
      />

      <FormError message={error} />
      {successMsg && (
        <div className="mb-6 flex items-center rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
          {successMsg}
        </div>
      )}

      {/* Top Filter Bar */}
      <div className="mb-6 flex flex-col items-end justify-between gap-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm md:flex-row">
        <div className="flex w-full flex-col gap-4 md:w-auto md:flex-row">
          <div className="w-full md:w-64">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              1. Select Software Module
            </label>
            <SoftwareSelector
              value={selectedSoftware}
              onChange={setSelectedSoftware}
            />
          </div>
          <div className="w-full md:w-64">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              2. Select Role
            </label>
            <RoleSelector
              softwareId={selectedSoftware}
              value={selectedRole}
              onChange={setSelectedRole}
              disabled={!selectedSoftware}
            />
          </div>
        </div>

        {selectedRole && canAssign && (
          <div className="flex w-full items-center justify-end gap-3 md:w-auto">
            {hasUnsavedChanges && (
              <span className="flex items-center rounded border border-orange-200 bg-orange-50 px-3 py-1.5 text-sm font-medium text-orange-600">
                <AlertTriangle className="mr-1.5 h-4 w-4" /> Unsaved changes
              </span>
            )}
            <Button
              onClick={handleSave}
              isLoading={saving}
              disabled={!hasUnsavedChanges}
            >
              <Save className="mr-2 h-4 w-4" /> Save Permissions
            </Button>
          </div>
        )}
      </div>

      {/* Main Area */}
      {!selectedSoftware ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center text-gray-500 shadow-sm">
          <Layers className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <p className="text-lg font-medium text-gray-900">
            No Software Module Selected
          </p>
          <p className="mt-1 text-sm">
            Please select a software module to begin managing role permissions.
          </p>
        </div>
      ) : !selectedRole ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center text-gray-500 shadow-sm">
          <Shield className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <p className="text-lg font-medium text-gray-900">No Role Selected</p>
          <p className="mt-1 text-sm">
            Please select a role to view or assign its permissions.
          </p>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center rounded-lg border border-gray-200 bg-white p-12 text-center text-gray-500 shadow-sm">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p>Loading permissions...</p>
        </div>
      ) : groupedPermissions.length === 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center text-gray-500 shadow-sm">
          <p className="text-lg font-medium text-gray-900">
            No Permissions Found
          </p>
          <p className="mt-1 text-sm">
            There are no permissions seeded for this software module.
          </p>
        </div>
      ) : (
        <div className="space-y-6 pb-20">
          {!canAssign && (
            <div className="mb-6 flex items-start rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-800">
              <Shield className="mr-3 mt-0.5 h-5 w-5 text-blue-500" />
              <div>
                <p className="font-semibold">View-Only Mode</p>
                <p className="mt-1 text-sm">
                  You do not have permission to assign or modify permissions.
                  The matrix below is read-only.
                </p>
              </div>
            </div>
          )}

          {groupedPermissions.map((group: any, idx: any) => {
            const groupPermIds = group.permissions.map((p: any) => p.id);
            const selectedInGroup = assignedPermissionIds.filter((id: any) =>
              groupPermIds.includes(id)
            );

            return (
              <PermissionCheckboxGroup
                key={idx}
                groupName={group.permission_group}
                permissions={group.permissions}
                selectedIds={selectedInGroup}
                onSelectionChange={(newSelectedInGroup: any) =>
                  handleGroupSelectionChange(
                    newSelectedInGroup,
                    group.permission_group
                  )
                }
                readOnly={!canAssign || saving}
              />
            );
          })}

          {canAssign && hasUnsavedChanges && (
            <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-end border-t border-gray-200 bg-white p-4 px-8 shadow-lg">
              <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
                <span className="flex items-center font-medium text-orange-600">
                  <AlertTriangle className="mr-2 h-5 w-5" /> You have unsaved
                  changes
                </span>
                <Button onClick={handleSave} isLoading={saving}>
                  <Save className="mr-2 h-4 w-4" /> Save Permissions
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
