import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  badge?: React.ReactNode;
}

const PageHeader = ({ title, description, action, badge }: PageHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-5 border-b border-gray-100 bg-white/60 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-start gap-3 min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="text-[18px] font-bold text-gray-900 tracking-tight leading-none">
              {title}
            </h1>
            {badge}
          </div>
          {description && (
            <p className="mt-1 text-[13px] text-gray-500 leading-snug">{description}</p>
          )}
        </div>
      </div>
      {action && (
        <div className="flex items-center gap-2 shrink-0">{action}</div>
      )}
    </div>
  );
};

export default PageHeader;
