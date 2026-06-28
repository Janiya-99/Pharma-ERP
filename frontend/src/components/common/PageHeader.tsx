import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
  badge?: React.ReactNode;
}

const PageHeader = ({ title, description, action, badge }: PageHeaderProps) => {
  return (
    <div className="sticky top-0 z-10 flex flex-col gap-4 border-b border-gray-100 bg-white/60 px-6 py-5 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <h1 className="text-[18px] font-bold leading-none tracking-tight text-gray-900">
              {title}
            </h1>
            {badge}
          </div>
          {description && (
            <p className="mt-1 text-[13px] leading-snug text-gray-500">
              {description}
            </p>
          )}
        </div>
      </div>
      {action && (
        <div className="flex shrink-0 items-center gap-2">{action}</div>
      )}
    </div>
  );
};

export default PageHeader;
