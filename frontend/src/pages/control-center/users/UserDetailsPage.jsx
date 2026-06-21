import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserById, getUserBranches, getUserSoftware, getDepartments, getDesignations } from "../../../api/controlApi";
import PageHeader from "../../../components/common/PageHeader";
import Button from "../../../components/common/Button";
import StatusBadge from "../../../components/common/StatusBadge";
import FormError from "../../../components/common/FormError";
import PermissionGuard from "../../../auth/PermissionGuard";
import UserFormModal from "./UserFormModal";
import ChangeUserStatusModal from "./ChangeUserStatusModal";
import ResetPasswordModal from "./ResetPasswordModal";
import { ArrowLeft, Edit2, Shield, Key, MapPin, LayoutDashboard, User as UserIcon, Mail, Phone, Calendar, Clock } from "lucide-react";

const UserDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [branches, setBranches] = useState([]);
  const [software, setSoftware] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [userRes, branchRes, softwareRes, deptRes, desigRes] = await Promise.all([
        getUserById(id),
        getUserBranches(id),
        getUserSoftware(id),
        getDepartments({ limit: 100 }),
        getDesignations({ limit: 100 })
      ]);

      if (userRes.success) setUser(userRes.data);
      if (branchRes.success) setBranches(branchRes.data.branches || []);
      if (softwareRes.success) setSoftware(softwareRes.data.software_modules || []);
      if (deptRes.success) setDepartments(deptRes.data.items || deptRes.data);
      if (desigRes.success) setDesignations(desigRes.data.items || desigRes.data);
      
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load user details");
    } finally {
      setLoading(false);
    }
  };

  if (error || (!loading && !user)) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <FormError message={error || "User not found"} />
        <Button variant="secondary" onClick={() => navigate("/control-center/users")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Users
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate("/control-center/users")}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{loading ? "Loading User Details..." : (user?.name || user?.full_name)}</h1>
            <p className="text-sm text-gray-500">Employee Code: {loading ? "..." : (user?.employee_code || "N/A")}</p>
          </div>
        </div>

        {!loading && (
          <div className="flex flex-wrap gap-2">
            <PermissionGuard permission="control.user.update">
              <Button variant="secondary" onClick={() => setIsFormOpen(true)}>
                <Edit2 className="w-4 h-4 mr-2" /> Edit User
              </Button>
            </PermissionGuard>
            
            <PermissionGuard permission="control.user.change_status">
              <Button variant="secondary" onClick={() => setIsStatusOpen(true)}>
                <Shield className="w-4 h-4 mr-2" /> Change Status
              </Button>
            </PermissionGuard>

            <PermissionGuard permission="control.user.reset_password">
              <Button variant="secondary" onClick={() => setIsPasswordOpen(true)}>
                <Key className="w-4 h-4 mr-2" /> Reset Password
              </Button>
            </PermissionGuard>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 flex justify-center items-center lg:col-span-3 min-h-[300px]">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm text-gray-500">Loading user profile and access details...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden lg:col-span-2">
              <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                  <UserIcon className="w-5 h-5 text-gray-500" /> User Profile
                </h2>
                <StatusBadge status={user?.status} />
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                  <div>
                    <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                      <Mail className="w-4 h-4" /> Email Address
                    </p>
                    <p className="font-medium text-gray-900">{user?.email}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                      <Phone className="w-4 h-4" /> Phone Number
                    </p>
                    <p className="font-medium text-gray-900">{user?.phone || "-"}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Department</p>
                    <p className="font-medium text-gray-900">{user?.department?.department_name || "-"}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Designation</p>
                    <p className="font-medium text-gray-900">{user?.designation?.designation_name || "-"}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">User Type</p>
                    <p className="font-medium text-gray-900 capitalize">{user?.user_type?.replace("_", " ") || "-"}</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Last Login
                    </p>
                    <p className="font-medium text-gray-900">
                      {user?.last_login_at ? new Date(user.last_login_at).toLocaleString() : "Never logged in"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Branch Access */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                  <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" /> Branch Access
                  </h2>
                  <PermissionGuard permission="control.access.branch.view">
                    <Button variant="link" onClick={() => navigate("/control-center/user-branch-access")}>
                      Manage
                    </Button>
                  </PermissionGuard>
                </div>
                <div className="p-5">
                  {branches.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No branches assigned.</p>
                  ) : (
                    <ul className="space-y-2">
                      {branches.map(b => (
                        <li key={b.id} className="text-sm flex justify-between items-center bg-gray-50 px-3 py-2 rounded-md">
                          <span className="font-medium text-gray-700">{b.branch_name}</span>
                          {b.id === user?.default_branch_id && (
                            <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">Default</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Software Access */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                  <h2 className="font-semibold text-gray-800 flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4 text-gray-500" /> Software Access
                  </h2>
                  <PermissionGuard permission="control.access.software.view">
                    <Button variant="link" onClick={() => navigate("/control-center/user-software-access")}>
                      Manage
                    </Button>
                  </PermissionGuard>
                </div>
                <div className="p-5">
                  {software.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No software modules assigned.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {software.map(s => (
                        <span key={s.id} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {s.software_name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {isFormOpen && (
        <UserFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          user={user}
          onSuccess={() => { setIsFormOpen(false); fetchData(); }}
          departments={departments}
          designations={designations}
        />
      )}

      {isStatusOpen && (
        <ChangeUserStatusModal
          isOpen={isStatusOpen}
          onClose={() => setIsStatusOpen(false)}
          user={user}
          onSuccess={() => { setIsStatusOpen(false); fetchData(); }}
        />
      )}

      {isPasswordOpen && (
        <ResetPasswordModal
          isOpen={isPasswordOpen}
          onClose={() => setIsPasswordOpen(false)}
          user={user}
          onSuccess={() => setIsPasswordOpen(false)}
        />
      )}
    </div>
  );
};

export default UserDetailsPage;
