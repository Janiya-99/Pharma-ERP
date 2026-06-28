import React, { useState, useEffect } from "react";
import { getDesignations, deleteDesignation } from "../../../api/controlApi";
import PageHeader from "../../../components/common/PageHeader";
import DataTable from "../../../components/common/DataTable";
import Pagination from "../../../components/common/Pagination";
import Button from "../../../components/common/Button";
import Badge from "../../../components/common/Badge";
import Input from "../../../components/common/Input";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import FormError from "../../../components/common/FormError";
import PermissionGuard from "../../../auth/PermissionGuard";
import DesignationFormModal from "./DesignationFormModal";
import { Plus, Edit2, Trash2, Search } from "lucide-react";

const DesignationsPage = () => {
  const [designations, setDesignations] = useState([]);
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
  const [selectedDesignation, setSelectedDesignation] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [designationToDelete, setDesignationToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    fetchDesignations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page, filters.status]);

  const fetchDesignations = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getDesignations(filters);
      if (res.success) {
        setDesignations(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load designations");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: any) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 });
    fetchDesignations();
  };

  const openCreateModal = () => {
    setSelectedDesignation(null);
    setIsFormOpen(true);
  };

  const openEditModal = (desig: unknown) => {
    setSelectedDesignation(desig);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    fetchDesignations();
  };

  const confirmDelete = (desig: unknown) => {
    setDesignationToDelete(desig);
    setDeleteError(null);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!designationToDelete) return;
    try {
      setIsDeleting(true);
      setDeleteError(null);
      await deleteDesignation(designationToDelete.id);
      setIsDeleteOpen(false);
      fetchDesignations();
    } catch (err) {
      setDeleteError(
        err.response?.data?.message || "Failed to delete designation"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: "Name",
      accessor: "designation_name",
      cellClassName: "font-medium text-gray-900",
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
          <PermissionGuard permission="control.designation.update">
            <button
              onClick={() => openEditModal(row)}
              className="rounded p-1 text-blue-600 hover:bg-blue-50 hover:text-blue-900"
              title="Edit"
            >
              <Edit2 className="h-4 w-4" />
            </button>
          </PermissionGuard>
          <PermissionGuard permission="control.designation.delete">
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
        title="Designations"
        description="Manage company job titles and designations."
        action={
          <PermissionGuard permission="control.designation.create">
            <Button onClick={openCreateModal}>
              <Plus className="mr-2 h-4 w-4" />
              Create Designation
            </Button>
          </PermissionGuard>
        }
      />

      <FormError message={error} />

      <div className="mb-6 flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-4 shadow-sm sm:flex-row">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <Input
            placeholder="Search designations..."
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
        data={designations}
        loading={loading}
        emptyTitle="No designations found"
      />

      <Pagination
        pagination={pagination}
        onPageChange={(page: unknown) => setFilters({ ...filters, page })}
      />

      <DesignationFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        designation={selectedDesignation}
        onSuccess={handleFormSuccess}
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Designation"
        message={
          deleteError ||
          `Are you sure you want to delete designation "${designationToDelete?.designation_name}"?`
        }
        confirmText="Delete Designation"
        isConfirming={isDeleting}
      />
    </div>
  );
};

export default DesignationsPage;
