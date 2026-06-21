import React, { useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { MapPin, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const BranchSwitcher = () => {
  const { branches, activeBranch, switchActiveBranch } = useAuth();
  const [loading, setLoading] = useState(false);

  if (!branches || branches.length === 0) return null;

  const activeBranchId = activeBranch?.id || activeBranch?.branch_id || activeBranch?.branch?.id;

  const handleChange = async (value) => {
    if (value && value !== activeBranchId?.toString()) {
      setLoading(true);
      await switchActiveBranch(value);
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <MapPin className="w-4 h-4 text-gray-500" />
      <div className="relative">
        <Select
          value={activeBranchId?.toString() || ""}
          onValueChange={handleChange}
          disabled={loading}
        >
          <SelectTrigger className="w-[180px] bg-gray-50 dark:bg-navy-900 border-gray-300 dark:border-navy-700 text-gray-700 dark:text-gray-200 h-9 rounded-xl focus:ring-brand-500 focus:border-brand-500">
            <SelectValue placeholder="Select Branch" />
          </SelectTrigger>
          <SelectContent className="bg-white dark:bg-navy-800 border border-gray-200 dark:border-navy-700 z-50">
            {branches.map((b) => {
              const id = b.id || b.branch_id;
              const name = b.branch_name || b.branch?.branch_name || "";
              return (
                <SelectItem key={id} value={id.toString()} className="dark:text-gray-200">
                  {name}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        {loading && (
          <div className="absolute right-8 top-2.5">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-gray-500" />
          </div>
        )}
      </div>
    </div>
  );
};

export default BranchSwitcher;
