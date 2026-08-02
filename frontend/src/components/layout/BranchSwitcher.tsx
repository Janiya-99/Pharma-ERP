import { useState } from "react";
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

  const handleChange = async (value: unknown) => {
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
          <SelectTrigger className="w-[200px] bg-slate-100 hover:bg-slate-200 border-transparent text-slate-800 h-10 rounded-xl focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-sm flex items-center gap-2 pl-4">
            <SelectValue placeholder="Select Branch" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-slate-100 z-50 rounded-xl shadow-xl overflow-hidden p-1">
            {branches.map((b: any) => {
              const id = b.id || b.branch_id;
              const name = b.branch_name || b.branch?.branch_name || "";
              return (
                <SelectItem key={id} value={id.toString()} className="">
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
