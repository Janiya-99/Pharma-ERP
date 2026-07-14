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
    icon: <LayoutDashboard className="h-7 w-7 text-indigo-600 transition-transform group-hover:scale-110 group-hover:rotate-3" />,
    glowColor: "hover:shadow-[0_20px_60px_-15px_rgba(79,70,229,0.3)] hover:border-indigo-200",
    borderColor: "border-slate-200/60",
    iconBg: "bg-indigo-50 text-indigo-600 border border-indigo-100/50",
    desc: "Centralized command for enterprise configuration. Manage organizational hierarchies, roles, and permissions.",
  },
  INVENTORY: {
    icon: <Package className="h-7 w-7 text-teal-600 transition-transform group-hover:scale-110 group-hover:rotate-3" />,
    glowColor: "hover:shadow-[0_20px_60px_-15px_rgba(13,148,136,0.3)] hover:border-teal-200",
    borderColor: "border-slate-200/60",
    iconBg: "bg-teal-50 text-teal-600 border border-teal-100/50",
    desc: "Track stock levels, manage multi-warehouse logistics, and automate replenishment workflows in real-time.",
  },
  FINANCE: {
    icon: <Landmark className="h-7 w-7 text-emerald-600 transition-transform group-hover:scale-110 group-hover:rotate-3" />,
    glowColor: "hover:shadow-[0_20px_60px_-15px_rgba(5,150,105,0.3)] hover:border-emerald-200",
    borderColor: "border-slate-200/60",
    iconBg: "bg-emerald-50 text-emerald-600 border border-emerald-100/50",
    desc: "Access general ledgers, reconcile accounts, and generate high-level financial forecasts.",
  },
  INVOICE_CENTER: {
    icon: <Receipt className="h-7 w-7 text-orange-600 transition-transform group-hover:scale-110 group-hover:rotate-3" />,
    glowColor: "hover:shadow-[0_20px_60px_-15px_rgba(234,88,12,0.3)] hover:border-orange-200",
    borderColor: "border-slate-200/60",
    iconBg: "bg-orange-50 text-orange-600 border border-orange-100/50",
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
    <div 
      className="relative flex min-h-screen flex-col bg-[#f8fafc] text-slate-800 overflow-hidden"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      {/* Global Noise Overlay */}
      <div className="absolute inset-0 bg-noise opacity-[0.06] pointer-events-none z-0 mix-blend-overlay" />

      {/* Decorative ambient background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[10%] w-[800px] h-[800px] rounded-full bg-brand-500/5 blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-teal-500/5 blur-[150px]" />
      </div>

      {/* Header */}
      <header className="relative flex h-24 shrink-0 items-center justify-between border-b border-slate-200/60 bg-white/70 backdrop-blur-xl px-8 lg:px-16 z-20 shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-5">
          {company?.logo_url ? (
            <div className="flex h-12 items-center justify-center p-2 bg-white rounded-[14px] border border-slate-100 shadow-sm ring-1 ring-slate-900/5">
              <img
                src={company.logo_url}
                alt={`${company?.name || "Company"} Logo`}
                className="h-full w-auto object-contain rounded-lg"
              />
            </div>
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-brand-500 text-white shadow-lg shadow-brand-500/20 ring-1 ring-brand-500/30">
              <Building className="h-6 w-6" />
            </div>
          )}
          <div>
            <h1 className="text-[19px] font-bold leading-tight text-slate-900 tracking-tight">
              {company?.name || "Company"}
            </h1>
            <p className="text-[14px] font-medium text-slate-500 mt-0.5">
              Welcome back, <span className="text-brand-600 font-semibold">{user?.name || user?.full_name || "Admin"}</span>
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="lg"
          onClick={logoutUser}
          className="border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm font-semibold rounded-xl h-11 px-5"
        >
          <LogOut className="mr-2 h-[18px] w-[18px] text-slate-400" />
          Logout
        </Button>
      </header>

      {/* Main Content */}
      <main className="relative flex flex-1 flex-col items-center pt-20 pb-16 px-6 md:px-8 z-10">
        <div className="mb-14 text-center animate-in fade-in slide-in-from-bottom-6 duration-700 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-[13px] font-bold text-brand-600 mb-5 tracking-widest shadow-sm uppercase">
            <span className="h-2 w-2 rounded-full bg-brand-500 animate-pulse shadow-[0_0_8px_rgba(72,84,204,0.6)]" />
            Enterprise Hub
          </div>
          <h2 className="mb-4 text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900">
            Select a Workspace
          </h2>
          <p className="text-[16px] text-slate-500 font-medium leading-relaxed">
            Choose a software module to enter its specialized environment. Your permissions and access may vary per module.
          </p>
        </div>

        {/* Wider Grid Container - Removed aspect-square, widened max width */}
        <div className="grid w-full max-w-7xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
          {softwareModules?.map((mod: any, idx: number) => {
            const config = MODULE_UI_CONFIG[mod.software_code] || {
              icon: <LayoutDashboard className="h-7 w-7 text-slate-500 transition-transform group-hover:scale-110 group-hover:rotate-3" />,
              glowColor: "hover:shadow-[0_20px_60px_-15px_rgba(148,163,184,0.3)] hover:border-slate-300",
              borderColor: "border-slate-200/60",
              iconBg: "bg-slate-50 text-slate-600 border border-slate-200/50",
              desc: mod.description || "Enter this module to manage related operations and settings.",
            };
            const isSwitching = switching === mod.software_code;

            return (
              <div
                key={mod.software_code}
                onClick={() => !isSwitching && handleModuleClick(mod.software_code)}
                className={`group relative flex flex-col rounded-[28px] border bg-white/70 backdrop-blur-xl p-8 transition-all duration-500 hover:-translate-y-2 shadow-sm ring-1 ring-slate-900/5 min-h-[300px] ${config.borderColor} ${config.glowColor} ${isSwitching ? "opacity-70 pointer-events-none scale-[0.98]" : "animate-in fade-in slide-in-from-bottom-8"} fill-mode-both cursor-pointer`}
                style={{ animationDelay: `${idx * 75}ms` }}
              >
                <div className="flex-1">
                  <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-[20px] ${config.iconBg} shadow-sm transition-transform duration-500 group-hover:scale-110`}>
                    {config.icon}
                  </div>
                  <h3 className="mb-2.5 text-[20px] font-bold text-slate-800 tracking-tight transition-colors group-hover:text-slate-950">
                    {mod.software_name}
                  </h3>
                  <p className="text-[14px] font-medium text-slate-500 leading-relaxed line-clamp-4">
                    {config.desc}
                  </p>
                </div>
                
                <div className="flex items-center text-[14px] font-bold text-brand-600 group-hover:text-brand-700 transition-colors mt-8 pt-4 border-t border-slate-100">
                  <span>Launch Workspace</span>
                  <div className="ml-2.5 p-1.5 rounded-full bg-brand-50 group-hover:bg-brand-100 transition-colors">
                    <svg className="h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
                
                {isSwitching && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-[28px] bg-white/80 backdrop-blur-md z-10">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500/20 border-t-brand-500" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative shrink-0 py-8 text-center text-[13px] text-slate-400 font-medium z-10 mt-auto tracking-wide border-t border-slate-200/50 bg-white/30 backdrop-blur-sm">
        <p>Engineered by <span className="font-bold hover:text-brand-500 transition-colors cursor-default text-slate-500">Pixand Co</span></p>
      </footer>
    </div>
  );
};

export default ModuleSelectionPage;
