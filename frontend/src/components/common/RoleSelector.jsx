import React, { useState, useEffect } from "react";
import { getRolesBySoftware } from "../../api/controlApi";
import Select from "./Select";

const RoleSelector = ({ softwareId, value, onChange, disabled = false, required = false, className = "" }) => {
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

  const fetchRoles = async (sId) => {
    try {
      setLoading(true);
      const res = await getRolesBySoftware(sId);
      if (res.success) {
        setRoles(res.data || []);
      }
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
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled || loading || !softwareId}
      required={required}
      className={className}
      placeholder={loading ? "Loading roles..." : "Select Role"}
      options={roles.map((r) => ({
        value: r.id,
        label: `${r.role_name} ${r.is_system ? "(System)" : ""}`,
      }))}
    />
  );
};

export default RoleSelector;
