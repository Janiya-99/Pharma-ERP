import React, { useState, useEffect } from "react";
import PageHeader from "../../../components/common/PageHeader";
import UserSelector from "../../../components/common/UserSelector";
import MultiSelect from "../../../components/common/MultiSelect";
import Button from "../../../components/common/Button";
import FormError from "../../../components/common/FormError";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import PermissionGuard from "../../../auth/PermissionGuard";
import { getSoftwareModules, getUserSoftware, assignUserSoftware, removeUserSoftware } from "../../../api/controlApi";
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
      if (res.success) setAllSoftware(res.data.items || res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUserSoftware = async () => {
    try {
      setLoading(true);
      const res = await getUserSoftware(selectedUser.id);
      if (res.success) {
        setAssignedSoftware(res.data.software_modules || []);
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
      const softwareIds = selectedSoftwareToAssign.map(s => s.id);
      const res = await assignUserSoftware(selectedUser.id, { software_module_ids: softwareIds });
      
      if (res.success) {
        setSuccessMsg("Software modules assigned successfully.");
        setSelectedSoftwareToAssign([]);
        fetchUserSoftware();
      } else {
        setError(res.message || "Failed to assign software modules.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to assign software modules.");
    } finally {
      setAssigning(false);
    }
  };

  const confirmRemove = (software) => {
    setSoftwareToRemove(software);
    setIsRemoveOpen(true);
  };

  const handleRemove = async () => {
    if (!softwareToRemove) return;
    
    setRemoving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await removeUserSoftware(selectedUser.id, softwareToRemove.id);
      if (res.success) {
        setSuccessMsg("Software module access removed successfully.");
        setIsRemoveOpen(false);
        fetchUserSoftware();
      } else {
        setError(res.message || "Failed to remove software access.");
      }
    } catch (err) {
      // Backend block will be shown here
      setError(err.response?.data?.message || "Failed to remove software access.");
      setIsRemoveOpen(false); // Close dialog to show error clearly
    } finally {
      setRemoving(false);
    }
  };

  const availableSoftwareToAssign = allSoftware.filter(
    s => !assignedSoftware.some(as => as.id === s.id)
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="User Software Access"
        description="Assign or remove software module access for users."
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
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
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
              <Shield className="w-4 h-4 text-gray-400" /> 2. Assign Software Modules
            </h2>
            
            {!selectedUser ? (
              <div className="text-center py-8 text-gray-400 text-sm">
                Please select a user first to assign software access.
              </div>
            ) : (
              <PermissionGuard permission="control.access.software.assign" fallback={<p className="text-sm text-gray-500 italic">You don't have permission to assign software access.</p>}>
                <div className="flex flex-col sm:flex-row gap-3 items-end">
                  <div className="flex-1 w-full">
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                  <LayoutDashboard className="w-4 h-4 text-gray-400" /> Current Software Access
                </h2>
                <span className="text-xs bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full font-medium">
                  {assignedSoftware.length} Modules
                </span>
              </div>
              
              <div className="p-0">
                {loading ? (
                  <div className="text-center py-8 text-gray-400 text-sm">Loading software modules...</div>
                ) : assignedSoftware.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-sm">This user has no software modules assigned.</div>
                ) : (
                  <ul className="divide-y divide-gray-100">
                    {assignedSoftware.map(software => (
                      <li key={software.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                        <div>
                          <p className="font-medium text-gray-900">{software.software_name}</p>
                          <p className="text-xs text-gray-500 mt-1">{software.software_code}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <PermissionGuard permission="control.access.software.remove">
                            <button
                              onClick={() => confirmRemove(software)}
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
        title="Remove Software Access"
        message={`Are you sure you want to remove access to "${softwareToRemove?.software_name}" for ${selectedUser?.full_name}?`}
        confirmText="Remove Access"
        isConfirming={removing}
      />
    </div>
  );
};

export default UserSoftwareAccessPage;
