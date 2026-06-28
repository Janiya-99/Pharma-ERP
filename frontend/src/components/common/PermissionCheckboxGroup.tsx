import React from "react";

const PermissionCheckboxGroup = ({
  groupName,
  permissions,
  selectedIds,
  onSelectionChange,
  readOnly = false,
}: {
  groupName?: string;
  permissions?: any[];
  selectedIds?: any[];
  onSelectionChange?: (ids: any[]) => void;
  readOnly?: boolean;
}) => {
  const allIds = permissions?.map((p: any) => p.id) || [];
  const isAllSelected = allIds.every((id: string | number) =>
    selectedIds?.includes(id)
  );
  const isSomeSelected =
    allIds.some((id: string | number) => selectedIds?.includes(id)) &&
    !isAllSelected;

  const handleSelectAll = () => {
    if (readOnly) return;
    if (isAllSelected) {
      // Clear all in this group
      onSelectionChange?.(
        selectedIds?.filter((id: string | number) => !allIds.includes(id)) || []
      );
    } else {
      // Select all in this group (merge without duplicates)
      const newSelection = Array.from(
        new Set([...(selectedIds || []), ...allIds])
      );
      onSelectionChange?.(newSelection);
    }
  };

  const handleCheckboxChange = (id: string | number) => {
    if (readOnly) return;
    if (selectedIds?.includes(id)) {
      onSelectionChange?.(
        selectedIds.filter((selectedId: string | number) => selectedId !== id)
      );
    } else {
      onSelectionChange?.([...(selectedIds || []), id]);
    }
  };

  return (
    <div className="mb-4 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3">
        <h3 className="font-semibold capitalize text-gray-800">
          {groupName?.replace(/_/g, " ") || ""}
        </h3>
        {!readOnly && (
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-xs font-medium text-blue-600 transition-colors hover:text-blue-800 focus:outline-none"
          >
            {isAllSelected ? "Clear All" : "Select All"}
          </button>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 lg:grid-cols-3">
        {permissions?.map((permission: any) => (
          <label
            key={permission.id}
            className={`flex items-start gap-3 rounded p-2 transition-colors hover:bg-gray-50 ${
              readOnly ? "cursor-default" : "cursor-pointer"
            }`}
          >
            <div className="mt-0.5 flex h-5 items-center">
              <input
                type="checkbox"
                checked={selectedIds.includes(permission.id)}
                onChange={() => handleCheckboxChange(permission.id)}
                disabled={readOnly}
                className="h-4 w-4 rounded border-gray-300 bg-gray-100 text-blue-600 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium leading-tight text-gray-900">
                {permission.permission_name}
              </span>
              <span className="mt-1 text-xs text-gray-500">
                {permission.permission_key}
              </span>
              {permission.description && (
                <span className="mt-0.5 block max-w-xs truncate text-xs text-gray-400">
                  {permission.description}
                </span>
              )}
            </div>
          </label>
        ))}
      </div>
    </div>
  );
};

export default PermissionCheckboxGroup;
