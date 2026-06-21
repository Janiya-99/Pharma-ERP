import React, { useState, useEffect } from "react";
import PageHeader from "../../../components/common/PageHeader";
import UserSelector from "../../../components/common/UserSelector";
import MultiSelect from "../../../components/common/MultiSelect";
import Button from "../../../components/common/Button";
import FormError from "../../../components/common/FormError";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import PermissionGuard from "../../../auth/PermissionGuard";
import { getBranches, getUserBranches, assignUserBranches, removeUserBranch, updateUser } from "../../../api/controlApi";
import { MapPin, Shield, Trash2, CheckCircle2 } from "lucide-react";

const UserBranchAccessPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [allBranches, setAllBranches] = useState([]);
  const [assignedBranches, setAssignedBranches] = useState([]);
  const [selectedBranchesToAssign, setSelectedBranchesToAssign] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const [branchToRemove, setBranchToRemove] = useState(null);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    fetchAllBranches();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchUserBranches();
      setSelectedBranchesToAssign([]);
      setSuccessMsg(null);
      setError(null);
    } else {
      setAssignedBranches([]);
    }
  }, [selectedUser]);

  const fetchAllBranches = async () => {
    try {
      const res = await getBranches({ limit: 100 });
      if (res.success) setAllBranches(res.data.items || res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUserBranches = async () => {
    try {
      setLoading(true);
      const res = await getUserBranches(selectedUser.id);
      if (res.success) {
        setAssignedBranches(res.data.branches || []);
      }
    } catch (err) {
      setError("Failed to fetch assigned branches.");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (selectedBranchesToAssign.length === 0) return;
    
    setAssigning(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const branchIds = selectedBranchesToAssign.map(b => b.id);
      const res = await assignUserBranches(selectedUser.id, { branch_ids: branchIds });
      
      if (res.success) {
        setSuccessMsg("Branches assigned successfully.");
        setSelectedBranchesToAssign([]);
        fetchUserBranches();
      } else {
        setError(res.message || "Failed to assign branches.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign branches.");
    } finally {
      setAssigning(false);
    }
  };

  const confirmRemove = (branch) => {
    setBranchToRemove(branch);
    setIsRemoveOpen(true);
  };

  const handleRemove = async () => {
    if (!branchToRemove) return;
    
    setRemoving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await removeUserBranch(selectedUser.id, branchToRemove.id);
      if (res.success) {
        setSuccessMsg("Branch removed successfully.");
        setIsRemoveOpen(false);
        fetchUserBranches();
        
        // If they removed their default branch, clear it
        if (selectedUser.default_branch_id === branchToRemove.id) {
          const updatedUser = { ...selectedUser, default_branch_id: null };
          setSelectedUser(updatedUser);
        }
      } else {
        setError(res.message || "Failed to remove branch.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to remove branch.");
    } finally {
      setRemoving(false);
    }
  };

  const setDefaultBranch = async (branchId) => {
    try {
      setError(null);
      setSuccessMsg(null);
      
      const payload = {
        employee_code: selectedUser.employee_code,
        full_name: selectedUser.full_name,
        email: selectedUser.email,
        phone: selectedUser.phone,
        department_id: selectedUser.department_id,
        designation_id: selectedUser.designation_id,
        user_type: selectedUser.user_type,
        status: selectedUser.status,
        default_branch_id: branchId
      };
      
      const res = await updateUser(selectedUser.id, payload);
      if (res.success) {
        setSelectedUser({ ...selectedUser, default_branch_id: branchId });
        setSuccessMsg("Default branch updated successfully.");
      } else {
        setError(res.message || "Failed to set default branch.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to set default branch.");
    }
  };

  const availableBranchesToAssign = allBranches.filter(
    b => !assignedBranches.some(ab => ab.id === b.id)
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="User Branch Access"
        description="Assign or remove branch access for users."
      />

      <FormError message={error} />
      {successMsg && (
        <div className="mb-6 bg-green-50 text-green-800 p-3 rounded-md text-sm border border-green-200 flex items-center">
          <CheckCircle2 className="w-5 h-5 mr-2 text-green-500" />
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: User Selection */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 lg:col-span-1">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">1. Select User</h2>
          <UserSelector 
            selectedUser={selectedUser} 
            onSelect={setSelectedUser} 
          />
          
          {selectedUser && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                  {selectedUser.full_name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{selectedUser.full_name}</p>
                  <p className="text-xs text-gray-500">{selectedUser.email}</p>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <p><span className="font-medium text-gray-700">Code:</span> {selectedUser.employee_code || "N/A"}</p>
                <p><span className="font-medium text-gray-700">Type:</span> <span className="capitalize">{selectedUser.user_type.replace("_", " ")}</span></p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Access Assignment */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-gray-400" /> 2. Assign Branches
            </h2>
            
            {!selectedUser ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                Please select a user first to assign branches.
              </div>
            ) : (
              <PermissionGuard permission="control.access.branch.assign" fallback={<p className="text-sm text-gray-500 italic">You don't have permission to assign branches.</p>}>
                <div className="flex flex-col sm:flex-row gap-3 items-end">
                  <div className="flex-1 w-full">
                    <MultiSelect
                      options={availableBranchesToAssign}
                      selectedValues={selectedBranchesToAssign}
                      onChange={setSelectedBranchesToAssign}
                      placeholder="Select branches to assign..."
                      displayKey="branch_name"
                      valueKey="id"
                    />
                  </div>
                  <Button 
                    onClick={handleAssign} 
                    disabled={selectedBranchesToAssign.length === 0}
                    isLoading={assigning}
                  >
                    Assign
                  </Button>
                </div>
              </PermissionGuard>
            )}
          </div>

          {selectedUser && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" /> Current Assignments
                </h2>
                <span className="text-xs bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full font-medium">
                  {assignedBranches.length} Branches
                </span>
              </div>
              
              <div className="p-0">
                {loading ? (
                  <div className="text-center py-8 text-gray-400 text-sm">Loading branches...</div>
                ) : assignedBranches.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">This user has no branches assigned.</div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {assignedBranches.map(branch => (
                      <li key={branch.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                        <div>
                          <p className="font-medium text-gray-900 flex items-center gap-2">
                            {branch.branch_name}
                            {selectedUser.default_branch_id === branch.id && (
                              <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Default Branch</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{branch.branch_code}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <PermissionGuard permission="control.user.update">
                            {selectedUser.default_branch_id !== branch.id && (
                              <Button 
                                variant="secondary" 
                                size="sm"
                                onClick={() => setDefaultBranch(branch.id)}
                              >
                                Set as Default
                              </Button>
                            )}
                          </PermissionGuard>

                          <PermissionGuard permission="control.access.branch.remove">
                            <button
                              onClick={() => confirmRemove(branch)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Remove Access"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </PermissionGuard>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={isRemoveOpen}
        onClose={() => setIsRemoveOpen(false)}
        onConfirm={handleRemove}
        title="Remove Branch Access"
        message={`Are you sure you want to remove access to "${branchToRemove?.branch_name}" for ${selectedUser?.full_name}?`}
        confirmText="Remove Access"
        isConfirming={removing}
      />
    </div>
  );
};

export default UserBranchAccessPage;
