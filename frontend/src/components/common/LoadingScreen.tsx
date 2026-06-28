import React from "react";
import { Building2, ShieldCheck, Sparkles } from "lucide-react";

const LoadingScreen = ({ text = "Preparing workspace" }: { text?: string }) => {
  return (
    <div className="text-slate-900 flex min-h-screen w-full items-center justify-center bg-[#F8FAFC] px-6">
      <div className="w-full max-w-[460px]">
        <div className="border-slate-200/80 rounded-2xl border bg-white p-8 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-all">
          {/* Modern Circular Loop Spinner */}
          <div className="my-6 flex flex-col items-center justify-center">
            <div className="relative flex h-28 w-28 items-center justify-center">
              {/* Outer Glowing Loop Ring */}
              <div className="border-slate-100 absolute inset-0 animate-spin rounded-full border-[5px] border-r-indigo-600 border-t-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.25)]" />
              {/* Counter-rotating Inner Loop Ring */}
              <div className="border-slate-50 absolute inset-2.5 animate-[spin_2.5s_linear_infinite_reverse] rounded-full border-[4px] border-b-blue-500 border-l-indigo-500" />
              {/* Center Icon */}
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30">
                <Building2 className="h-7 w-7 animate-pulse" />
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
              Pharma ERP
            </p>
            <h1 className="text-slate-950 mt-1.5 text-xl font-bold tracking-tight">
              {text}
            </h1>
            <p className="text-slate-500 mt-1 text-sm">
              Loading your secure business environment...
            </p>
          </div>

          <div className="border-slate-100 mt-8 grid grid-cols-3 gap-2 border-t pt-6">
            {[
              { label: "Company", icon: Building2 },
              { label: "Access", icon: ShieldCheck },
              { label: "Modules", icon: Sparkles },
            ].map((item) => (
              <div
                key={item.label}
                className="border-slate-100 bg-slate-50/80 hover:bg-slate-100/80 flex flex-col items-center justify-center gap-1.5 rounded-xl border px-2 py-2.5 text-center transition-all"
              >
                <item.icon className="h-4 w-4 text-blue-600" />
                <span className="text-slate-600 text-[11px] font-semibold">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
