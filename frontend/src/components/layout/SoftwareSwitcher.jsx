import React, { useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { LayoutGrid, Loader2 } from "lucide-react";

const SoftwareSwitcher = () => {
  const { softwareModules, activeSoftware, switchActiveSoftware } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (!softwareModules || softwareModules.length === 0) return null;

  const handleChange = async (e) => {
    const softwareCode = e.target.value;
    const activeSoftwareCode = activeSoftware?.software_code || activeSoftware?.software?.software_code || "";
    if (softwareCode && softwareCode !== activeSoftwareCode) {
      setLoading(true);
      const success = await switchActiveSoftware(softwareCode);
      setLoading(false);

      if (success) {
        // Route to the dashboard of the newly selected software
        if (softwareCode === "FINANCE") navigate("/finance/dashboard");
        else if (softwareCode === "INVENTORY") navigate("/inventory/dashboard");
        else if (softwareCode === "INVOICE_CENTER") navigate("/invoice-center/dashboard");
        else if (softwareCode === "COMPLIANCE_CENTER") navigate("/compliance-center/dashboard");
        else if (softwareCode === "CONTROL_CENTER") navigate("/control-center/dashboard");
      }
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <LayoutGrid className="w-4 h-4 text-gray-500" />
      <div className="relative">
        <select
          value={activeSoftware?.software_code || activeSoftware?.software?.software_code || ""}
          onChange={handleChange}
          disabled={loading}
          className="appearance-none bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded-md focus:ring-blue-900 focus:border-blue-900 block w-full px-3 py-1.5 pr-8 transition-colors disabled:opacity-50"
        >
          {softwareModules.map((s) => {
            const code = s.software_code || s.software?.software_code || "";
            const name = s.software_name || s.software?.software_name || "";
            const key = s.software_id || s.id || code;
            return (
              <option key={key} value={code}>
                {name}
              </option>
            );
          })}
        </select>
        {loading && (
          <div className="absolute right-2 top-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-500" />
          </div>
        )}
      </div>
    </div>
  );
};

export default SoftwareSwitcher;
