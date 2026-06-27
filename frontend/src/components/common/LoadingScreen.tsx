import React from "react";
import { Building2, CheckCircle2, Loader2, ShieldCheck, Sparkles } from "lucide-react";

const LoadingScreen = ({ text = "Preparing workspace" }: { text?: string }) => {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#F8FAFC] px-6 text-slate-900">
      <div className="w-full max-w-[460px]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.08)]">
          <div className="flex items-center gap-4">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <Building2 className="h-7 w-7" />
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-white bg-green-500">
                <CheckCircle2 className="h-3 w-3 text-white" />
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">Pharma ERP</p>
              <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-950">{text}</h1>
              <p className="mt-1 text-sm text-slate-500">Loading your secure business dashboard.</p>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-2/3 animate-pulse rounded-full bg-blue-600" />
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {[
                { label: "Company", icon: Building2 },
                { label: "Access", icon: ShieldCheck },
                { label: "Modules", icon: Sparkles },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
                  <item.icon className="h-4 w-4 text-blue-600" />
                  <span className="text-xs font-semibold text-slate-600">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              Syncing session
            </div>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">Secure</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
