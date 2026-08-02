import { useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  Loader2, 
  Landmark, 
  Package, 
  FileText, 
  ShieldCheck, 
  Settings, 
  LayoutGrid
} from "lucide-react";

const getModuleIcon = (code: string) => {
  switch (code) {
    case "FINANCE": return Landmark;
    case "INVENTORY": return Package;
    case "INVOICE_CENTER": return FileText;
    case "COMPLIANCE_CENTER": return ShieldCheck;
    case "CONTROL_CENTER": return Settings;
    default: return LayoutGrid;
  }
};

const ModuleIconSwitcher = () => {
  const { softwareModules, activeSoftware, switchActiveSoftware } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);
  const navigate = useNavigate();

  if (!softwareModules || softwareModules.length === 0) return null;

  const activeSoftwareCode = activeSoftware?.software_code || activeSoftware?.software?.software_code || "";

  const handleSwitch = async (value: string) => {
    if (value && value !== activeSoftwareCode) {
      setLoading(value);
      const success = await switchActiveSoftware(value);
      setLoading(null);

      if (success) {
        if (value === "FINANCE") navigate("/finance/dashboard");
        else if (value === "INVENTORY") navigate("/inventory/dashboard");
        else if (value === "INVOICE_CENTER") navigate("/invoice-center/dashboard");
        else if (value === "COMPLIANCE_CENTER") navigate("/compliance-center/dashboard");
        else if (value === "CONTROL_CENTER") navigate("/control-center/dashboard");
      }
    }
  };

  return (
    <div className="flex items-center gap-1 bg-white border border-gray-100 shadow-sm rounded-full p-1 mx-2">
      {[...softwareModules]
        .sort((a: any, b: any) => {
          const codeA = a.software_code || a.software?.software_code || "";
          const codeB = b.software_code || b.software?.software_code || "";
          const order = ["CONTROL_CENTER", "FINANCE", "INVENTORY", "INVOICE_CENTER", "COMPLIANCE_CENTER"];
          const indexA = order.indexOf(codeA);
          const indexB = order.indexOf(codeB);
          if (indexA !== -1 && indexB !== -1) return indexA - indexB;
          if (indexA !== -1) return -1;
          if (indexB !== -1) return 1;
          return 0;
        })
        .map((s: any) => {
        const code = s.software_code || s.software?.software_code || "";
        const name = s.software_name || s.software?.software_name || "";
        const key = s.software_id || s.id || code;
        const Icon = getModuleIcon(code);
        const isActive = code === activeSoftwareCode;
        const isLoading = loading === code;

        return (
          <button
            key={key}
            onClick={() => handleSwitch(code)}
            disabled={isLoading || isActive}
            className={`group relative flex items-center justify-center rounded-full transition-all duration-300 ease-out h-8 overflow-hidden
              ${isActive 
                ? "bg-[#4854CC] text-white" 
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              }
            `}
          >
            <div className="flex items-center justify-center min-w-[32px] px-1.5 h-full z-10">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Icon className="h-4 w-4 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
              )}
            </div>
            
            <div className={`transition-all duration-300 ease-out overflow-hidden flex items-center whitespace-nowrap
              ${isActive ? "max-w-[200px] opacity-100 pr-3" : "max-w-0 opacity-0 group-hover:max-w-[200px] group-hover:opacity-100 group-hover:pr-3"}
            `}>
              <span className="text-[12px] font-medium tracking-tight">
                {name}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ModuleIconSwitcher;
