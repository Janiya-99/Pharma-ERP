import React, { useState, useEffect } from "react";
import { getUserAccessPreview, getRoles, getRolePermissionMatrix } from "@/api/controlApi";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2, Shield, MapPin, ChevronDown,
  DollarSign, Package, FileText, Settings
} from "lucide-react";

// Software module icon & color mapping
const MODULE_CONFIG: Record<string, { icon: React.ReactNode; bg: string; text: string; border: string; badgeBg: string; badgeText: string }> = {
  "Finance": {
    icon: <DollarSign className="h-5 w-5" />,
    bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200",
    badgeBg: "bg-amber-100", badgeText: "text-amber-700"
  },
  "Inventory": {
    icon: <Package className="h-5 w-5" />,
    bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200",
    badgeBg: "bg-emerald-100", badgeText: "text-emerald-700"
  },
  "Invoice Center": {
    icon: <FileText className="h-5 w-5" />,
    bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200",
    badgeBg: "bg-blue-100", badgeText: "text-blue-700"
  },
  "Control Center": {
    icon: <Settings className="h-5 w-5" />,
    bg: "bg-violet-50", text: "text-violet-600", border: "border-violet-200",
    badgeBg: "bg-violet-100", badgeText: "text-violet-700"
  },
};

const getModuleConfig = (name: string) => {
  return MODULE_CONFIG[name] || {
    icon: <Shield className="h-5 w-5" />,
    bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200",
    badgeBg: "bg-slate-100", badgeText: "text-slate-700"
  };
};

interface ModulePermissions {
  moduleName: string;
  permissions: string[];
  count: number;
}

interface EffectiveAccessPreviewProps {
  userId?: string | number;
  roleIds?: string[];
  branchName?: string;
  previewData?: any;
}

export const EffectiveAccessPreview: React.FC<EffectiveAccessPreviewProps> = ({
  userId, roleIds = [], branchName = "Main Branch", previewData
}) => {
  const [modules, setModules] = useState<ModulePermissions[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (userId && !previewData) {
      fetchAccessPreview();
    } else if (previewData) {
      processPreviewData(previewData);
    } else if (roleIds.length > 0) {
      fetchFromRoles();
    } else {
      setModules([]);
    }
  }, [userId, roleIds?.join(","), previewData]);

  const fetchAccessPreview = async () => {
    try {
      setLoading(true);
      const res = await getUserAccessPreview(userId!);
      processPreviewData(res.data || res);
    } catch (err) {
      console.error("Failed to fetch access preview", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFromRoles = async () => {
    if (roleIds.length === 0) {
      setModules([]);
      return;
    }
    try {
      setLoading(true);
      // Fetch permissions for each role and merge
      const allPermissions: any[] = [];
      for (const roleId of roleIds) {
        try {
          const res = await getRolePermissionMatrix(roleId);
          const perms = Array.isArray(res?.data?.permissions) ? res.data.permissions : (Array.isArray(res?.data) ? res.data : []);
          allPermissions.push(...perms);
        } catch { /* skip if role fetch fails */ }
      }

      // Group by software module (resource)
      const moduleMap: Record<string, Set<string>> = {};
      allPermissions.forEach((p: any) => {
        const mod = p.software_name || p.resource || p.permission_group || "General";
        if (!moduleMap[mod]) moduleMap[mod] = new Set();
        const name = p.permission_name || p.action || p.name || p.permission_key || "";
        if (name) moduleMap[mod].add(name);
      });

      const result: ModulePermissions[] = Object.entries(moduleMap).map(([name, permsSet]) => ({
        moduleName: name,
        permissions: Array.from(permsSet),
        count: permsSet.size
      }));

      setModules(result.sort((a, b) => b.count - a.count));
    } catch (err) {
      console.error("Failed to compute access from roles", err);
    } finally {
      setLoading(false);
    }
  };

  const processPreviewData = (data: any) => {
    const permissions = data?.effective_permissions || [];
    const moduleMap: Record<string, Set<string>> = {};

    permissions.forEach((p: any) => {
      const mod = p.software_name || p.resource || "General";
      if (!moduleMap[mod]) moduleMap[mod] = new Set();
      const name = p.action || p.permission_name || p.name || "";
      if (name) moduleMap[mod].add(name);
    });

    const result: ModulePermissions[] = Object.entries(moduleMap).map(([name, permsSet]) => ({
      moduleName: name,
      permissions: Array.from(permsSet),
      count: permsSet.size
    }));

    setModules(result.sort((a, b) => b.count - a.count));
  };

  const toggleModuleExpand = (moduleName: string) => {
    setExpandedModules(prev => ({ ...prev, [moduleName]: !prev[moduleName] }));
  };

  if (loading) return <Skeleton className="h-60 w-full rounded-xl" />;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-green-50 rounded-lg border border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">Access Preview</h3>
          <p className="text-[10px] text-slate-400">Calculated based on selected roles.</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="flex items-center gap-1.5 text-[10px] font-semibold text-green-600">
          <span className="h-2 w-2 rounded-full bg-green-400" /> Active
        </span>
        <span className="flex items-center gap-1.5 text-[10px] font-semibold text-orange-500">
          <span className="h-2 w-2 rounded-full bg-orange-400" /> Inherited
        </span>
        <span className="flex items-center gap-1.5 text-[10px] font-semibold text-violet-600">
          <span className="h-2 w-2 rounded-full bg-violet-400" /> Branch Scoped
        </span>
      </div>

      {/* Module Cards */}
      {modules.length === 0 ? (
        <div className="text-center py-8 bg-slate-50 rounded-xl border border-slate-100">
          <Shield className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm text-slate-500 font-medium">No permissions found.</p>
          <p className="text-xs text-slate-400 mt-1">Ensure roles are assigned.</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
          {modules.map(mod => {
            const config = getModuleConfig(mod.moduleName);
            const isExpanded = expandedModules[mod.moduleName];
            const visiblePerms = isExpanded ? mod.permissions : mod.permissions.slice(0, 3);
            const remaining = mod.count - 3;

            return (
              <div key={mod.moduleName} className={`rounded-xl border ${config.border} overflow-hidden`}>
                {/* Module Header */}
                <div className={`flex items-center justify-between px-4 py-3 ${config.bg}`}>
                  <div className="flex items-center gap-2.5">
                    <div className={`${config.text}`}>{config.icon}</div>
                    <span className="text-sm font-bold text-slate-800">{mod.moduleName}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${config.badgeBg} ${config.badgeText}`}>
                    {mod.count} Permissions
                  </span>
                </div>

                {/* Permission List */}
                <div className="px-4 py-2 bg-white space-y-1">
                  {visiblePerms.map((perm, idx) => (
                    <div key={idx} className="flex items-center gap-2 py-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                      <span className="text-xs text-slate-600">{perm}</span>
                    </div>
                  ))}

                  {remaining > 0 && (
                    <button
                      type="button"
                      onClick={() => toggleModuleExpand(mod.moduleName)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1 py-1"
                    >
                      {isExpanded ? (
                        <>Show less</>
                      ) : (
                        <>+ {remaining} more permissions</>
                      )}
                      <ChevronDown className={`h-3 w-3 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Scope Footer */}
      {modules.length > 0 && (
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <MapPin className="h-3.5 w-3.5 text-violet-500 shrink-0" />
          <div>
            <span className="text-xs font-bold text-slate-700">Scope: {branchName}</span>
            <p className="text-[10px] text-slate-400">All permissions are limited to the selected branch.</p>
          </div>
        </div>
      )}
    </div>
  );
};
