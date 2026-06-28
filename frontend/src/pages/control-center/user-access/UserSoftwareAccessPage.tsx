import React, { useState, useEffect } from "react";
import PageHeader from "../../../components/common/PageHeader";
import UserSelector from "../../../components/common/UserSelector";
import MultiSelect from "../../../components/common/MultiSelect";
import Button from "../../../components/common/Button";
import FormError from "../../../components/common/FormError";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import PermissionGuard from "../../../auth/PermissionGuard";
import {
  getSoftwareModules,
  getUserSoftware,
  assignUserSoftware,
  removeUserSoftware,
} from "../../../api/controlApi";
import { LayoutDashboard, Shield, Trash2, CheckCircle2 } from "lucide-react";

const UserSoftwareAccessPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [allSoftware, setAllSoftware] = useState([]);
  const [assignedSoftware, setAssignedSoftware] = useState([]);
  const [selectedSoftwareToAssign, setSelectedSoftwareToAssign] = useState([]);

  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const [softwareToRemove, setSoftwareToRemove] = useState(null);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    fetchAllSoftware();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchUserSoftware();
      setSelectedSoftwareToAssign([]);
      setSuccessMsg(null);
      setError(null);
    } else {
      setAssignedSoftware([]);
    }
  }, [selectedUser]);

  const fetchAllSoftware = async () => {
    try {
      const res = await getSoftwareModules();
      if (res.success)
        setAllSoftware(
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

  const fetchUserSoftware = async () => {
    try {
      setLoading(true);
      const res = await getUserSoftware(selectedUser.id);
      if (res.success) {
        setAssignedSoftware(res.data?.software_modules || []);
      }
    } catch (err) {
      setError("Failed to fetch assigned software modules.");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    if (selectedSoftwareToAssign.length === 0) return;

    setAssigning(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const software_modules = selectedSoftwareToAssign.map((s: unknown) => ({
        software_id: s.id,
        can_access: true,
      }));
      const res = await assignUserSoftware(selectedUser.id, {
        software_modules,
      });

      if (res.success) {
        setSuccessMsg("Software modules assigned successfully.");
        setSelectedSoftwareToAssign([]);
        fetchUserSoftware();
      } else {
        setError(res.message || "Failed to assign software modules.");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to assign software modules."
      );
    } finally {
      setAssigning(false);
    }
  };

  const confirmRemove = (software: unknown) => {
    setSoftwareToRemove(software);
    setIsRemoveOpen(true);
  };

  const handleRemove = async () => {
    if (!softwareToRemove) return;

    setRemoving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await removeUserSoftware(
        selectedUser.id,
        softwareToRemove.id
      );
      if (res.success) {
        setSuccessMsg("Software module access removed successfully.");
        setIsRemoveOpen(false);
        fetchUserSoftware();
      } else {
        setError(res.message || "Failed to remove software access.");
      }
    } catch (err) {
      // Backend block will be shown here
      setError(
        err.response?.data?.message || "Failed to remove software access."
      );
      setIsRemoveOpen(false); // Close dialog to show error clearly
    } finally {
      setRemoving(false);
    }
  };

  const availableSoftwareToAssign = allSoftware.filter(
    (s: unknown) => !assignedSoftware.some((as: unknown) => as.id === s.id)
  );

  return (
    <div className="mx-auto max-w-7xl p-6">
      <PageHeader
        title="User Software Access"
        description="Assign or remove software module access for users."
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
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-700">
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
              <Shield className="h-4 w-4 text-gray-400" /> 2. Assign Software
              Modules
            </h2>

            {!selectedUser ? (
              <div className="py-8 text-center text-sm text-gray-400">
                Please select a user first to assign software access.
              </div>
            ) : (
              <PermissionGuard
                permission="control.access.software.assign"
                fallback={
                  <p className="text-sm italic text-gray-500">
                    You don't have permission to assign software access.
                  </p>
                }
              >
                <div className="flex flex-col items-end gap-3 sm:flex-row">
                  <div className="w-full flex-1">
                    <MultiSelect
                      options={availableSoftwareToAssign}
                      selectedValues={selectedSoftwareToAssign}
                      onChange={setSelectedSoftwareToAssign}
                      placeholder="Select software modules to assign..."
                      displayKey="software_name"
                      valueKey="id"
                    />
                  </div>
                  <Button
                    onClick={handleAssign}
                    disabled={selectedSoftwareToAssign.length === 0}
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
                  <LayoutDashboard className="h-4 w-4 text-gray-400" /> Current
                  Software Access
                </h2>
                <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
                  {assignedSoftware.length} Modules
                </span>
              </div>

              <div className="p-0">
                {loading ? (
                  <div className="py-8 text-center text-sm text-gray-400">
                    Loading software modules...
                  </div>
                ) : assignedSoftware.length === 0 ? (
                  <div className="py-8 text-center text-sm text-gray-400">
                    This user has no software modules assigned.
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {assignedSoftware.map((software: unknown) => (
                      <li
                        key={software.id}
                        className="flex flex-col justify-between gap-4 p-4 transition-colors hover:bg-gray-50 sm:flex-row sm:items-center"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {software.software_name}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {software.software_code}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <PermissionGuard permission="control.access.software.remove">
                            <button
                              onClick={() => confirmRemove(software)}
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
        title="Remove Software Access"
        message={`Are you sure you want to remove access to "${
          softwareToRemove?.software_name
        }" for ${selectedUser?.name || selectedUser?.full_name}?`}
        confirmText="Remove Access"
        isConfirming={removing}
      />
    </div>
  );
};

export default UserSoftwareAccessPage;
