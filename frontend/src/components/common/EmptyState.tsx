import React from "react";

const EmptyState = ({
  title,
  description,
  icon: Icon,
  action,
}: {
  title?: unknown;
  description?: unknown;
  Icon?: unknown;
  action?: unknown;
}) => {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center rounded-lg border border-dashed border-gray-200 bg-white p-8 text-center">
      {Icon && (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
          <Icon className="h-6 w-6 text-blue-900" />
        </div>
      )}
      <h3 className="mb-1 text-lg font-medium text-gray-900">{title}</h3>
      {description && (
        <p className="mb-6 max-w-sm text-sm text-gray-500">{description}</p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
