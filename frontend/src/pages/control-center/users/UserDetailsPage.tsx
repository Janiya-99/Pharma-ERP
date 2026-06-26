import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getUserById,
  getUserBranches,
  getUserSoftware,
  getDepartments,
  getDesignations,
} from "../../../api/controlApi";
import Breadcrumbs from "../../../components/common/Breadcrumbs";
import Button from "../../../components/common/Button";
import StatusBadge from "../../../components/common/StatusBadge";
import FormError from "../../../components/common/FormError";
import PermissionGuard from "../../../auth/PermissionGuard";
import ChangeUserStatusModal from "./ChangeUserStatusModal";
import ResetPasswordModal from "./ResetPasswordModal";
import {
  ArrowLeft,
  Edit2,
  Shield,
  Key,
  MapPin,
  Boxes,
  ShieldCheck,
  Lock,
  Mail,
  Phone,
  Calendar,
  Clock,
  User as UserIcon,
  Building2,
  Activity,
  FileText,
} from "lucide-react";

const UserDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [software, setSoftware] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [userRes, branchRes, softwareRes] = await Promise.all([
        getUserById(id!),
        getUserBranches(id!),
        getUserSoftware(id!),
      ]);

      if (userRes.success) setUser(userRes.data);
      if (branchRes.success) setBranches(branchRes.data.branches || []);
      if (softwareRes.success) setSoftware(softwareRes.data.software_modules || []);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load user details");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (error || (!loading && !user)) {
    return (
      <div className="page-content">
        <FormError message={error || "User not found"} />
        <Button variant="secondary" onClick={() => navigate("/admin/control-center/users")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Users
        </Button>
      </div>
    );
  }

  return (
    <div className="page-content">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Control Center", href: "/admin/control-center/users" },
          { label: "Users", href: "/admin/control-center/users" },
          { label: loading ? "Loading..." : user?.full_name || "User Details" },
        ]}
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
          <p className="text-sm text-gray-400">Loading user profile...</p>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4 mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/admin/control-center/users")}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="profile-avatar">
                {getInitials(user?.full_name || "U")}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-bold text-gray-900">{user?.full_name}</h1>
                  <StatusBadge status={user?.status} />
                </div>
                <p className="text-sm text-gray-500 mt-0.5">
                  {user?.employee_code || "No employee code"} • {user?.user_type?.replace(/_/g, " ") || "User"}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <PermissionGuard permission="control.user.update">
                <Button
                  variant="secondary"
                  onClick={() => navigate(`/admin/control-center/users/${id}/edit`)}
                >
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
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column — Profile */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Summary Card */}
              <div className="card-premium">
                <div className="card-premium-header">
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-indigo-500" />
                    <h2 className="text-sm font-semibold text-gray-800">User Profile</h2>
                  </div>
                </div>
                <div className="card-premium-body">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8">
                    <div>
                      <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                        <Mail className="h-3 w-3" /> Email Address
                      </p>
                      <p className="text-sm font-medium text-gray-800">{user?.email}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                        <Phone className="h-3 w-3" /> Phone Number
                      </p>
                      <p className="text-sm font-medium text-gray-800">{user?.phone || "—"}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">Department</p>
                      <p className="text-sm font-medium text-gray-800">
                        {user?.department?.department_name || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">Designation</p>
                      <p className="text-sm font-medium text-gray-800">
                        {user?.designation?.designation_name || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1">User Type</p>
                      <p className="text-sm font-medium text-gray-800 capitalize">
                        {user?.user_type?.replace(/_/g, " ") || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-400 uppercase tracking-wide mb-1 flex items-center gap-1.5">
                        <Clock className="h-3 w-3" /> Last Login
                      </p>
                      <p className="text-sm font-medium text-gray-800">
                        {user?.last_login_at
                          ? new Date(user.last_login_at).toLocaleString()
                          : "Never logged in"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Software Access Card */}
              <div className="card-premium">
                <div className="card-premium-header">
                  <div className="flex items-center gap-2">
                    <Boxes className="h-4 w-4 text-indigo-500" />
                    <h2 className="text-sm font-semibold text-gray-800">Software Access</h2>
                  </div>
                  <span className="text-xs text-gray-400">{software.length} modules</span>
                </div>
                <div className="card-premium-body">
                  {software.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No software modules assigned.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {software.map((s: any) => (
                        <div
                          key={s.id}
                          className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50"
                        >
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 shrink-0">
                            <Boxes className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{s.software_name}</p>
                            <p className="text-[11px] text-gray-400">{s.software_code || "Module"}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Roles & Permissions Card */}
              <div className="card-premium">
                <div className="card-premium-header">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-indigo-500" />
                    <h2 className="text-sm font-semibold text-gray-800">Roles & Permissions</h2>
                  </div>
                </div>
                <div className="card-premium-body">
                  <div className="flex items-center gap-2 py-3">
                    <span className="text-sm text-gray-600">Primary Role:</span>
                    <span className="badge-status badge-active capitalize">
                      {user?.user_type?.replace(/_/g, " ") || "User"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    Detailed role-permission breakdown is available in the edit view.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Branch Access */}
              <div className="card-premium">
                <div className="card-premium-header">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-indigo-500" />
                    <h2 className="text-sm font-semibold text-gray-800">Branch Access</h2>
                  </div>
                  <span className="text-xs text-gray-400">{branches.length}</span>
                </div>
                <div className="p-4">
                  {branches.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">No branches assigned.</p>
                  ) : (
                    <ul className="space-y-2">
                      {branches.map((b: any) => (
                        <li
                          key={b.id}
                          className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-gray-50 border border-gray-100"
                        >
                          <div className="flex items-center gap-2.5">
                            <MapPin className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-sm font-medium text-gray-700">{b.branch_name}</span>
                          </div>
                          {b.id === user?.default_branch_id && (
                            <span className="text-[9px] font-bold uppercase tracking-wide text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-full">
                              Primary
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Security Card */}
              <div className="card-premium">
                <div className="card-premium-header">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-indigo-500" />
                    <h2 className="text-sm font-semibold text-gray-800">Security</h2>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Login Enabled</span>
                    <span className={`badge-status ${user?.login_enabled !== false ? "badge-active" : "badge-inactive"}`}>
                      {user?.login_enabled !== false ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Two-Factor Auth</span>
                    <span className={`badge-status ${user?.two_factor_enabled ? "badge-active" : "badge-inactive"}`}>
                      {user?.two_factor_enabled ? "Enabled" : "Disabled"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Created</span>
                    <span className="text-xs text-gray-500">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="card-premium">
                <div className="card-premium-header">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-indigo-500" />
                    <h2 className="text-sm font-semibold text-gray-800">Recent Activity</h2>
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 h-2 w-2 rounded-full bg-emerald-400 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-700 font-medium">Last login</p>
                        <p className="text-[11px] text-gray-400">
                          {user?.last_login_at
                            ? new Date(user.last_login_at).toLocaleString()
                            : "Never"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="mt-1 h-2 w-2 rounded-full bg-gray-300 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-700 font-medium">Account created</p>
                        <p className="text-[11px] text-gray-400">
                          {user?.created_at
                            ? new Date(user.created_at).toLocaleString()
                            : "—"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="mt-1 h-2 w-2 rounded-full bg-gray-300 shrink-0" />
                      <div>
                        <p className="text-xs text-gray-700 font-medium">Last updated</p>
                        <p className="text-[11px] text-gray-400">
                          {user?.updated_at
                            ? new Date(user.updated_at).toLocaleString()
                            : "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Audit History */}
              <div className="card-premium">
                <div className="card-premium-header">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-indigo-500" />
                    <h2 className="text-sm font-semibold text-gray-800">Audit History</h2>
                  </div>
                  <button
                    onClick={() => navigate("/admin/control-center/audit-logs")}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    View All
                  </button>
                </div>
                <div className="p-4">
                  <p className="text-xs text-gray-400 italic text-center py-4">
                    Audit history will appear here once actions are performed
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Modals */}
      {isStatusOpen && (
        <ChangeUserStatusModal
          isOpen={isStatusOpen}
          onClose={() => setIsStatusOpen(false)}
          user={user}
          onSuccess={() => {
            setIsStatusOpen(false);
            fetchData();
          }}
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
