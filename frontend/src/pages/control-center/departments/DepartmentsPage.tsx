import React, { useState, useEffect } from "react";
import { getDepartments, deleteDepartment } from "../../../api/controlApi";
import PageHeader from "../../../components/common/PageHeader";
import DataTable from "../../../components/common/DataTable";
import Pagination from "../../../components/common/Pagination";
import Button from "../../../components/common/Button";
import Badge from "../../../components/common/Badge";
import Input from "../../../components/common/Input";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import FormError from "../../../components/common/FormError";
import PermissionGuard from "../../../auth/PermissionGuard";
import DepartmentFormModal from "./DepartmentFormModal";
import { Plus, Edit2, Trash2, Search } from "lucide-react";

const DepartmentsPage = () => {
  const [departments, setDepartments] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    page: 1,
    limit: 10,
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    fetchDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page, filters.status]);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getDepartments(filters);
      if (res.success) {
        setDepartments(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load departments");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: any) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 });
    fetchDepartments();
  };

  const openCreateModal = () => {
    setSelectedDepartment(null);
    setIsFormOpen(true);
  };

  const openEditModal = (dept: unknown) => {
    setSelectedDepartment(dept);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    fetchDepartments();
  };

  const confirmDelete = (dept: unknown) => {
    setDepartmentToDelete(dept);
    setDeleteError(null);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!departmentToDelete) return;
    try {
      setIsDeleting(true);
      setDeleteError(null);
      await deleteDepartment(departmentToDelete.id);
      setIsDeleteOpen(false);
      fetchDepartments();
    } catch (err) {
      setDeleteError(
        err.response?.data?.message || "Failed to delete department"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: "Code",
      accessor: "department_code",
      cellClassName: "font-medium text-gray-900",
    },
    {
      header: "Name",
      accessor: "department_name",
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
      cell: (row: unknown) => (
        <Badge variant={row.status === "active" ? "success" : "default"}>
          {row.status}
        </Badge>
      ),
    },
    {
      header: "Actions",
      cellClassName: "text-right",
      cell: (row: unknown) => (
        <div className="flex justify-end space-x-2">
          <PermissionGuard permission="control.department.update">
            <button
              onClick={() => openEditModal(row)}
              className="rounded p-1 text-blue-600 hover:bg-blue-50 hover:text-blue-900"
              title="Edit"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          </PermissionGuard>
          <PermissionGuard permission="control.department.delete">
            <button
              onClick={() => confirmDelete(row)}
              className="rounded p-1 text-red-600 hover:bg-red-50 hover:text-red-900"
              title="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </PermissionGuard>
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-7xl p-6">
      <PageHeader
        title="Departments"
        description="Manage company departments and structural units."
        action={
          <PermissionGuard permission="control.department.create">
            <Button onClick={openCreateModal}>
              <Plus className="mr-2 h-4 w-4" />
              Create Department
            </Button>
          </PermissionGuard>
        }
      />

      <FormError message={error} />

      <div className="mb-6 flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:flex-row">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <Input
            placeholder="Search departments..."
            name="search"
            value={filters.search}
            onChange={(e: any) =>
              setFilters({ ...filters, search: e.target.value })
            }
            className="max-w-md"
          />
          <Button type="submit" variant="secondary" className="px-3">
            <Search className="h-4 w-4" />
          </Button>
        </form>
        <select
          name="status"
          value={filters.status}
          onChange={(e: any) =>
            setFilters({ ...filters, status: e.target.value, page: 1 })
          }
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-900"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={departments}
        loading={loading}
        emptyTitle="No departments found"
      />

      <Pagination
        pagination={pagination}
        onPageChange={(page: unknown) => setFilters({ ...filters, page })}
      />

      <DepartmentFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        department={selectedDepartment}
        onSuccess={handleFormSuccess}
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Department"
        message={
          deleteError ||
          `Are you sure you want to delete department "${departmentToDelete?.department_name}"?`
        }
        confirmText="Delete Department"
        isConfirming={isDeleting}
      />
    </div>
  );
};

export default DepartmentsPage;
