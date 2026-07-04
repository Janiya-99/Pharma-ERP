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

const MODULE_UI_CONFIG: Record<
  string,
  {
    icon: React.ReactNode;
    glowColor: string;
    borderColor: string;
    iconBg: string;
    desc: string;
  }
> = {
  CONTROL_CENTER: {
    icon: <LayoutDashboard className="h-6 w-6 text-indigo-400 transition-transform group-hover:scale-110" />,
    glowColor: "hover:shadow-indigo-500/10 hover:border-indigo-500/40",
    borderColor: "border-white/10",
    iconBg: "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20",
    desc: "Centralized command for enterprise configuration. Manage organizational hierarchies and permissions.",
  },
  INVENTORY: {
    icon: <Package className="h-6 w-6 text-teal-400 transition-transform group-hover:scale-110" />,
    glowColor: "hover:shadow-teal-500/10 hover:border-teal-500/40",
    borderColor: "border-white/10",
    iconBg: "bg-teal-500/10 text-teal-400 border border-teal-500/20",
    desc: "Track stock levels, manage multi-warehouse logistics, and automate replenishment workflows.",
  },
  FINANCE: {
    icon: <Landmark className="h-6 w-6 text-emerald-400 transition-transform group-hover:scale-110" />,
    glowColor: "hover:shadow-emerald-500/10 hover:border-emerald-500/40",
    borderColor: "border-white/10",
    iconBg: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    desc: "Access general ledgers, reconcile accounts, and generate high-level financial forecasts.",
  },
  INVOICE_CENTER: {
    icon: <Receipt className="h-6 w-6 text-orange-400 transition-transform group-hover:scale-110" />,
    glowColor: "hover:shadow-orange-500/10 hover:border-orange-500/40",
    borderColor: "border-white/10",
    iconBg: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
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
    <div className="relative flex h-screen flex-col bg-gradient-to-br from-navy-900 via-slate-900 to-erp-950 text-white overflow-hidden">
      {/* Decorative ambient background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-25%] left-[-15%] w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[130px]" />
        <div className="absolute bottom-[-15%] right-[-15%] w-[600px] h-[600px] rounded-full bg-indigo-500/10 blur-[130px]" />
      </div>

      {/* Header */}
      <header className="relative flex h-20 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-6 md:px-12 z-10">
        <div className="flex items-center gap-4">
          {company?.logo_url ? (
            <div className="flex h-11 items-center justify-center p-1.5 bg-slate-50 rounded-xl border border-slate-200/80 shadow-sm">
              <img
                src={company.logo_url}
                alt={`${company?.name || "Company"} Logo`}
                className="h-full w-auto object-contain rounded-lg"
              />
            </div>
          ) : (
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md border border-blue-400/20">
              <Building className="h-5 w-5" />
            </div>
          )}
          <div>
            <h1 className="text-lg font-extrabold leading-tight text-slate-900 tracking-wide">
              {company?.name || "Company"}
            </h1>
            <p className="text-xs font-semibold text-slate-500">
              Welcome back, <span className="text-blue-600 font-bold">{user?.name || user?.full_name || "Admin"}</span>
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={logoutUser}
          className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm font-semibold"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </header>

      {/* Main Content */}
      <main className="relative flex flex-1 flex-col items-center justify-center p-6 md:p-8 z-10 overflow-hidden">
        <div className="mb-8 text-center animate-fade-up">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-semibold text-blue-300 mb-3">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
            Enterprise Hub
          </div>
          <h2 className="mb-2 text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-blue-200 sm:text-4xl md:text-4xl">
            Select a Workspace
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto font-medium leading-relaxed">
            Choose a software module to enter its specialized environment. Your permissions and access may vary per module.
          </p>
        </div>

        <div className="grid w-full max-w-4xl grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {softwareModules?.map((mod: any) => {
            const config = MODULE_UI_CONFIG[mod.software_code] || {
              icon: <LayoutDashboard className="h-6 w-6 text-slate-400 transition-transform group-hover:scale-110" />,
              glowColor: "hover:shadow-slate-500/10 hover:border-slate-500/40",
              borderColor: "border-white/10",
              iconBg: "bg-slate-500/10 text-slate-400 border border-slate-500/20",
              desc: mod.description || "Enter this module to manage related operations.",
            };
            const isSwitching = switching === mod.software_code;

            return (
              <div
                key={mod.software_code}
                onClick={() => !isSwitching && handleModuleClick(mod.software_code)}
                className={`group relative flex aspect-square cursor-pointer flex-col justify-between rounded-2xl border bg-slate-900/40 backdrop-blur-md p-5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl ${config.borderColor} ${config.glowColor} ${isSwitching ? "opacity-70 pointer-events-none" : ""}`}
              >
                <div>
                  <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${config.iconBg} shadow-inner transition-transform duration-300 group-hover:scale-105`}>
                    {config.icon}
                  </div>
                  <h3 className="mb-1 text-base font-bold text-white tracking-wide group-hover:text-blue-300 transition-colors line-clamp-1">
                    {mod.software_name}
                  </h3>
                  <p className="text-xs font-normal text-slate-300/80 leading-relaxed line-clamp-3 md:line-clamp-4">
                    {config.desc}
                  </p>
                </div>
                <div className="flex items-center text-xs font-semibold text-blue-400 group-hover:text-blue-300 transition-colors mt-auto">
                  <span>Enter</span>
                  <svg className="ml-1 h-3.5 w-3.5 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                {isSwitching && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-slate-950/80 backdrop-blur-sm">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative shrink-0 pb-6 text-center text-xs text-slate-500 z-10 mt-auto">
        <p>Developed by <span className="text-slate-400 font-semibold hover:text-blue-400 transition-colors cursor-default">Pixandco</span></p>
      </footer>
    </div>
  );
};

export default ModuleSelectionPage;
