import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUsers, deleteUser, getDepartments, getDesignations } from "../../../api/controlApi";
import PageHeader from "../../../components/common/PageHeader";
import DataTable from "../../../components/common/DataTable";
import Pagination from "../../../components/common/Pagination";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import FormError from "../../../components/common/FormError";
import PermissionGuard from "../../../auth/PermissionGuard";
import StatusBadge from "../../../components/common/StatusBadge";
import ActionMenu from "../../../components/common/ActionMenu";
import UserFormModal from "./UserFormModal";
import ChangeUserStatusModal from "./ChangeUserStatusModal";
import ResetPasswordModal from "./ResetPasswordModal";
import { Plus, Search, Edit2, Eye, Key, Shield, Trash2 } from "lucide-react";

const UsersPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);

  const [filters, setFilters] = useState({
    search: "",
    department_id: "",
    designation_id: "",
    user_type: "",
    status: "",
    page: 1,
    limit: 10,
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page, filters.department_id, filters.designation_id, filters.user_type, filters.status]);

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
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const fetchDropdowns = async () => {
    try {
      const [deptRes, desigRes] = await Promise.all([
        getDepartments({ limit: 100 }),
        getDesignations({ limit: 100 })
      ]);
      if (deptRes.success) setDepartments(deptRes.data.items || deptRes.data);
      if (desigRes.success) setDesignations(desigRes.data.items || desigRes.data);
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

  const openCreateModal = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setIsStatusOpen(false);
    setIsPasswordOpen(false);
    fetchUsers();
  };

  const confirmDelete = (user: unknown) => {
    setUserToDelete(user);
    setDeleteError(null);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    try {
      setIsDeleting(true);
      setDeleteError(null);
      const res = await deleteUser(userToDelete.id);
      if (res.success) {
        setIsDeleteOpen(false);
        fetchUsers();
      } else {
        setDeleteError(res.message);
      }
    } catch (err) {
      setDeleteError(err.response?.data?.message || "Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  const getRowActions = (row: unknown) => [
    {
      label: "View Profile",
      icon: Eye,
      permission: "control.user.view",
      onClick: (r: unknown) => navigate(`/control-center/users/${r.id}`),
    },
    {
      label: "Edit User",
      icon: Edit2,
      permission: "control.user.update",
      onClick: (r: unknown) => {
        setSelectedUser(r);
        setIsFormOpen(true);
      },
    },
    {
      label: "Change Status",
      icon: Shield,
      permission: "control.user.change_status",
      onClick: (r: unknown) => {
        setSelectedUser(r);
        setIsStatusOpen(true);
      },
    },
    {
      label: "Reset Password",
      icon: Key,
      permission: "control.user.reset_password",
      onClick: (r: unknown) => {
        setSelectedUser(r);
        setIsPasswordOpen(true);
      },
    },
    {
      label: "Delete User",
      icon: Trash2,
      permission: "control.user.delete",
      danger: true,
      onClick: (r: unknown) => confirmDelete(r),
    },
  ];

  const columns = [
    {
      header: "Code",
      accessor: "employee_code",
      cellClassName: "font-medium text-gray-900",
    },
    {
      header: "Name",
      accessor: "full_name",
    },
    {
      header: "Email",
      accessor: "email",
    },
    {
      header: "Phone",
      accessor: "phone",
    },
    {
      header: "Department",
      accessor: "department_id",
      cell: (row: unknown) => row.department?.department_name || row.department_id || "-",
    },
    {
      header: "Designation",
      accessor: "designation_id",
      cell: (row: unknown) => row.designation?.designation_name || row.designation_id || "-",
    },
    {
      header: "User Type",
      accessor: "user_type",
      cellClassName: "capitalize",
    },
    {
      header: "Status",
      cell: (row: unknown) => <StatusBadge status={row.status} />,
    },
    {
      header: "Actions",
      cellClassName: "text-right",
      cell: (row: unknown) => <ActionMenu actions={getRowActions(row)} item={row} />,
    },
  ];

  return (
    <div className="page-content">
      <PageHeader
        title="Users"
        description="Manage system users, access, and permissions."
        action={
          <PermissionGuard permission="control.user.create">
            <Button onClick={openCreateModal}>
              <Plus className="w-4 h-4 mr-2" />
              Create User
            </Button>
          </PermissionGuard>
        }
      />

      <FormError message={error} />

      <div className="filter-bar">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-0">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
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
          <select name="department_id" value={filters.department_id} onChange={handleFilterChange} className="select-premium">
            <option value="">All Departments</option>
            {departments.map((d: any) => <option key={d.id} value={d.id}>{d.department_name}</option>)}
          </select>
          <select name="designation_id" value={filters.designation_id} onChange={handleFilterChange} className="select-premium">
            <option value="">All Designations</option>
            {designations.map((d: any) => <option key={d.id} value={d.id}>{d.designation_name}</option>)}
          </select>
          <select name="user_type" value={filters.user_type} onChange={handleFilterChange} className="select-premium">
            <option value="">All Types</option>
            <option value="super_admin">Super Admin</option>
            <option value="company_admin">Company Admin</option>
            <option value="company_user">Company User</option>
            <option value="viewer">Viewer</option>
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

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        emptyTitle="No users found"
      />

      <Pagination
        pagination={pagination}
        onPageChange={(page: unknown) => setFilters({ ...filters, page })}
      />

      {isFormOpen && (
        <UserFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          user={selectedUser}
          onSuccess={handleFormSuccess}
          departments={departments}
          designations={designations}
        />
      )}

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
          `Are you sure you want to delete user "${userToDelete?.full_name}"?`
        }
        confirmText="Delete User"
        isConfirming={isDeleting}
      />
    </div>
  );
};

export default UsersPage;
