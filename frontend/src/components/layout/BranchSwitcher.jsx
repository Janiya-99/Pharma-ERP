import React, { useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { MapPin, Loader2 } from "lucide-react";

const BranchSwitcher = () => {
  const { branches, activeBranch, switchActiveBranch } = useAuth();
  const [loading, setLoading] = useState(false);

  if (!branches || branches.length === 0) return null;

  const handleChange = async (e) => {
    const branchId = e.target.value;
    const activeBranchId = activeBranch?.id || activeBranch?.branch_id || activeBranch?.branch?.id;
    if (branchId && branchId !== activeBranchId?.toString()) {
      setLoading(true);
      await switchActiveBranch(branchId);
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <MapPin className="w-4 h-4 text-gray-500" />
      <div className="relative">
        <select
          value={activeBranch?.id || ""}
          onChange={handleChange}
          disabled={loading}
          className="appearance-none bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded-md focus:ring-blue-900 focus:border-blue-900 block w-full px-3 py-1.5 pr-8 transition-colors disabled:opacity-50"
        >
          {branches.map((b) => {
            const id = b.id || b.branch_id;
            const name = b.branch_name || b.branch?.branch_name || "";
            return (
              <option key={id} value={id}>
                {name}
              </option>
            );
          })}
        </select>
        {loading && (
          <div className="absolute right-2 top-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-500" />
          </div>
        )}
      </div>
    </div>
  );
};

export default BranchSwitcher;
