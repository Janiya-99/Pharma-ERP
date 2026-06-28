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

  const activeBranchId =
    activeBranch?.id || activeBranch?.branch_id || activeBranch?.branch?.id;

  const handleChange = async (value: unknown) => {
    if (value && value !== activeBranchId?.toString()) {
      setLoading(true);
      await switchActiveBranch(value);
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <MapPin className="h-4 w-4 text-gray-500" />
      <div className="relative">
        <Select
          value={activeBranchId?.toString() || ""}
          onValueChange={handleChange}
          disabled={loading}
        >
          <SelectTrigger className="h-9 w-[180px] rounded-xl border-gray-300 bg-gray-50 text-gray-700 focus:border-brand-500 focus:ring-brand-500 dark:border-navy-700 dark:bg-navy-900 dark:text-gray-200">
            <SelectValue placeholder="Select Branch" />
          </SelectTrigger>
          <SelectContent className="z-50 border border-gray-200 bg-white dark:border-navy-700 dark:bg-navy-800">
            {branches.map((b: unknown) => {
              const id = b.id || b.branch_id;
              const name = b.branch_name || b.branch?.branch_name || "";
              return (
                <SelectItem
                  key={id}
                  value={id.toString()}
                  className="dark:text-gray-200"
                >
                  {name}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        {loading && (
          <div className="absolute right-8 top-2.5">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-500" />
          </div>
        )}
      </div>
    </div>
  );
};

export default BranchSwitcher;
