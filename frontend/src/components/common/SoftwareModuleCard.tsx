import React from "react";
import {
  Shield,
  DollarSign,
  Package,
  FileText,
  CheckCircle,
} from "lucide-react";

export interface SoftwareModule {
  id: number | string;
  software_name: string;
  software_code?: string;
  description?: string;
}

interface SoftwareModuleCardProps {
  module: SoftwareModule;
  isSelected: boolean;
  isDefault?: boolean;
  onToggle: (module: SoftwareModule) => void;
  onSetDefault?: (module: SoftwareModule) => void;
}

const MODULE_ICONS: Record<string, React.ReactNode> = {
  control_center: <Shield className="h-5 w-5" />,
  finance: <DollarSign className="h-5 w-5" />,
  inventory: <Package className="h-5 w-5" />,
  invoice_center: <FileText className="h-5 w-5" />,
  compliance_center: <CheckCircle className="h-5 w-5" />,
};

const MODULE_DESCRIPTIONS: Record<string, string> = {
  control_center: "System administration, users, roles & settings",
  finance: "Financial management, accounting & banking",
  inventory: "Stock management, warehousing & transfers",
  invoice_center: "Sales orders, invoicing & receipts",
  compliance_center: "Regulatory, licensing & compliance tracking",
};

const SoftwareModuleCard = ({
  module,
  isSelected,
  isDefault,
  onToggle,
  onSetDefault,
}: SoftwareModuleCardProps) => {
  const code = module.software_code?.toLowerCase().replace(/[\s-]/g, "_") || "";
  const icon = MODULE_ICONS[code] || <Package className="h-5 w-5" />;
  const desc = module.description || MODULE_DESCRIPTIONS[code] || "Software module access";

  return (
    <div
      onClick={() => onToggle(module)}
      className={`module-card ${isSelected ? "module-card-active" : "module-card-inactive"}`}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl shrink-0 ${
            isSelected
              ? "bg-indigo-100 text-indigo-600"
              : "bg-gray-100 text-gray-400"
          }`}
        >
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4
              className={`text-sm font-semibold ${
                isSelected ? "text-indigo-800" : "text-gray-700"
              }`}
            >
              {module.software_name}
            </h4>
            {isDefault && (
              <span className="text-[10px] font-bold uppercase tracking-wide text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                Default
              </span>
            )}
          </div>
          <p className="text-[12px] text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
        </div>

        {/* Toggle */}
        <div className="shrink-0 pt-0.5">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggle(module);
            }}
            className={`toggle-switch ${isSelected ? "toggle-switch-on" : "toggle-switch-off"}`}
          >
            <span
              className={`toggle-switch-dot ${isSelected ? "toggle-switch-dot-on" : "toggle-switch-dot-off"}`}
            />
          </button>
        </div>
      </div>

      {/* Set as default */}
      {isSelected && onSetDefault && !isDefault && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onSetDefault(module);
          }}
          className="mt-3 text-[11px] text-indigo-500 hover:text-indigo-700 font-medium transition-colors"
        >
          Set as default module
        </button>
      )}
    </div>
  );
};

export default SoftwareModuleCard;
