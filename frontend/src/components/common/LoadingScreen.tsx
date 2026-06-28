import { Building2, ShieldCheck, Sparkles } from "lucide-react";

const LoadingScreen = ({ text = "Preparing workspace" }: { text?: string }) => {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#F8FAFC] px-6 text-slate-900">
      <div className="w-full max-w-[460px]">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-8 shadow-[0_20px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-all">
          
          {/* Modern Circular Loop Spinner */}
          <div className="my-6 flex flex-col items-center justify-center">
            <div className="relative flex h-28 w-28 items-center justify-center">
              {/* Outer Glowing Loop Ring */}
              <div className="absolute inset-0 rounded-full border-[5px] border-slate-100 border-t-blue-600 border-r-indigo-600 animate-spin shadow-[0_0_20px_rgba(37,99,235,0.25)]" />
              {/* Counter-rotating Inner Loop Ring */}
              <div className="absolute inset-2.5 rounded-full border-[4px] border-slate-50 border-b-blue-500 border-l-indigo-500 animate-[spin_2.5s_linear_infinite_reverse]" />
              {/* Center Icon */}
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30">
                <Building2 className="h-7 w-7 animate-pulse" />
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-blue-600">Pharma ERP</p>
            <h1 className="mt-1.5 text-xl font-bold tracking-tight text-slate-950">{text}</h1>
            <p className="mt-1 text-sm text-slate-500">Loading your secure business environment...</p>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-2 border-t border-slate-100 pt-6">
            {[
              { label: "Company", icon: Building2 },
              { label: "Access", icon: ShieldCheck },
              { label: "Modules", icon: Sparkles },
            ].map((item) => (
              <div key={item.label} className="flex flex-col items-center justify-center gap-1.5 rounded-xl border border-slate-100 bg-slate-50/80 py-2.5 px-2 text-center transition-all hover:bg-slate-100/80">
                <item.icon className="h-4 w-4 text-blue-600" />
                <span className="text-[11px] font-semibold text-slate-600">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;
