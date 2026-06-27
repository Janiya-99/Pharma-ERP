import React, { useState, useEffect } from "react";
import { getRolesBySoftware } from "../../api/controlApi";
import Select from "./Select";

const RoleSelector = ({ softwareId, value, onChange, disabled = false, required = false, className = "" }: { softwareId?: string | number; value?: unknown; onChange?: unknown; disabled?: unknown; required?: unknown; className?: unknown }) => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (softwareId) {
      fetchRoles(softwareId);
    } else {
      setRoles([]);
      onChange(""); // Clear selection if software is unselected
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [softwareId]);

  const fetchRoles = async (sId: string | number) => {
    try {
      setLoading(true);
      const res = await getRolesBySoftware(sId);
      let combined = res.success ? (res.data || []) : [];
      
      // Control Center is module ID 1. If we are on another module, also fetch control center roles as global options
      if (String(sId) !== "1") {
        const ccRes = await getRolesBySoftware(1);
        if (ccRes.success && ccRes.data) {
          const seen = new Set(combined.map((r: any) => r.id));
          ccRes.data.forEach((r: any) => {
            if (!seen.has(r.id)) {
              combined.push(r);
            }
          });
        }
      }
      setRoles(combined);
    } catch (err) {
      console.error("Failed to fetch roles", err);
      setRoles([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Select
      name="role_id"
      value={value}
      onChange={(e: any) => onChange(e.target.value)}
      disabled={disabled || loading || !softwareId}
      required={required}
      className={className}
      placeholder={loading ? "Loading roles..." : "Select Role"}
      options={roles.map((r: unknown) => ({
        value: r.id,
        label: `${r.role_name} ${r.is_system ? "(System)" : ""}`,
      }))}
    />
  );
};

export default RoleSelector;
