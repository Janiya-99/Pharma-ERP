import React from "react";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full flex flex-col items-center justify-between gap-3 px-4 py-3 border-t border-slate-200/70 bg-white/80 backdrop-blur-xs text-xs text-slate-500 sm:flex-row sm:px-6">
      <div className="flex items-center gap-1.5 text-center sm:text-left">
        <span>© {currentYear} Ceylon Med Global ERP. All Rights Reserved.</span>
        <span className="hidden sm:inline text-slate-300">•</span>
        <span className="hidden sm:inline">
          Developed by{" "}
          <span className="font-bold text-slate-800 hover:text-indigo-600 transition-colors">
            PIXANDCO
          </span>
        </span>
      </div>
      <div className="flex items-center gap-4 text-xs font-medium text-slate-500">
        <a
          href="/support"
          onClick={(e) => {
            e.preventDefault();
            window.location.href = "mailto:support@ceylonmed.lk";
          }}
          className="hover:text-indigo-600 transition-colors"
        >
          Support
        </a>
        <span className="text-slate-300">•</span>
        <a
          href="/docs"
          onClick={(e) => {
            e.preventDefault();
            window.open("/docs/ERP_USER_MANUAL.pdf", "_blank");
          }}
          className="hover:text-indigo-600 transition-colors"
        >
          Documentation
        </a>
        <span className="text-slate-300">•</span>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          NMRA Regulated
        </span>
      </div>
    </footer>
  );
};

export default Footer;
