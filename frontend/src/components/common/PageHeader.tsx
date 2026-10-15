import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  badge?: React.ReactNode;
}

const PageHeader = ({ title, description, action, badge }: PageHeaderProps) => {
  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-gradient-to-r from-white/95 via-slate-50/90 to-blue-50/30 backdrop-blur-xl p-5 sm:p-6 shadow-xs mb-6 transition-all duration-300">
      {/* Subtle ambient light */}
      <div className="absolute -right-12 -top-12 w-56 h-56 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
      
      {/* Subtle geometric SVG watermark */}
      <div className="absolute right-0 top-0 bottom-0 w-64 opacity-[0.035] pointer-events-none select-none text-slate-900 overflow-hidden">
        <svg viewBox="0 0 200 100" className="w-full h-full object-cover" fill="none" stroke="currentColor" strokeWidth="1.2">
          <path d="M 20,20 L 50,5 L 80,20 L 80,50 L 50,65 L 20,50 Z" />
          <path d="M 80,20 L 110,5 L 140,20 L 140,50 L 110,65 L 80,50 Z" />
          <path d="M 50,65 L 80,50 L 110,65 L 110,95 L 80,110 L 50,95 Z" />
          <circle cx="50" cy="5" r="2.5" fill="currentColor" />
          <circle cx="110" cy="5" r="2.5" fill="currentColor" />
        </svg>
      </div>

      <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
                {title}
              </h1>
              {badge}
            </div>
            {description && (
              <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500 leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>
        {action && (
          <div className="flex shrink-0 items-center gap-2.5 flex-wrap">{action}</div>
        )}
      </div>
    </div>
  );
};

export default PageHeader;
