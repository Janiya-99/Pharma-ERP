import React from "react";
import { MdAdd } from "react-icons/md";

interface FinancePageHeaderProps {
  title: string;
  description?: string;
  subtitle?: string;
  action?: React.ReactNode;
  onAdd?: () => void;
  addLabel?: string;
}

const FinancePageHeader: React.FC<FinancePageHeaderProps> = ({
  title,
  description,
  subtitle,
  action,
  onAdd,
  addLabel,
}) => {
  const displayDesc = description || subtitle;

  return (
    <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
      <div>
        <h1 className="text-2xl font-bold text-navy-900 ">
          {title}
        </h1>
        {displayDesc && (
          <p className="mt-1 text-sm text-gray-600 ">
            {displayDesc}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {action && <div>{action}</div>}
        {!action && onAdd && (
          <button
            onClick={onAdd}
            className="flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white transition-all hover:bg-brand-600"
          >
            <MdAdd className="h-5 w-5" />
            <span>{addLabel || "Add"}</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default FinancePageHeader;
