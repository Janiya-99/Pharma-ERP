import React, { useState, useEffect, useRef } from "react";
import { getRoles, getDesignationDefaultRoles } from "@/api/controlApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import {
  Search, X, Plus, ChevronDown, ChevronRight, GripVertical,
  Shield, ShieldCheck, Info, ExternalLink, Sparkles
} from "lucide-react";

interface RoleData {
  id: number;
  role_name?: string;
  name?: string;
  description?: string;
  role_code?: string;
  software_id?: number;
  software_name?: string;
  is_system?: boolean;
  permission_count?: number;
}

interface RoleAssignmentProps {
  selectedRoleIds: string[];
  onChange: (roleIds: string[]) => void;
  designationId?: string;
  branchName?: string;
}

// Color map for software module icons
const SOFTWARE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "Finance": { bg: "bg-amber-50", text: "text-amber-600", border: "border-amber-200" },
  "Inventory": { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-200" },
  "Invoice Center": { bg: "bg-blue-50", text: "text-blue-600", border: "border-blue-200" },
  "Control Center": { bg: "bg-violet-50", text: "text-violet-600", border: "border-violet-200" },
  "default": { bg: "bg-slate-50", text: "text-slate-600", border: "border-slate-200" },
};

const getColorForSoftware = (name?: string) => {
  if (!name) return SOFTWARE_COLORS["default"];
  return SOFTWARE_COLORS[name] || SOFTWARE_COLORS["default"];
};

