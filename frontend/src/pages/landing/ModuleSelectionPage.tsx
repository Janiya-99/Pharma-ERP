import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import {
  LayoutDashboard,
  Package,
  Landmark,
  Receipt,
  LogOut,
  Building,
} from "lucide-react";
import { Button } from "../../components/ui/button";

const MODULE_UI_CONFIG: Record<string, { icon: React.ReactNode; color: string; desc: string }> = {
  CONTROL_CENTER: {
    icon: <LayoutDashboard className="h-10 w-10 text-indigo-500" />,
    color: "bg-indigo-50 border-indigo-200 hover:border-indigo-400 shadow-indigo-100",
    desc: "Centralized command for enterprise configuration. Manage organizational hierarchies and permissions.",
  },
  INVENTORY: {
    icon: <Package className="h-10 w-10 text-teal-500" />,
    color: "bg-teal-50 border-teal-200 hover:border-teal-400 shadow-teal-100",
    desc: "Track stock levels, manage multi-warehouse logistics, and automate replenishment workflows.",
  },
  FINANCE: {
    icon: <Landmark className="h-10 w-10 text-emerald-500" />,
    color: "bg-emerald-50 border-emerald-200 hover:border-emerald-400 shadow-emerald-100",
    desc: "Access general ledgers, reconcile accounts, and generate high-level financial forecasts.",
  },
  INVOICE_CENTER: {
    icon: <Receipt className="h-10 w-10 text-orange-500" />,
    color: "bg-orange-50 border-orange-200 hover:border-orange-400 shadow-orange-100",
    desc: "Process AP/AR documentation, manage vendor billing cycles, and automate payment approvals.",
  },
};

const ModuleSelectionPage = () => {
  const { user, company, softwareModules, logoutUser, switchActiveSoftware } = useAuth();
  const navigate = useNavigate();
  const [switching, setSwitching] = useState<string | null>(null);

  const handleModuleClick = async (moduleCode: string) => {
    setSwitching(moduleCode);
    const success = await switchActiveSoftware(moduleCode);
    if (success) {
      navigate(`/${moduleCode.toLowerCase().replace(/_/g, "-")}/dashboard`);
    } else {
      setSwitching(null);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white shadow-md">
            <Building className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold leading-tight text-slate-900">{company?.name || "Company"}</h1>
            <p className="text-xs font-medium text-slate-500">Welcome back, {user?.name || user?.full_name}</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={logoutUser} className="text-slate-600">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center justify-center p-6 md:p-12">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-4xl font-extrabold tracking-tight text-slate-900">
            Select a Workspace
          </h2>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            Choose a software module to enter its specialized environment. Your permissions and access may vary per module.
          </p>
        </div>

        <div className="grid w-full max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {softwareModules?.map((mod: any) => {
            const config = MODULE_UI_CONFIG[mod.software_code] || {
              icon: <LayoutDashboard className="h-10 w-10 text-slate-500" />,
              color: "bg-white border-slate-200 hover:border-slate-400 shadow-slate-100",
              desc: mod.description || "Enter this module to manage related operations.",
            };
            const isSwitching = switching === mod.software_code;

            return (
              <div
                key={mod.software_code}
                onClick={() => !isSwitching && handleModuleClick(mod.software_code)}
                className={`group relative flex cursor-pointer flex-col rounded-2xl border-2 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${config.color} ${isSwitching ? "opacity-70 pointer-events-none" : ""}`}
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm transition-transform duration-300 group-hover:scale-110">
                  {config.icon}
                </div>
                <h3 className="mb-2 text-xl font-bold text-slate-900">
                  {mod.software_name}
                </h3>
                <p className="text-sm font-medium text-slate-600 line-clamp-3">
                  {config.desc}
                </p>
                {isSwitching && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/60 backdrop-blur-sm">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default ModuleSelectionPage;
