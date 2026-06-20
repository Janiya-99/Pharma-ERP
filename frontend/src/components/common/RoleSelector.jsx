import React, { useState, useEffect } from "react";
import { getRolesBySoftware } from "../../api/controlApi";
import { Loader2 } from "lucide-react";

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
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || loading || !softwareId}
        required={required}
        className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 disabled:bg-gray-100 disabled:text-gray-500 transition-colors appearance-none pr-10"
      >
        <option value="">Select Role</option>
        {roles.map((r) => (
          <option key={r.id} value={r.id}>
            {r.role_name} {r.is_system ? "(System)" : ""}
          </option>
        ))}
      </select>
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        ) : (
          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        )}
      </div>
    </div>
  );
};

export default RoleSelector;
