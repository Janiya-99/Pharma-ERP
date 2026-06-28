import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import PageHeader from "../../../components/common/PageHeader";
import UserSelector from "../../../components/common/UserSelector";
import AccessMatrixTable from "../../../components/common/AccessMatrixTable";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import FormError from "../../../components/common/FormError";
import PermissionGuard from "../../../auth/PermissionGuard";
import UserAccessMatrixForm from "./UserAccessMatrixForm";
import { getUserAccessMatrix, getUserById, removeUserAccessMatrix } from "../../../api/controlApi";
import { Shield, CheckCircle2 } from "lucide-react";

const UserAccessMatrixPage = () => {
  const [searchParams] = useSearchParams();
  const [selectedUser, setSelectedUser] = useState(null);
  const [accessRecords, setAccessRecords] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const [accessToRemove, setAccessToRemove] = useState(null);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    const userId = searchParams.get("userId");
    if (!userId || selectedUser?.id?.toString() === userId) return;

    const fetchLinkedUser = async () => {
      try {
        setLoading(true);
        const res = await getUserById(userId);
        if (res.success) {
          setSelectedUser(res.data);
        } else {
          setError(res.message || "Unable to load the selected user.");
        }
      } catch (err) {
        setError("Unable to load the selected user.");
      } finally {
        setLoading(false);
      }
    };

    fetchLinkedUser();
  }, [searchParams, selectedUser]);

  useEffect(() => {
    if (selectedUser) {
      fetchAccessMatrix();
      setSuccessMsg(null);
      setError(null);
    } else {
      setAccessRecords([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser]);

  const fetchAccessMatrix = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getUserAccessMatrix(selectedUser.id);
      if (res.success) {
        const records = Array.isArray(res.data)
          ? res.data
          : res.data?.access_matrix || [];
        setAccessRecords(records);
      }
    } catch (err) {
      setError("Failed to fetch user access assignments.");
    } finally {
      setLoading(false);
    }
  };

  const handleAssignSuccess = (msg: unknown) => {
    setSuccessMsg(msg || "Access assigned successfully.");
    fetchAccessMatrix();
  };

  const confirmRemove = (access: unknown) => {
    setAccessToRemove(access);
    setIsRemoveOpen(true);
  };

  const handleRemove = async () => {
    if (!accessToRemove) return;
    
    setRemoving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await removeUserAccessMatrix(selectedUser.id, accessToRemove.id);
      if (res.success) {
        setSuccessMsg("Access removed successfully.");
        setIsRemoveOpen(false);
        fetchAccessMatrix();
      } else {
        setError(res.message || "Failed to remove access.");
      }
    } catch (err) {
      // Show backend errors clearly, including "Cannot remove last active Super Admin access"
      setError(err.response?.data?.message || "Failed to remove access.");
      setIsRemoveOpen(false); // Close dialog to show error
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="User Access"
        description="Assign exact roles to users across specific branches and software modules."
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
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 lg:col-span-1 sticky top-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-4">1. Select User</h2>
          <UserSelector 
            selectedUser={selectedUser} 
            onSelect={setSelectedUser} 
          />
          
          {selectedUser && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                  {(selectedUser.name || selectedUser.full_name || "U").charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{selectedUser.name || selectedUser.full_name}</p>
                  <p className="text-xs text-gray-500">{selectedUser.email}</p>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm text-gray-600">
                <p><span className="font-medium text-gray-700">Code:</span> {selectedUser.employee_code || "N/A"}</p>
                <p><span className="font-medium text-gray-700">Type:</span> <span className="capitalize">{(selectedUser.user_type || "").replace("_", " ")}</span></p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Access Assignment and Table */}
        <div className="lg:col-span-2 space-y-6">
          {selectedUser ? (
            <>
              <PermissionGuard permission="control.access_matrix.assign">
                <UserAccessMatrixForm 
                  user={selectedUser} 
                  onSuccess={handleAssignSuccess} 
                />
              </PermissionGuard>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                  <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-2">
                    <Shield className="w-4 h-4 text-gray-400" /> Current Access
                  </h2>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full font-medium">
                    {accessRecords.length} Records
                  </span>
                </div>
                
                <AccessMatrixTable 
                  data={accessRecords} 
                  loading={loading} 
                  onRemove={confirmRemove} 
                />
              </div>
            </>
          ) : (
            <div className="bg-white p-12 text-center rounded-lg border border-gray-200 shadow-sm text-gray-500 h-full flex flex-col justify-center items-center">
              <Shield className="w-12 h-12 text-gray-300 mb-4" />
              <p className="text-lg font-medium text-gray-900">No User Selected</p>
              <p className="text-sm mt-1 max-w-sm">Please select a user from the list on the left to view or manage their branch, software, and role access.</p>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={isRemoveOpen}
        onClose={() => setIsRemoveOpen(false)}
        onConfirm={handleRemove}
        title="Remove Access Record"
        message={`Are you sure you want to remove the "${accessToRemove?.role_name || accessToRemove?.role?.role_name}" role from ${selectedUser?.name || selectedUser?.full_name} for branch "${accessToRemove?.branch_name || accessToRemove?.branch?.branch_name}" and module "${accessToRemove?.software_name || accessToRemove?.software?.software_name || accessToRemove?.software_module?.software_name}"?`}
        confirmText="Remove Access"
        isConfirming={removing}
      />
    </div>
  );
};

export default UserAccessMatrixPage;
