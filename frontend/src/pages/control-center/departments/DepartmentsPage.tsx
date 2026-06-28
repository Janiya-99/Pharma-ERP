import { useState, useEffect } from "react";
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
      setDeleteError(err.response?.data?.message || "Failed to delete department");
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
      cell: (row: unknown) => <span className="text-gray-500 truncate block max-w-xs">{row.description || "-"}</span>,
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
              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
              title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </PermissionGuard>
          <PermissionGuard permission="control.department.delete">
            <button
              onClick={() => confirmDelete(row)}
              className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </PermissionGuard>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <PageHeader
        title="Departments"
        description="Manage company departments and structural units."
        action={
          <PermissionGuard permission="control.department.create">
            <Button onClick={openCreateModal}>
              <Plus className="w-4 h-4 mr-2" />
              Create Department
            </Button>
          </PermissionGuard>
        }
      />

      <FormError message={error} />

      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6 flex flex-col sm:flex-row gap-4 shadow-sm">
        <form onSubmit={handleSearch} className="flex-1 flex gap-2">
          <Input
            placeholder="Search departments..."
            name="search"
            value={filters.search}
            onChange={(e: any) => setFilters({ ...filters, search: e.target.value })}
            className="max-w-md"
          />
          <Button type="submit" variant="secondary" className="px-3">
            <Search className="w-4 h-4" />
          </Button>
        </form>
        <select
          name="status"
          value={filters.status}
          onChange={(e: any) => setFilters({ ...filters, status: e.target.value, page: 1 })}
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