export const RoleAssignment: React.FC<RoleAssignmentProps> = ({
  selectedRoleIds, onChange, designationId, branchName = "Main Branch"
}) => {
  const [roles, setRoles] = useState<RoleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [designationRoleIds, setDesignationRoleIds] = useState<string[]>([]);
  const [showSuggested, setShowSuggested] = useState(true);

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchRoles();
  }, []);

  useEffect(() => {
    if (designationId) {
      fetchDesignationRoles(designationId);
    } else {
      setDesignationRoleIds([]);
    }
  }, [designationId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await getRoles({ limit: 200 });
      const raw = res?.data?.items || res?.data || (Array.isArray(res) ? res : []);
      const items = raw.map((r: any) => ({
        ...r,
        name: r.role_name || r.name || "Unnamed Role"
      }));
      setRoles(items);
    } catch (err) {
      console.error("Failed to fetch roles", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDesignationRoles = async (desigId: string) => {
    try {
      const res = await getDesignationDefaultRoles(desigId);
      const data = res?.data || res || [];
      const ids = Array.isArray(data) ? data.map((r: any) => String(r.id || r.role_id)) : [];
      setDesignationRoleIds(ids);
    } catch (err) {
      console.error("Failed to fetch designation default roles", err);
      setDesignationRoleIds([]);
    }
  };

  const selectedRoles = roles.filter(r => selectedRoleIds.includes(String(r.id)));

  const toggleRole = (roleId: string) => {
    if (selectedRoleIds.includes(roleId)) {
      onChange(selectedRoleIds.filter(id => id !== roleId));
    } else {
      onChange([...selectedRoleIds, roleId]);
    }
  };

  const removeRole = (roleId: string) => {
    onChange(selectedRoleIds.filter(id => id !== roleId));
  };

  const filteredDropdownRoles = roles.filter(r =>
    (r.name || r.role_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.role_code || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Suggested roles = designation roles that are NOT already selected
  const suggestedRoles = roles.filter(
    r => designationRoleIds.includes(String(r.id)) && !selectedRoleIds.includes(String(r.id))
  );

  if (loading) return <Skeleton className="h-40 w-full rounded-xl" />;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
          System Role Assignments
        </h3>
        <Link
          to="/control-center/roles-permissions?tab=roles"
          className="text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors flex items-center gap-1"
        >
          View All Roles <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Search & Multi-select */}
      <div ref={wrapperRef} className="relative">
        <div
          className="min-h-[44px] w-full flex flex-wrap items-center gap-2 px-3 py-2 border border-slate-200 rounded-xl bg-white shadow-sm cursor-text transition-all duration-200 focus-within:ring-2 focus-within:ring-indigo-500/30 focus-within:border-indigo-400"
          onClick={() => setIsDropdownOpen(true)}
        >
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          {selectedRoles.length === 0 && !searchTerm && (
            <span className="text-slate-400 text-sm select-none">Search roles by name, keyword or permission...</span>
          )}

          {selectedRoles.map(role => {
            const colors = getColorForSoftware(role.software_name);
            return (
              <span
                key={role.id}
                className={`inline-flex items-center gap-1.5 pl-2 pr-1.5 py-1 rounded-lg text-xs font-semibold ${colors.bg} ${colors.text} border ${colors.border}`}
              >
                <ShieldCheck className="h-3 w-3" />
                {role.name || role.role_name}
                <button
                  type="button"
                  className="hover:bg-black/10 rounded-full p-0.5 transition-colors"
                  onClick={(e) => { e.stopPropagation(); removeRole(String(role.id)); }}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            );
          })}

          <input
            type="text"
            className="flex-1 min-w-[80px] bg-transparent outline-none border-none p-0 text-sm focus:ring-0 text-slate-700 placeholder:text-slate-400"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setIsDropdownOpen(true); }}
            onClick={() => setIsDropdownOpen(true)}
          />

          <ChevronDown className={`h-4 w-4 text-slate-400 shrink-0 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
        </div>

        {isDropdownOpen && (
          <div className="absolute z-50 mt-1 w-full bg-white shadow-xl max-h-64 rounded-xl py-1 border border-slate-200 overflow-auto">
            {filteredDropdownRoles.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-500 text-center">No roles found matching your search.</div>
            ) : (
              filteredDropdownRoles.map(role => {
                const isSelected = selectedRoleIds.includes(String(role.id));
                const colors = getColorForSoftware(role.software_name);
                return (
                  <div
                    key={role.id}
                    className={`cursor-pointer select-none px-4 py-2.5 flex items-center gap-3 transition-colors ${isSelected ? "bg-indigo-50/60" : "hover:bg-slate-50"}`}
                    onClick={() => toggleRole(String(role.id))}
                  >
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${colors.bg} ${colors.text} border ${colors.border}`}>
                      <Shield className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold text-slate-800 truncate">{role.name || role.role_name}</div>
                      {role.description && (
                        <div className="text-xs text-slate-400 truncate mt-0.5">{role.description}</div>
                      )}
                    </div>
                    {role.is_system && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200 uppercase tracking-wider shrink-0">System</span>
                    )}
                    {isSelected && (
                      <div className="h-5 w-5 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Suggested Roles from Designation */}
      {designationId && suggestedRoles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              Suggested Roles from Designation
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            </h4>
          </div>

          <div className="flex flex-wrap gap-3">
            {(showSuggested ? suggestedRoles.slice(0, 4) : suggestedRoles).map(role => {
              const colors = getColorForSoftware(role.software_name);
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => toggleRole(String(role.id))}
                  className="group flex items-start gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all duration-200 text-left w-[calc(50%-0.375rem)] min-w-[200px]"
                >
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${colors.bg} ${colors.text} border ${colors.border}`}>
                    <Shield className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-800 truncate">{role.name || role.role_name}</span>
                      <span className="h-5 w-5 rounded-full bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center shrink-0 transition-colors">
                        <Plus className="h-3 w-3 text-slate-500 group-hover:text-indigo-600 transition-colors" />
                      </span>
                    </div>
                    {role.description && (
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{role.description}</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5" />
              These roles are recommended based on the selected designation.
            </p>
            {suggestedRoles.length > 4 && (
              <button
                type="button"
                onClick={() => setShowSuggested(!showSuggested)}
                className="text-xs font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
              >
                {showSuggested ? "Show More" : "Show Less"}
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${!showSuggested ? "rotate-180" : ""}`} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Selected Roles List */}
      {selectedRoles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900">
              Selected Roles <span className="text-slate-400 font-semibold">({selectedRoles.length})</span>
            </h4>
            <p className="text-xs text-slate-400">These roles will be assigned to the user.</p>
          </div>

          <div className="space-y-2">
            {selectedRoles.map(role => {
              const colors = getColorForSoftware(role.software_name);
              const isInherited = designationRoleIds.includes(String(role.id));
              return (
                <div
                  key={role.id}
                  className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors group"
                >
                  <GripVertical className="h-4 w-4 text-slate-300 shrink-0 cursor-grab" />
                  <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${colors.bg} ${colors.text} border ${colors.border}`}>
                    <Shield className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-slate-800 truncate">{role.name || role.role_name}</div>
                    {role.description && (
                      <div className="text-xs text-slate-400 truncate mt-0.5">{role.description}</div>
                    )}
                  </div>

                  {/* Metadata badges */}
                  <div className="flex items-center gap-2 shrink-0">
                    {role.permission_count != null && (
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Shield className="h-3 w-3" />
                        {role.permission_count} Permissions
                      </span>
                    )}
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {branchName}
                    </span>
                    {isInherited ? (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-orange-50 text-orange-600 border border-orange-200 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-orange-400" /> Inherited
                      </span>
                    ) : (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-200 flex items-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-green-400" /> Active
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeRole(String(role.id))}
                      className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer note */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
        <p className="text-xs text-slate-400 flex items-center gap-1.5">
          <Info className="h-3.5 w-3.5" />
          Roles are additive. The user will have the combined permissions of all assigned roles.
        </p>
        <Link
          to="/control-center/roles-permissions?tab=roles"
          className="text-xs font-semibold text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
        >
          Learn more about roles <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
};
