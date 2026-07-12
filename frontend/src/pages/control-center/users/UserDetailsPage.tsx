import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getUserById,
  getUserBranches,
  getUserSoftware,
  getUserAccessMatrix,
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
  Clock,
  User as UserIcon,
  Building2,
  Activity,
  CheckCircle2,
  XCircle,
  Hash,
} from "lucide-react";

const UserDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [branches, setBranches] = useState<any[]>([]);
  const [software, setSoftware] = useState<any[]>([]);
  const [accessMatrix, setAccessMatrix] = useState<any[]>([]);
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

      const [userRes, branchRes, softwareRes, matrixRes] = await Promise.all([
        getUserById(id!),
        getUserBranches(id!),
        getUserSoftware(id!),
        getUserAccessMatrix(id!).catch(() => ({ success: false, data: null })),
      ]);

      if (userRes.success || userRes.data || userRes.id) {
        setUser(userRes.data || userRes);
      }
      if (branchRes && (branchRes.success || branchRes.data || Array.isArray(branchRes))) {
        const bList = Array.isArray(branchRes.data)
          ? branchRes.data
          : branchRes.data?.branches || branchRes.data?.items || (Array.isArray(branchRes) ? branchRes : []);
        setBranches(bList);
      }
      if (softwareRes && (softwareRes.success || softwareRes.data || Array.isArray(softwareRes))) {
        const sList = Array.isArray(softwareRes.data)
          ? softwareRes.data
          : softwareRes.data?.software_modules || softwareRes.data?.items || (Array.isArray(softwareRes) ? softwareRes : []);
        setSoftware(sList);
      }
      if (matrixRes && (matrixRes.success || matrixRes.data || matrixRes.access_matrix || Array.isArray(matrixRes))) {
        const mList =
          matrixRes.access_matrix ||
          matrixRes.data?.access_matrix ||
          (Array.isArray(matrixRes.data) ? matrixRes.data : null) ||
          (Array.isArray(matrixRes) ? matrixRes : []);
        setAccessMatrix(mList);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load user details");
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
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
        <Button variant="secondary" onClick={() => navigate("/control-center/users")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Users
        </Button>
      </div>
    );
  }

  const avatarUrl = user?.profile_image_url || user?.avatar_url;
  const deptName =
    typeof user?.department === "object"
      ? user?.department?.department_name
      : user?.department || "—";
  const desigName =
    typeof user?.designation === "object"
      ? user?.designation?.designation_name
      : user?.designation || "—";
  const defaultBranchName =
    typeof user?.default_branch === "object"
      ? user?.default_branch?.branch_name
      : user?.default_branch || "—";

  return (
    <div className="page-content space-y-6">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Control Center", href: "/control-center/users" },
          { label: "Users", href: "/control-center/users" },
          { label: loading ? "Loading..." : user?.full_name || user?.name || "User Details" },
        ]}
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
          <p className="text-sm text-gray-400">Loading user profile...</p>
        </div>
      ) : (
        <>
          {/* Header Banner & Profile Card */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl ">
            <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <button
                  onClick={() => navigate("/control-center/users")}
                  className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all backdrop-blur-md shrink-0"
                  title="Back to Users"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>

                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={user?.name || "User"}
                    className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl object-cover ring-4 ring-white/20 shadow-2xl shrink-0 bg-slate-800"
                  />
                ) : (
                  <div className="flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-2xl sm:text-3xl font-extrabold text-white shadow-2xl ring-4 ring-white/20 shrink-0">
                    {getInitials(user?.full_name || user?.name)}
                  </div>
                )}

                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                      {user?.full_name || user?.name || "Unnamed User"}
                    </h1>
                    <StatusBadge status={user?.status || "active"} />
                  </div>
                  <p className="text-sm text-indigo-200 mt-1 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 font-mono bg-white/10 px-2 py-0.5 rounded-md text-xs">
                      <Hash className="h-3 w-3" /> {user?.employee_code || "No Code"}
                    </span>
                    <span>•</span>
                    <span className="capitalize font-medium text-white/90">
                      {user?.user_type?.replace(/_/g, " ") || "Company User"}
                    </span>
                    {deptName !== "—" && (
                      <>
                        <span>•</span>
                        <span className="text-indigo-200">{deptName}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2.5 w-full sm:w-auto">
                <PermissionGuard permission="control.user.update">
                  <Button
                    variant="secondary"
                    className="bg-white/10 hover:bg-white/20 text-white border-white/15 backdrop-blur-md"
                    onClick={() => navigate(`/control-center/users/${id}/edit`)}
                  >
                    <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
                  </Button>
                </PermissionGuard>
                <PermissionGuard permission="control.user.change_status">
                  <Button
                    variant="secondary"
                    className="bg-white/10 hover:bg-white/20 text-white border-white/15 backdrop-blur-md"
                    onClick={() => setIsStatusOpen(true)}
                  >
                    <Shield className="w-4 h-4 mr-2" /> Status
                  </Button>
                </PermissionGuard>
                <PermissionGuard permission="control.user.reset_password">
                  <Button
                    variant="secondary"
                    className="bg-white/10 hover:bg-white/20 text-white border-white/15 backdrop-blur-md"
                    onClick={() => setIsPasswordOpen(true)}
                  >
                    <Key className="w-4 h-4 mr-2" /> Password
                  </Button>
                </PermissionGuard>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column — Profile & Modules */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Details Card */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm  ">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4  mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600  ">
                      <UserIcon className="h-4 w-4" />
                    </div>
                    <h2 className="text-base font-semibold text-slate-900 ">
                      Personal & Organization Info
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5 text-indigo-500" /> Email Address
                    </span>
                    <p className="text-sm font-medium text-slate-900  break-all">
                      {user?.email || "—"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5 text-indigo-500" /> Phone Number
                    </span>
                    <p className="text-sm font-medium text-slate-900 ">
                      {user?.phone || "—"}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-indigo-500" /> Department
                    </span>
                    <p className="text-sm font-medium text-slate-900 ">
                      {deptName}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" /> Designation
                    </span>
                    <p className="text-sm font-medium text-slate-900 ">
                      {desigName}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-indigo-500" /> Primary Branch
                    </span>
                    <p className="text-sm font-medium text-slate-900 ">
                      {defaultBranchName}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-indigo-500" /> Account Created
                    </span>
                    <p className="text-sm font-medium text-slate-900 ">
                      {user?.created_at
                        ? new Date(user.created_at).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Assigned Software Modules */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm  ">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4  mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600  ">
                      <Boxes className="h-4 w-4" />
                    </div>
                    <h2 className="text-base font-semibold text-slate-900 ">
                      Assigned Software Modules
                    </h2>
                  </div>
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600  ">
                    {software.length} {software.length === 1 ? "Module" : "Modules"}
                  </span>
                </div>

                {software.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center ">
                    <Boxes className="mx-auto h-8 w-8 text-slate-300  mb-2" />
                    <p className="text-sm font-medium text-slate-500 ">
                      No software modules assigned to this user yet.
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Click "Edit Profile" above to assign modules and permissions.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {software.map((s: any) => (
                      <div
                        key={s.id || s.software_code || s.software_id}
                        className="flex items-center gap-3.5 p-3.5 rounded-xl border border-slate-100 bg-slate-50/70 hover:border-indigo-200 transition-all  "
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm shrink-0">
                          <Boxes className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-900  truncate">
                            {s.software_name || s.name || s.software_code || "Module"}
                          </p>
                          <p className="text-xs text-slate-500 font-mono mt-0.5 truncate">
                            {s.software_code || s.code || "ERP_MODULE"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Roles & Access Matrix */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm  ">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4  mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600  ">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <h2 className="text-base font-semibold text-slate-900 ">
                      Assigned Roles & Access Matrix
                    </h2>
                  </div>
                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600  ">
                    {accessMatrix.length} {accessMatrix.length === 1 ? "Role" : "Roles"}
                  </span>
                </div>

                {accessMatrix.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center ">
                    <ShieldCheck className="mx-auto h-8 w-8 text-slate-300  mb-2" />
                    <p className="text-sm font-medium text-slate-500 ">
                      No roles assigned via access matrix.
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      User currently relies on primary system type ({user?.user_type?.replace(/_/g, " ")}).
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-200/80 text-xs font-semibold uppercase tracking-wider text-slate-400 ">
                          <th className="pb-3 pr-4">Branch</th>
                          <th className="pb-3 pr-4">Software</th>
                          <th className="pb-3 pr-4">Role Assigned</th>
                          <th className="pb-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 ">
                        {accessMatrix.map((item: any, idx: number) => (
                          <tr key={item.id || idx} className="hover:bg-slate-50/50 ">
                            <td className="py-3 pr-4 font-medium text-slate-800 ">
                              {item.branch_name || "All Branches"}
                            </td>
                            <td className="py-3 pr-4 text-slate-600 ">
                              {item.software_name || item.software_code || "—"}
                            </td>
                            <td className="py-3 pr-4">
                              <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700  ">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                {item.role_name || "Assigned Role"}
                              </span>
                            </td>
                            <td className="py-3">
                              <StatusBadge status={item.status || "active"} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column — Branches, Security, Activity */}
            <div className="space-y-6">
              {/* Branch Access Card */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm  ">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4  mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600  ">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <h2 className="text-base font-semibold text-slate-900 ">
                      Assigned Branches
                    </h2>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700  ">
                    {branches.length}
                  </span>
                </div>

                {branches.length === 0 ? (
                  <p className="text-sm text-slate-400 italic py-4 text-center">
                    No branches assigned.
                  </p>
                ) : (
                  <ul className="space-y-2.5">
                    {branches.map((b: any) => {
                      const isDefault =
                        b.is_default ||
                        b.id === user?.default_branch_id ||
                        b.branch_id === user?.default_branch_id;
                      return (
                        <li
                          key={b.id || b.branch_id || b.branch_name}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                            isDefault
                              ? "border-indigo-200 bg-indigo-50/50   font-medium"
                              : "border-slate-100 bg-slate-50/50  "
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <MapPin
                              className={`h-4 w-4 shrink-0 ${
                                isDefault ? "text-indigo-600 " : "text-slate-400"
                              }`}
                            />
                            <div>
                              <p className="text-sm text-slate-800 ">
                                {b.branch_name || b.name || `Branch #${b.branch_id}`}
                              </p>
                              {b.branch_code && (
                                <p className="text-[11px] text-slate-400 font-mono">
                                  {b.branch_code}
                                </p>
                              )}
                            </div>
                          </div>
                          {isDefault && (
                            <span className="rounded-full bg-indigo-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm">
                              Primary
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>

              {/* Security & Authentication Card */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm  ">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4  mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600  ">
                      <Lock className="h-4 w-4" />
                    </div>
                    <h2 className="text-base font-semibold text-slate-900 ">
                      Security & Auth
                    </h2>
                  </div>
                </div>

                <div className="space-y-3.5">
                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm font-medium text-slate-600 ">
                      Login Enabled
                    </span>
                    {user?.login_enabled !== false ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700  ">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700  ">
                        <XCircle className="h-3.5 w-3.5" /> No
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm font-medium text-slate-600 ">
                      Two-Factor Auth (2FA)
                    </span>
                    {user?.two_factor_enabled ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700  ">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Enabled
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600  ">
                        Disabled
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-sm font-medium text-slate-600 ">
                      Force Password Change
                    </span>
                    {user?.force_password_change ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700  ">
                        Required
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600  ">
                        No
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Activity & Login Statistics Card */}
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm  ">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4  mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600  ">
                      <Activity className="h-4 w-4" />
                    </div>
                    <h2 className="text-base font-semibold text-slate-900 ">
                      Login & Activity Stats
                    </h2>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3.5 p-3 rounded-xl bg-slate-50/80 ">
                    <div className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Last Login Time
                      </p>
                      <p className="text-sm font-semibold text-slate-800  mt-0.5">
                        {user?.last_login_at
                          ? new Date(user.last_login_at).toLocaleString()
                          : "Never logged in"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 p-3 rounded-xl bg-slate-50/80 ">
                    <div className="mt-1 h-2.5 w-2.5 rounded-full bg-indigo-500 shrink-0 shadow-[0_0_8px_rgba(99,102,241,0.5)]" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Total Login Count
                      </p>
                      <p className="text-sm font-semibold text-slate-800  mt-0.5">
                        {user?.login_count || 0} {user?.login_count === 1 ? "time" : "times"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5 p-3 rounded-xl bg-slate-50/80 ">
                    <div className="mt-1 h-2.5 w-2.5 rounded-full bg-purple-500 shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Profile Last Updated
                      </p>
                      <p className="text-sm font-semibold text-slate-800  mt-0.5">
                        {user?.updated_at
                          ? new Date(user.updated_at).toLocaleString()
                          : "—"}
                      </p>
                    </div>
                  </div>
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

