import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
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

interface User {
  id: number;
  name: string;
  email: string;
  status: string;
  user_type?: string;
  primary_role?: {
    id: number;
    role_name: string;
  };
  department?: {
    id: number;
    department_name: string;
  };
  last_login_at?: string;
}

const UsersPage = () => {
  const navigate = useNavigate();

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

  const [searchVal, setSearchVal] = useState("");
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data: dropdownsData } = useQuery({
    queryKey: ["userDropdowns"],
    queryFn: async () => {
      const [deptRes, desigRes, branchRes, rolesRes, softwareRes] = await Promise.all([
        getDepartments({ limit: 100 }),
        getDesignations({ limit: 100 }),
        getBranches({ limit: 100 }),
        getRoles({ limit: 100 }),
        getSoftwareModules(),
      ]);
      return {
        departments: deptRes.data?.items || deptRes.data || [],
        designations: desigRes.data?.items || desigRes.data || [],
        branches: branchRes.data?.items || branchRes.data || [],
        roles: rolesRes.data?.items || rolesRes.data || [],
        softwareModules: softwareRes.data?.items || softwareRes.data || [],
      };
    },
  });

  const departments = dropdownsData?.departments || [];
  const designations = dropdownsData?.designations || [];
  const branches = dropdownsData?.branches || [];
  const roles = dropdownsData?.roles || [];
  const softwareModules = dropdownsData?.softwareModules || [];

  const { data: usersData, isLoading: usersLoading, error, refetch } = useQuery({
    queryKey: ["users", filters],
    queryFn: async () => {
      const res = await getUsers(filters);
      if (res.success === false) {
        throw new Error(res.message || "Failed to load users");
      }
      return res;
    },
  });

  const users = usersData?.data?.items || usersData?.data || [];
  const pagination = usersData?.meta || usersData?.pagination || null;

  const handleSearch = (e: any) => {
    e.preventDefault();
    setFilters({ ...filters, search: searchVal, page: 1 });
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
      onClick: (r: any) => navigate(`/control-center/users/${r.id}`),
    },
    {
      label: "Edit User",
      icon: Edit2,
      permission: "control.user.update",
      onClick: (r: any) => navigate(`/control-center/users/${r.id}/edit`),
    },
    {
      label: "Manage Access",
      icon: UserCog,
      permission: "control.user.update",
      onClick: (r: any) => navigate(`/control-center/users/${r.id}/edit`),
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
      cell: (row: any) => {
        return row.designation?.designation_name || row.designation_id || "—";
      },
    },
    {
      header: "Department",
      cell: (row: any) => {
        return row.department?.department_name || row.department_id || "—";
      },
    },
    {
      header: "Primary Role",
      cell: (row: any) => {
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
      cell: (row: any) => <StatusBadge status={row.status} />,
    },
    {
      header: "Last Login",
      cell: (row: any) => {
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
      cell: (row: any) => <ActionMenu actions={getRowActions(row)} item={row} />,
    },
  ];

  return (
    <div className="page-content">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: "Control Center", href: "/control-center/users" },
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
          <Button variant="secondary" size="sm" onClick={() => refetch()}>
            <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
            Refresh
          </Button>
          <Button variant="secondary" size="sm">
            <Download className="w-3.5 h-3.5 mr-1.5" />
            Export
          </Button>
          <PermissionGuard permission="control.user.create">
            <Button onClick={() => navigate("/control-center/users/create")}>
              <Plus className="w-4 h-4 mr-1.5" />
              Create User
            </Button>
          </PermissionGuard>
        </div>
      </div>

      <FormError message={error instanceof Error ? error.message : null} />

      {/* Filter Bar */}
      <div className="filter-bar">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-0">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or code..."
              name="search"
              value={searchVal}
              onChange={(e: any) => setSearchVal(e.target.value)}
              className="input-premium pl-9"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            <Search className="w-3.5 h-3.5" />
          </Button>
        </form>

        <div className="flex flex-wrap gap-2">
          <Select value={filters.branch_id || "all"} onValueChange={(val) => setFilters({ ...filters, branch_id: val === "all" ? "" : val, page: 1 })}>
            <SelectTrigger className="w-[150px] h-[38px] bg-white border-gray-200">
              <SelectValue placeholder="All Branches" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All Branches</SelectItem>
              {branches.map((b: any) => <SelectItem key={b.id} value={b.id.toString()}>{b.branch_name}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={filters.software_id || "all"} onValueChange={(val) => setFilters({ ...filters, software_id: val === "all" ? "" : val, page: 1 })}>
            <SelectTrigger className="w-[150px] h-[38px] bg-white border-gray-200">
              <SelectValue placeholder="All Modules" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All Modules</SelectItem>
              {softwareModules.map((s: any) => <SelectItem key={s.id} value={s.id.toString()}>{s.software_name}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={filters.role_id || "all"} onValueChange={(val) => setFilters({ ...filters, role_id: val === "all" ? "" : val, page: 1 })}>
            <SelectTrigger className="w-[140px] h-[38px] bg-white border-gray-200">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All Roles</SelectItem>
              {roles.map((r: any) => <SelectItem key={r.id} value={r.id.toString()}>{r.role_name || r.name}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={filters.department_id || "all"} onValueChange={(val) => setFilters({ ...filters, department_id: val === "all" ? "" : val, page: 1 })}>
            <SelectTrigger className="w-[160px] h-[38px] bg-white border-gray-200">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((d: any) => <SelectItem key={d.id} value={d.id.toString()}>{d.department_name}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={filters.designation_id || "all"} onValueChange={(val) => setFilters({ ...filters, designation_id: val === "all" ? "" : val, page: 1 })}>
            <SelectTrigger className="w-[160px] h-[38px] bg-white border-gray-200">
              <SelectValue placeholder="All Designations" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All Designations</SelectItem>
              {designations.map((d: any) => <SelectItem key={d.id} value={d.id.toString()}>{d.designation_name}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={filters.status || "all"} onValueChange={(val) => setFilters({ ...filters, status: val === "all" ? "" : val, page: 1 })}>
            <SelectTrigger className="w-[130px] h-[38px] bg-white border-gray-200">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="locked">Locked</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={users}
        loading={usersLoading}
        emptyTitle="No users found"
        emptyDescription="Try adjusting your filters or create a new user"
        onRowClick={(row: any) => navigate(`/control-center/users/${row.id}`)}
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
