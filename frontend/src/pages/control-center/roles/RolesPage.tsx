import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getRoles,
  deleteRole,
  getSoftwareModules,
} from "../../../api/controlApi";
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
import RoleFormModal from "./RoleFormModal";
import { Plus, Search, Edit2, Shield, Trash2 } from "lucide-react";

const RolesPage = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [softwareModules, setSoftwareModules] = useState([]);

  const [filters, setFilters] = useState({
    search: "",
    software_id: "",
    status: "",
    page: 1,
    limit: 10,
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    fetchRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page, filters.software_id, filters.status]);

  useEffect(() => {
    fetchSoftwareModules();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getRoles(filters);
      if (res.success) {
        setRoles(res.data.items || res.data);
        setPagination(res.meta || res.pagination);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load roles");
    } finally {
      setLoading(false);
    }
  };

  const fetchSoftwareModules = async () => {
    try {
      const res = await getSoftwareModules();
      if (res.success) setSoftwareModules(res.data.items || res.data);
    } catch (err) {
      console.error("Failed to fetch software modules", err);
    }
  };

  const handleSearch = (e: any) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 });
    fetchRoles();
  };

  const handleFilterChange = (e: any) => {
    setFilters({ ...filters, [e.target.name]: e.target.value, page: 1 });
  };

  const openCreateModal = () => {
    setSelectedRole(null);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    fetchRoles();
  };

  const confirmDelete = (role: unknown) => {
    setRoleToDelete(role);
    setDeleteError(null);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!roleToDelete) return;
    try {
      setIsDeleting(true);
      setDeleteError(null);
      const res = await deleteRole(roleToDelete.id);
      if (res.success) {
        setIsDeleteOpen(false);
        fetchRoles();
      } else {
        setDeleteError(res.message);
      }
    } catch (err) {
      setDeleteError(err.response?.data?.message || "Failed to delete role");
    } finally {
      setIsDeleting(false);
    }
  };

  const getRowActions = (row: unknown) => {
    const actions = [
      {
        label: "Manage Permissions",
        icon: Shield,
        permission: "control.permission.assign",
        onClick: (r: any) =>
          navigate(
            `/control-center/roles-permissions?tab=matrix&software_id=${r.software_id}&role_id=${r.id}`
          ),
      },
      {
        label: "Edit Role",
        icon: Edit2,
        permission: "control.role.update",
        onClick: (r: unknown) => {
          setSelectedRole(r);
          setIsFormOpen(true);
        },
      },
    ];

    if (!row.is_system) {
      actions.push({
        label: "Delete Role",
        icon: Trash2,
        permission: "control.role.delete",
        danger: true,
        onClick: (r: unknown) => confirmDelete(r),
      });
    }

    return actions;
  };

  const columns = [
    {
      header: "Software",
      accessor: "software_id",
      cell: (row: any) =>
        row.software_name ||
        row.software?.software_name ||
        row.software_module?.software_name ||
        (row.software_code
          ? row.software_code
              .replace(/_/g, " ")
              .toLowerCase()
              .replace(/\b\w/g, (c: string) => c.toUpperCase())
          : "-"),
    },
    {
      header: "Role Name",
      accessor: "role_name",
      cellClassName: "font-medium text-gray-900",
      cell: (row: unknown) => (
        <div className="flex items-center gap-2">
          {row.role_name}
          {row.is_system && (
            <span className="inline-flex items-center rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
              System
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Role Code",
      accessor: "role_code",
    },
    {
      header: "Description",
      accessor: "description",
      cell: (row: unknown) => (
        <span className="block max-w-xs truncate text-gray-500">
          {row.description || "-"}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (row: unknown) => <StatusBadge status={row.status} />,
    },
    {
      header: "Actions",
      cellClassName: "text-right",
      cell: (row: unknown) => (
        <ActionMenu actions={getRowActions(row)} item={row} />
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl p-6">
      <PageHeader
        title="Roles"
        description="Manage system roles and their properties."
        action={
          <PermissionGuard permission="control.role.create">
            <Button onClick={openCreateModal}>
              <Plus className="mr-2 h-4 w-4" />
              Create Role
            </Button>
          </PermissionGuard>
        }
      />

      <FormError message={error} />

      <div className="mb-6 flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:flex-row">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <Input
            placeholder="Search roles..."
            name="search"
            value={filters.search}
            onChange={(e: any) =>
              setFilters({ ...filters, search: e.target.value })
            }
            className="w-full sm:max-w-md"
          />
          <Button type="submit" variant="secondary" className="px-3">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        <div className="flex flex-wrap gap-2">
          <select
            name="software_id"
            value={filters.software_id}
            onChange={handleFilterChange}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
          >
            <option value="">All Software Modules</option>
            {softwareModules.map((s: unknown) => (
              <option key={s.id} value={s.id}>
                {s.software_name}
              </option>
            ))}
          </select>

          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={roles}
        loading={loading}
        emptyTitle="No roles found"
      />

      <Pagination
        pagination={pagination}
        onPageChange={(page: unknown) => setFilters({ ...filters, page })}
      />

      {isFormOpen && (
        <RoleFormModal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          role={selectedRole}
          onSuccess={handleFormSuccess}
          softwareModules={softwareModules}
        />
      )}

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Role"
        message={
          deleteError ||
          `Are you sure you want to delete the role "${roleToDelete?.role_name}"?`
        }
        confirmText="Delete Role"
        isConfirming={isDeleting}
      />
    </div>
  );
};

export default RolesPage;
