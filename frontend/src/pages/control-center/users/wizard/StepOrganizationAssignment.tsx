import React, { useState, useEffect } from "react";
import { Search, MapPin } from "lucide-react";
import BranchCard from "../../../../components/common/BranchCard";
import ToggleSwitch from "../../../../components/common/ToggleSwitch";
import { getBranches } from "../../../../api/controlApi";

interface StepOrganizationAssignmentProps {
  formData: any;
  onChange: (field: string, value: any) => void;
}

const StepOrganizationAssignment = ({
  formData,
  onChange,
}: StepOrganizationAssignmentProps) => {
  const [allBranches, setAllBranches] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const res = await getBranches({ limit: 200 });
      if (res.success) {
        setAllBranches(res.data.items || res.data);
      }
    } catch (err) {
      console.error("Failed to load branches", err);
    } finally {
      setLoading(false);
    }
  };

  const selectedBranchIds: (string | number)[] =
    formData.assigned_branches || [];

  const toggleBranch = (branch: any) => {
    const isSelected = selectedBranchIds.includes(branch.id);
    let updated: (string | number)[];
    if (isSelected) {
      updated = selectedBranchIds.filter((id) => id !== branch.id);
      // If removing the primary branch, clear it
      if (formData.primary_branch_id === branch.id) {
        onChange("primary_branch_id", updated.length > 0 ? updated[0] : "");
      }
    } else {
      updated = [...selectedBranchIds, branch.id];
      // Auto-set primary if first branch
      if (updated.length === 1) {
        onChange("primary_branch_id", branch.id);
      }
    }
    onChange("assigned_branches", updated);
  };

  const setPrimary = (branch: any) => {
    onChange("primary_branch_id", branch.id);
  };

  const handleAllBranches = (checked: boolean) => {
    onChange("allow_all_branches", checked);
    if (checked) {
      onChange(
        "assigned_branches",
        allBranches.map((b) => b.id)
      );
      if (!formData.primary_branch_id && allBranches.length > 0) {
        onChange("primary_branch_id", allBranches[0].id);
      }
    }
  };

  const filteredBranches = allBranches.filter(
    (b) =>
      b.branch_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.branch_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="card-premium">
      <div className="card-premium-header">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Organization Assignment
          </h3>
          <p className="mt-0.5 text-xs text-gray-500">
            Assign the user to branches within your organization
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-400">
            {selectedBranchIds.length} of {allBranches.length} selected
          </span>
        </div>
      </div>

      <div className="card-premium-body">
        {/* Allow all branches toggle */}
        <div className="mb-5 rounded-xl border border-gray-100 bg-gray-50 p-4">
          <ToggleSwitch
            checked={formData.allow_all_branches || false}
            onChange={handleAllBranches}
            label="Allow All Branches"
            description="Grant this user access to all current and future branches"
          />
        </div>

        {/* Search */}
        <div className="relative mb-5 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search branches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-premium pl-9"
          />
        </div>

        {/* Branch grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {filteredBranches.map((branch) => (
              <BranchCard
                key={branch.id}
                branch={branch}
                isSelected={selectedBranchIds.includes(branch.id)}
                isPrimary={formData.primary_branch_id === branch.id}
                onToggle={toggleBranch}
                onSetPrimary={setPrimary}
              />
            ))}
          </div>
        )}

        {!loading && filteredBranches.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 py-12">
            <MapPin className="h-8 w-8 text-gray-300" />
            <p className="text-sm text-gray-500">No branches found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StepOrganizationAssignment;
