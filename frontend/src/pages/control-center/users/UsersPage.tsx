import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getUsers,
  deleteUser,
  getDepartments,
  getDesignations,
  getBranches,
  getRoles,
  getSoftwareModules,
} from "../../../api/controlApi";
import Breadcrumbs from "../../../components/common/Breadcrumbs";
import DataTable from "../../../components/common/DataTable";
import Pagination from "../../../components/common/Pagination";
import Button from "../../../components/common/Button";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import FormError from "../../../components/common/FormError";
import PermissionGuard from "../../../auth/PermissionGuard";
import StatusBadge from "../../../components/common/StatusBadge";
import ActionMenu from "../../../components/common/ActionMenu";
import ChangeUserStatusModal from "./ChangeUserStatusModal";
import ResetPasswordModal from "./ResetPasswordModal";
import {
  Plus,
  Search,
  Edit2,
  Eye,
  Key,
  Shield,
  Trash2,
  Download,
  RefreshCw,
  UserCog,
} from "lucide-react";

const UsersPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [branches, setBranches] = useState([]);
  const [roles, setRoles] = useState([]);
  const [softwareModules, setSoftwareModules] = useState([]);

  const [filters, setFilters] = useState({
    search: "",
    department_id: "",
    designation_id: "",
    branch_id: "",
    role_id: "",
    software_id: "",
    status: "",
    page: 1,
    limit: 10,
  });

  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page, filters.department_id, filters.designation_id, filters.status, filters.branch_id, filters.role_id, filters.software_id]);

  useEffect(() => {
    fetchDropdowns();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getUsers(filters);
      if (res.success) {
        setUsers(res.data.items || res.data);
        setPagination(res.meta || res.pagination);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const [deptRes, desigRes, branchRes, rolesRes, softwareRes] = await Promise.all([
        getDepartments({ limit: 100 }),
        getDesignations({ limit: 100 }),
        getBranches({ limit: 100 }),
        getRoles({ limit: 100 }),
        getSoftwareModules(),
      ]);
      if (deptRes.success) setDepartments(deptRes.data.items || deptRes.data);
      if (desigRes.success) setDesignations(desigRes.data.items || desigRes.data);
      if (branchRes.success) setBranches(branchRes.data.items || branchRes.data);
      if (rolesRes.success) setRoles(rolesRes.data.items || rolesRes.data);
      if (softwareRes.success) setSoftwareModules(softwareRes.data.items || softwareRes.data || []);
    } catch (err) {
      console.error("Failed to fetch dropdowns", err);
    }
  };

  const handleSearch = (e: any) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 });
    fetchUsers();
  };

  const handleFilterChange = (e: any) => {
    setFilters({ ...filters, [e.target.name]: e.target.value, page: 1 });
  };

  const handleFormSuccess = () => {
    setIsStatusOpen(false);
    setIsPasswordOpen(false);
    fetchUsers();
  };

  const confirmDelete = (user: any) => {
    setUserToDelete(user);
    setDeleteError(null);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      setIsDeleting(true);
      setDeleteError(null);
      const res = await deleteUser((userToDelete as any).id);
      if (res.success) {
        setIsDeleteOpen(false);
        fetchUsers();
      } else {
        setDeleteError(res.message);
      }
    } catch (err: any) {
      setDeleteError(err.response?.data?.message || "Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  const getRowActions = (row: any) => [
    {
      label: "View Profile",
      icon: Eye,
      permission: "control.user.view",
      onClick: (r: any) => navigate(`/admin/control-center/users/${r.id}`),
    },
    {
      label: "Edit User",
      icon: Edit2,
      permission: "control.user.update",
      onClick: (r: any) => navigate(`/admin/control-center/users/${r.id}/edit`),
    },
    {
      label: "Manage Access",
      icon: UserCog,
      permission: "control.user.update",
      onClick: (r: any) => navigate(`/admin/control-center/users/${r.id}/edit`),
    },
    {
      label: "Change Status",
      icon: Shield,
      permission: "control.user.change_status",
      onClick: (r: any) => {
        setSelectedUser(r);
        setIsStatusOpen(true);
      },
    },
    {
      label: "Reset Password",
      icon: Key,
      permission: "control.user.reset_password",
      onClick: (r: any) => {
        setSelectedUser(r);
        setIsPasswordOpen(true);
      },
    },
    {
      label: "Delete User",
      icon: Trash2,
      permission: "control.user.delete",
      danger: true,
      onClick: (r: any) => confirmDelete(r),
    },
  ];

  const columns = [
    {
      header: "User Code",
      accessor: "employee_code",
      cellClassName: "font-mono text-xs text-indigo-600 font-semibold",
    },
    {
      header: "Full Name",
      accessor: "full_name",
      cellClassName: "font-semibold text-gray-900",
    },
    {
      header: "Email",
      accessor: "email",
      cellClassName: "text-gray-600",
    },
    {
      header: "Phone",
      accessor: "phone",
    },
    {
      header: "Designation",
      cell: (info: any) => {
        const row = info.row.original;
        return row.designation?.designation_name || row.designation_id || "—";
      },
    },
    {
      header: "Department",
      cell: (info: any) => {
        const row = info.row.original;
        return row.department?.department_name || row.department_id || "—";
      },
    },
    {
      header: "Primary Role",
      cell: (info: any) => {
        const row = info.row.original;
        const role = row.primary_role || row.user_type;
        return (
          <span className="text-xs font-medium text-gray-600 capitalize">
            {role?.replace(/_/g, " ") || "—"}
          </span>
        );
      },
    },
    {
      header: "Status",
      cell: (info: any) => <StatusBadge status={info.row.original.status} />,
    },
    {
      header: "Last Login",
      cell: (info: any) => {
        const row = info.row.original;
        if (!row.last_login_at) return <span className="text-xs text-gray-400">Never</span>;
        return (
          <span className="text-xs text-gray-500">
            {new Date(row.last_login_at).toLocaleDateString()}
          </span>
        );
      },
    },
    {
      header: "",
      id: "actions",
      cellClassName: "text-right",
      cell: (info: any) => <ActionMenu actions={getRowActions(info.row.original)} item={info.row.original} />,
    },
  ];

  return (
    <div className="page-content">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Control Center", href: "/admin/control-center/users" },
          { label: "User & Access Center" },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">User & Access Center</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage system users, access controls, and permissions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={fetchUsers}>
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Refresh
          </Button>
          <Button variant="secondary" size="sm">
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export
          </Button>
          <PermissionGuard permission="control.user.create">
            <Button onClick={() => navigate("/admin/control-center/users/create")}>
              <Plus className="w-4 h-4 mr-1.5" />
              Create User
            </Button>
          </PermissionGuard>
        </div>
      </div>

      <FormError message={error} />

      {/* Filter Bar */}
      <div className="filter-bar">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-0">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or code..."
              name="search"
              value={filters.search}
              onChange={(e: any) => setFilters({ ...filters, search: e.target.value })}
              className="input-premium pl-9"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            <Search className="w-3.5 h-3.5" />
          </Button>
        </form>

        <div className="flex flex-wrap gap-2">
          <select name="branch_id" value={filters.branch_id} onChange={handleFilterChange} className="select-premium">
            <option value="">All Branches</option>
            {branches.map((b: any) => <option key={b.id} value={b.id}>{b.branch_name}</option>)}
          </select>
          <select name="software_id" value={filters.software_id} onChange={handleFilterChange} className="select-premium">
            <option value="">All Modules</option>
            {softwareModules.map((s: any) => <option key={s.id} value={s.id}>{s.software_name}</option>)}
          </select>
          <select name="role_id" value={filters.role_id} onChange={handleFilterChange} className="select-premium">
            <option value="">All Roles</option>
            {roles.map((r: any) => <option key={r.id} value={r.id}>{r.role_name || r.name}</option>)}
          </select>
          <select name="department_id" value={filters.department_id} onChange={handleFilterChange} className="select-premium">
            <option value="">All Departments</option>
            {departments.map((d: any) => <option key={d.id} value={d.id}>{d.department_name}</option>)}
          </select>
          <select name="designation_id" value={filters.designation_id} onChange={handleFilterChange} className="select-premium">
            <option value="">All Designations</option>
            {designations.map((d: any) => <option key={d.id} value={d.id}>{d.designation_name}</option>)}
          </select>
          <select name="status" value={filters.status} onChange={handleFilterChange} className="select-premium">
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
            <option value="locked">Locked</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        emptyTitle="No users found"
        emptyDescription="Try adjusting your filters or create a new user"
        onRowClick={(row: any) => navigate(`/admin/control-center/users/${row.id}`)}
      />

      <Pagination
        pagination={pagination}
        onPageChange={(page: any) => setFilters({ ...filters, page })}
      />

      {/* Modals */}
      {isStatusOpen && (
        <ChangeUserStatusModal
          isOpen={isStatusOpen}
          onClose={() => setIsStatusOpen(false)}
          user={selectedUser}
          onSuccess={handleFormSuccess}
        />
      )}

      {isPasswordOpen && (
        <ResetPasswordModal
          isOpen={isPasswordOpen}
          onClose={() => setIsPasswordOpen(false)}
          user={selectedUser}
          onSuccess={handleFormSuccess}
        />
      )}

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete User"
        message={
          deleteError ||
          `Are you sure you want to delete user "${(userToDelete as any)?.full_name}"?`
        }
        confirmText="Delete User"
        isConfirming={isDeleting}
      />
    </div>
  );
};

export default UsersPage;
