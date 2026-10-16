import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  badge?: React.ReactNode;
}

const PageHeader = ({ title, description, action, badge }: PageHeaderProps) => {
  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-gradient-to-br from-white/95 via-slate-50/90 to-blue-50/30 backdrop-blur-xl p-5 sm:p-6 lg:p-7 shadow-xs mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
      {/* Subtle ambient glows */}
      <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />
      <div className="absolute -right-8 -bottom-16 w-56 h-56 rounded-full bg-indigo-400/10 blur-2xl pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center gap-2.5 flex-wrap">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
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
      {action && (
        <div className="relative z-10 flex shrink-0 items-center gap-2.5 flex-wrap">{action}</div>
      )}
    </div>
  );
};

export default PageHeader;
