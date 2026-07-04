
const PermissionCheckboxGroup = ({ groupName, permissions, selectedIds, onSelectionChange, readOnly = false }: { groupName?: string; permissions?: any[]; selectedIds?: any[]; onSelectionChange?: (ids: any[]) => void; readOnly?: boolean }) => {
  const allIds = permissions?.map((p: any) => p.id) || [];
  const isAllSelected = allIds.every((id: string | number) => selectedIds?.includes(id));

  const handleSelectAll = () => {
    if (readOnly) return;
    if (isAllSelected) {
      // Clear all in this group
      onSelectionChange?.(selectedIds?.filter((id: string | number) => !allIds.includes(id)) || []);
    } else {
      // Select all in this group (merge without duplicates)
      const newSelection = Array.from(new Set([...(selectedIds || []), ...allIds]));
      onSelectionChange?.(newSelection);
    }
  };

  const handleCheckboxChange = (id: string | number) => {
    if (readOnly) return;
    if (selectedIds?.includes(id)) {
      onSelectionChange?.(selectedIds.filter((selectedId: string | number) => selectedId !== id));
    } else {
      onSelectionChange?.([...(selectedIds || []), id]);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden mb-4">
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex justify-between items-center">
        <h3 className="font-semibold text-gray-800 capitalize">
          {groupName?.replace(/_/g, " ") || ""}
        </h3>
        {!readOnly && (
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 focus:outline-none transition-colors"
          >
            {isAllSelected ? "Clear All" : "Select All"}
          </button>
        )}
      </div>
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {permissions?.map((permission: any) => (
          <label
            key={permission.id}
            className={`flex items-start gap-3 p-2 rounded hover:bg-gray-50 transition-colors ${readOnly ? "cursor-default" : "cursor-pointer"}`}
          >
            <div className="flex items-center h-5 mt-0.5">
              <input
                type="checkbox"
                checked={selectedIds.includes(permission.id)}
                onChange={() => handleCheckboxChange(permission.id)}
                disabled={readOnly}
                className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2 disabled:opacity-50"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-900 leading-tight">
                {permission.permission_name}
              </span>
              <span className="text-xs text-gray-500 mt-1">
                {permission.permission_key}
              </span>
              {permission.description && (
                <span className="text-xs text-gray-400 mt-0.5 block truncate max-w-xs">
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
