import React, { useState, useEffect } from "react";
import { Boxes } from "lucide-react";
import SoftwareModuleCard from "../../../../components/common/SoftwareModuleCard";
import { getSoftwareModules } from "../../../../api/controlApi";

interface StepSoftwareAccessProps {
  formData: any;
  onChange: (field: string, value: any) => void;
}

const StepSoftwareAccess = ({ formData, onChange }: StepSoftwareAccessProps) => {
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const res = await getSoftwareModules();
      if (res.success) {
        setModules(res.data.items || res.data || []);
      }
    } catch (err) {
      console.error("Failed to load software modules", err);
    } finally {
      setLoading(false);
    }
  };

  const selectedModuleIds: (string | number)[] = formData.software_modules || [];

  const toggleModule = (mod: any) => {
    const isSelected = selectedModuleIds.includes(mod.id);
    let updated: (string | number)[];
    if (isSelected) {
      updated = selectedModuleIds.filter((id) => id !== mod.id);
      // Clear default if unselecting it
      if (formData.default_software_id === mod.id) {
        onChange("default_software_id", updated.length > 0 ? updated[0] : "");
      }
    } else {
      updated = [...selectedModuleIds, mod.id];
      if (updated.length === 1) {
        onChange("default_software_id", mod.id);
      }
    }
    onChange("software_modules", updated);
  };

  const setDefault = (mod: any) => {
    onChange("default_software_id", mod.id);
  };

  return (
    <div className="card-premium">
      <div className="card-premium-header">
        <div>
          <h3 className="text-base font-semibold text-gray-900">Software Access</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            Select which software modules this user can access
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">
            {selectedModuleIds.length} module{selectedModuleIds.length !== 1 ? "s" : ""} selected
          </span>
        </div>
      </div>

      <div className="card-premium-body">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
          </div>
        ) : modules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <Boxes className="h-8 w-8 text-gray-300" />
            <p className="text-sm text-gray-500">No software modules configured</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {modules.map((mod) => (
              <SoftwareModuleCard
                key={mod.id}
                module={mod}
                isSelected={selectedModuleIds.includes(mod.id)}
                isDefault={formData.default_software_id === mod.id}
                onToggle={toggleModule}
                onSetDefault={setDefault}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StepSoftwareAccess;
