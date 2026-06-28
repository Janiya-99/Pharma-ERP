import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, ShieldCheck, Key, Check } from "lucide-react";
import Select from "../../../../components/common/Select";
import {
  getRolesBySoftware,
  getSoftwareModules,
  getRolePermissionMatrix,
} from "../../../../api/controlApi";

interface StepRolesPermissionsProps {
  formData: any;
  onChange: (field: string, value: any) => void;
}

interface ModuleRoleData {
  moduleId: string | number;
  moduleName: string;
  roles: any[];
  selectedRoleId: string | number | null;
  permissions: any[];
  permissionCount: number;
  loading: boolean;
  expanded: boolean;
}

const StepRolesPermissions = ({
  formData,
  onChange,
}: StepRolesPermissionsProps) => {
  const [moduleRoleData, setModuleRoleData] = useState<ModuleRoleData[]>([]);
  const [allModules, setAllModules] = useState<any[]>([]);
  const [loadingModules, setLoadingModules] = useState(true);

  const selectedModuleIds: (string | number)[] =
    formData.software_modules || [];
  const roleAssignments: Record<string, any> = formData.role_assignments || {};

  useEffect(() => {
    fetchModulesAndRoles();
  }, [selectedModuleIds.length]);

  const fetchModulesAndRoles = async () => {
    try {
      setLoadingModules(true);
      const modulesRes = await getSoftwareModules();
      const modules = (modulesRes.data?.items || modulesRes.data || []).filter(
        (m: any) => selectedModuleIds.includes(m.id)
      );
      setAllModules(modules);

      // Fetch roles for each selected module
      const data: ModuleRoleData[] = await Promise.all(
        modules.map(async (mod: any) => {
          try {
            const rolesRes = await getRolesBySoftware(mod.id);
            const roles = rolesRes.data?.items || rolesRes.data || [];
            const existingAssignment = roleAssignments[String(mod.id)];
            return {
              moduleId: mod.id,
              moduleName: mod.software_name,
              roles,
              selectedRoleId: existingAssignment?.role_id || null,
              permissions: existingAssignment?.permissions || [],
              permissionCount: existingAssignment?.permissionCount || 0,
              loading: false,
              expanded: false,
            };
          } catch {
            return {
              moduleId: mod.id,
              moduleName: mod.software_name,
              roles: [],
              selectedRoleId: null,
              permissions: [],
              permissionCount: 0,
              loading: false,
              expanded: false,
            };
          }
        })
      );

      setModuleRoleData(data);
    } catch (err) {
      console.error("Failed to load roles", err);
    } finally {
      setLoadingModules(false);
    }
  };

  const handleRoleChange = async (
    moduleId: string | number,
    roleId: string | number
  ) => {
    // Fetch permissions for selected role
    let permissions: any[] = [];
    let permissionCount = 0;
    try {
      const res = await getRolePermissionMatrix(roleId);
      if (res.success) {
        permissions = res.data?.permissions || [];
        permissionCount = permissions.length;
      }
    } catch {
      // silently continue
    }

    // Update local state
    setModuleRoleData((prev) =>
      prev.map((item) =>
        item.moduleId === moduleId
          ? { ...item, selectedRoleId: roleId, permissions, permissionCount }
          : item
      )
    );

    // Update form data
    const updated = {
      ...roleAssignments,
      [String(moduleId)]: {
        role_id: roleId,
        permissions,
        permissionCount,
      },
    };
    onChange("role_assignments", updated);
  };

  const toggleExpanded = (moduleId: string | number) => {
    setModuleRoleData((prev) =>
      prev.map((item) =>
        item.moduleId === moduleId
          ? { ...item, expanded: !item.expanded }
          : item
      )
    );
  };

  if (selectedModuleIds.length === 0) {
    return (
      <div className="card-premium">
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <ShieldCheck className="h-10 w-10 text-gray-300" />
          <p className="text-sm font-semibold text-gray-700">
            No Software Modules Selected
          </p>
          <p className="max-w-sm text-center text-xs text-gray-400">
            Go back to Step 3 and select at least one software module to assign
            roles and permissions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-premium">
      <div className="card-premium-header">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Roles & Permissions
          </h3>
          <p className="mt-0.5 text-xs text-gray-500">
            Assign a role for each software module the user has access to
          </p>
        </div>
      </div>

      <div className="card-premium-body space-y-4">
        {loadingModules ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
          </div>
        ) : (
          moduleRoleData.map((item) => {
            const selectedRole = item.roles.find(
              (r: any) => r.id === item.selectedRoleId
            );
            return (
              <div
                key={item.moduleId}
                className="overflow-hidden rounded-xl border border-gray-200"
              >
                {/* Module Header */}
                <div
                  className="flex cursor-pointer items-center justify-between bg-gray-50/60 px-5 py-4 transition-colors hover:bg-gray-50"
                  onClick={() => toggleExpanded(item.moduleId)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800">
                        {item.moduleName}
                      </h4>
                      <div className="mt-0.5 flex items-center gap-2">
                        {selectedRole ? (
                          <>
                            <span className="text-[11px] font-medium text-indigo-600">
                              {selectedRole.role_name || selectedRole.name}
                            </span>
                            <span className="text-[10px] text-gray-400">•</span>
                            <span className="text-[11px] text-gray-400">
                              {item.permissionCount} permissions
                            </span>
                          </>
                        ) : (
                          <span className="text-[11px] font-medium text-amber-500">
                            No role assigned
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {item.expanded ? (
                    <ChevronUp className="h-4 w-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  )}
                </div>

                {/* Expanded Content */}
                {item.expanded && (
                  <div className="space-y-4 border-t border-gray-100 px-5 py-4">
                    {/* Role selector */}
                    <div className="max-w-sm">
                      <Select
                        label="Assign Role"
                        name={`role_${item.moduleId}`}
                        value={item.selectedRoleId || ""}
                        onChange={(e: any) =>
                          handleRoleChange(item.moduleId, e.target.value)
                        }
                        searchable={true}
                        placeholder="Select a role"
                        options={item.roles.map((r: any) => ({
                          value: r.id,
                          label: r.role_name || r.name,
                        }))}
                      />
                    </div>

                    {/* Permission Preview */}
                    {item.permissions.length > 0 && (
                      <div>
                        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                          <Key className="h-3 w-3" />
                          Permission Preview
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {item.permissions
                            .slice(0, 12)
                            .map((p: any, idx: number) => (
                              <span
                                key={idx}
                                className="bg-emerald-50 text-emerald-700 border-emerald-100 inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-medium"
                              >
                                <Check className="h-2.5 w-2.5" />
                                {p.permission_code || p.name || p}
                              </span>
                            ))}
                          {item.permissions.length > 12 && (
                            <span className="px-2 py-0.5 text-[10px] text-gray-400">
                              +{item.permissions.length - 12} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StepRolesPermissions;
