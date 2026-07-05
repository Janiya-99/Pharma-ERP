import React, { useState, useEffect } from "react";
import MultiSelect from "@/components/common/MultiSelect";
import { getRoles } from "@/api/controlApi";
import { Skeleton } from "@/components/ui/skeleton";

interface RoleAssignmentProps {
  selectedRoleIds: string[];
  onChange: (roleIds: string[]) => void;
  designationRoles?: string[]; // Roles suggested by the designation
}

export const RoleAssignment: React.FC<RoleAssignmentProps> = ({
  selectedRoleIds, onChange, designationRoles = []
}) => {
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRoles();
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

  const selectedRoles = roles.filter(r => selectedRoleIds.includes(String(r.id)));

  if (loading) return <Skeleton className="h-20 w-full rounded-xl" />;

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-bold text-[#052659] uppercase mb-1 block">Roles</label>
        <MultiSelect 
          options={roles}
          selectedValues={selectedRoles}
          onChange={(vals) => onChange(vals.map(v => String(v.id)))}
          placeholder="Select roles for this user..."
          displayKey="name"
        />
      </div>

      {designationRoles.length > 0 && (
        <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
          <p className="text-xs text-indigo-800 font-medium mb-2">Suggested by Designation:</p>
          <div className="flex flex-wrap gap-2">
            {designationRoles.map(rId => {
              const role = roles.find(r => String(r.id) === String(rId));
              if (!role) return null;
              const isSelected = selectedRoleIds.includes(String(role.id));
              return (
                <button
                  key={rId}
                  type="button"
                  onClick={() => {
                    if (isSelected) {
                      onChange(selectedRoleIds.filter(id => id !== String(role.id)));
                    } else {
                      onChange([...selectedRoleIds, String(role.id)]);
                    }
                  }}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                    isSelected 
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                      : 'bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                  }`}
                >
                  {role.name} {isSelected ? '✓' : '+'}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
