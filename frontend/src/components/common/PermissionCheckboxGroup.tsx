
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
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden mb-5 transition-all">
      <div className="bg-slate-50/80 border-b border-slate-100 px-5 py-3.5 flex justify-between items-center">
        <h3 className="font-bold text-slate-800 capitalize tracking-tight text-sm flex items-center gap-2">
          {groupName?.replace(/_/g, " ") || ""}
        </h3>
        {!readOnly && (
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-2.5 py-1 rounded-md focus:outline-none transition-all"
          >
            {isAllSelected ? "Clear All" : "Select All"}
          </button>
        )}
      </div>
      <div className="p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 bg-slate-50/30">
        {permissions?.map((permission: any) => {
          const isSelected = selectedIds.includes(permission.id);
          return (
            <label
              key={permission.id}
              className={`relative flex items-start gap-3 p-3.5 rounded-xl border transition-all duration-200 ${readOnly ? "cursor-default opacity-80" : "cursor-pointer hover:shadow-sm"} ${isSelected ? "border-indigo-500 bg-indigo-50/40 shadow-indigo-100/50" : "border-slate-200 bg-white hover:border-indigo-300"}`}
            >
              <div className="flex items-center h-5 mt-0.5 shrink-0">
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => handleCheckboxChange(permission.id)}
                  disabled={readOnly}
                  className="w-4 h-4 text-indigo-600 bg-white border-slate-300 rounded shadow-sm focus:ring-indigo-500 focus:ring-2 disabled:opacity-50 transition-colors"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className={`text-sm font-semibold leading-tight truncate ${isSelected ? "text-indigo-950" : "text-slate-700"}`}>
                  {permission.permission_name}
                </span>
                <span className="text-[10px] font-mono text-slate-500 mt-1.5 bg-slate-100/80 px-1.5 py-0.5 rounded text-left w-fit border border-slate-200/60 truncate max-w-full">
                  {permission.permission_key}
                </span>
                {permission.description && (
                  <span className="text-xs text-slate-500 mt-1.5 block leading-relaxed line-clamp-2">
                    {permission.description}
                  </span>
                )}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default PermissionCheckboxGroup;
