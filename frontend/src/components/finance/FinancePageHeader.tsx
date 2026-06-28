import React from "react";

interface FinancePageHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

const FinancePageHeader: React.FC<FinancePageHeaderProps> = ({
  title,
  description,
  action,
}: {
  title?: unknown;
  description?: unknown;
  action?: unknown;
}) => {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
      <div>
        <h1 className="text-2xl font-bold text-navy-900 dark:text-white">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};

export default FinancePageHeader;
