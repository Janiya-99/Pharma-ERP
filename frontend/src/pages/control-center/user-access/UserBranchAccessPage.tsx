import React, { useState, useEffect } from "react";
import PageHeader from "../../../components/common/PageHeader";
import UserSelector from "../../../components/common/UserSelector";
import MultiSelect from "../../../components/common/MultiSelect";
import Button from "../../../components/common/Button";
import FormError from "../../../components/common/FormError";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import PermissionGuard from "../../../auth/PermissionGuard";
import {
  getBranches,
  getUserBranches,
  assignUserBranches,
  removeUserBranch,
  updateUser,
} from "../../../api/controlApi";
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
      if (res.success)
        setAllBranches(
          Array.isArray(res.data?.items)
            ? res.data.items
            : Array.isArray(res.data)
            ? res.data
            : []
        );
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUserBranches = async () => {
    try {
      setLoading(true);
      const res = await getUserBranches(selectedUser.id);
      if (res.success) {
        setAssignedBranches(res.data?.branches || []);
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
      const branches = selectedBranchesToAssign.map((b: unknown) => ({
        branch_id: b.id,
        is_default: false,
      }));
      const res = await assignUserBranches(selectedUser.id, { branches });

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

  const confirmRemove = (branch: unknown) => {
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

  const setDefaultBranch = async (branchId: string | number) => {
    try {
      setError(null);
      setSuccessMsg(null);

      const payload = {
        employee_code: selectedUser.employee_code,
        name: selectedUser.name || selectedUser.full_name,
        full_name: selectedUser.name || selectedUser.full_name,
        email: selectedUser.email,
        phone: selectedUser.phone,
        department_id: selectedUser.department_id,
        designation_id: selectedUser.designation_id,
        user_type: selectedUser.user_type,
        status: selectedUser.status,
        default_branch_id: branchId,
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
    (b: unknown) => !assignedBranches.some((ab: unknown) => ab.id === b.id)
  );

  return (
    <div className="mx-auto max-w-7xl p-6">
      <PageHeader
        title="User Branch Access"
        description="Assign or remove branch access for users."
      />

      <FormError message={error} />
      {successMsg && (
        <div className="mb-6 flex items-center rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
          {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">
        {/* Left Column: User Selection */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:col-span-1">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-700">
            1. Select User
          </h2>
          <UserSelector
            selectedUser={selectedUser}
            onSelect={setSelectedUser}
          />

          {selectedUser && (
            <div className="mt-6 border-t border-gray-100 pt-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                  {(selectedUser.name || selectedUser.full_name || "U").charAt(
                    0
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {selectedUser.name || selectedUser.full_name}
                  </p>
                  <p className="text-xs text-gray-500">{selectedUser.email}</p>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <p>
                  <span className="font-medium text-gray-700">Code:</span>{" "}
                  {selectedUser.employee_code || "N/A"}
                </p>
                <p>
                  <span className="font-medium text-gray-700">Type:</span>{" "}
                  <span className="capitalize">
                    {(selectedUser.user_type || "").replace("_", " ")}
                  </span>
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Access Assignment */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-700">
              <Shield className="h-4 w-4 text-gray-400" /> 2. Assign Branches
            </h2>

            {!selectedUser ? (
              <div className="py-8 text-center text-sm text-gray-400">
                Please select a user first to assign branches.
              </div>
            ) : (
              <PermissionGuard
                permission="control.access.branch.assign"
                fallback={
                  <p className="text-sm italic text-gray-500">
                    You don't have permission to assign branches.
                  </p>
                }
              >
                <div className="flex flex-col items-end gap-3 sm:flex-row">
                  <div className="w-full flex-1">
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
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-5 py-4">
                <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-700">
                  <MapPin className="h-4 w-4 text-gray-400" /> Current
                  Assignments
                </h2>
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                  {assignedBranches.length} Branches
                </span>
              </div>

              <div className="p-0">
                {loading ? (
                  <div className="py-8 text-center text-sm text-gray-400">
                    Loading branches...
                  </div>
                ) : assignedBranches.length === 0 ? (
                  <div className="py-8 text-center text-sm text-gray-400">
                    This user has no branches assigned.
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {assignedBranches.map((branch: unknown) => (
                      <li
                        key={branch.id}
                        className="flex flex-col justify-between gap-4 p-4 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center"
                      >
                        <div>
                          <p className="flex items-center gap-2 font-medium text-gray-900">
                            {branch.branch_name}
                            {selectedUser.default_branch_id === branch.id && (
                              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                                Default Branch
                              </span>
                            )}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {branch.branch_code}
                          </p>
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
                              className="rounded-md p-2 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                              title="Remove Access"
                            >
                              <Trash2 className="h-4 w-4" />
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
        message={`Are you sure you want to remove access to "${
          branchToRemove?.branch_name
        }" for ${selectedUser?.name || selectedUser?.full_name}?`}
        confirmText="Remove Access"
        isConfirming={removing}
      />
    </div>
  );
};

export default UserBranchAccessPage;
