import React, { useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { LayoutGrid, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const SoftwareSwitcher = () => {
  const { softwareModules, activeSoftware, switchActiveSoftware } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (!softwareModules || softwareModules.length === 0) return null;

  const activeSoftwareCode = activeSoftware?.software_code || activeSoftware?.software?.software_code || "";

  const handleChange = async (value) => {
    if (value && value !== activeSoftwareCode) {
      setLoading(true);
      const success = await switchActiveSoftware(value);
      setLoading(false);

      if (success) {
        // Route to the dashboard of the newly selected software
        if (value === "FINANCE") navigate("/finance/dashboard");
        else if (value === "INVENTORY") navigate("/inventory/dashboard");
        else if (value === "INVOICE_CENTER") navigate("/invoice-center/dashboard");
        else if (value === "COMPLIANCE_CENTER") navigate("/compliance-center/dashboard");
        else if (value === "CONTROL_CENTER") navigate("/control-center/dashboard");
      }
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <LayoutGrid className="w-4 h-4 text-gray-500" />
      <div className="relative">
        <Select
          value={activeSoftwareCode || ""}
          onValueChange={handleChange}
          disabled={loading}
        >
          <SelectTrigger className="w-[180px] bg-gray-50 dark:bg-navy-900 border-gray-300 dark:border-navy-700 text-gray-700 dark:text-gray-200 h-9 rounded-xl focus:ring-brand-500 focus:border-brand-500">
            <SelectValue placeholder="Select Module" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 z-50">
            {softwareModules.map((s) => {
              const code = s.software_code || s.software?.software_code || "";
              const name = s.software_name || s.software?.software_name || "";
              const key = s.software_id || s.id || code;
              return (
                <SelectItem key={key} value={code} className="dark:text-gray-200">
                  {name}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        {loading && (
          <div className="absolute right-8 top-2.5">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-500" />
          </div>
        )}
      </div>
    </div>
  );
};

export default SoftwareSwitcher;
