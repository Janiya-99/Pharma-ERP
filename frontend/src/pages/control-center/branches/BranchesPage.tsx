import React, { useState, useEffect } from "react";
import { getBranches, deleteBranch } from "../../../api/controlApi";
import PageHeader from "../../../components/common/PageHeader";
import DataTable from "../../../components/common/DataTable";
import Pagination from "../../../components/common/Pagination";
import Button from "../../../components/common/Button";
import Badge from "../../../components/common/Badge";
import Input from "../../../components/common/Input";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import FormError from "../../../components/common/FormError";
import PermissionGuard from "../../../auth/PermissionGuard";
import BranchFormModal from "./BranchFormModal";
import { Plus, Edit2, Trash2, Search } from "lucide-react";

const BranchesPage = () => {
  const [branches, setBranches] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    search: "",
    status: "",
    branch_type: "",
    page: 1,
    limit: 10,
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    fetchBranches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page, filters.status, filters.branch_type]);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getBranches(filters);
      if (res.success) {
        setBranches(res.data);
        setPagination(res.pagination);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load branches");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: any) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 });
    fetchBranches();
  };

  const handleFilterChange = (e: any) => {
    setFilters({ ...filters, [e.target.name]: e.target.value, page: 1 });
  };

  const openCreateModal = () => {
    setSelectedBranch(null);
    setIsFormOpen(true);
  };

  const openEditModal = (branch: unknown) => {
    setSelectedBranch(branch);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    fetchBranches();
  };

  const confirmDelete = (branch: unknown) => {
    setBranchToDelete(branch);
    setDeleteError(null);
    setIsDeleteOpen(true);
  };

  const handleDelete = async () => {
    if (!branchToDelete) return;
    try {
      setIsDeleting(true);
      setDeleteError(null);
      await deleteBranch(branchToDelete.id);
      setIsDeleteOpen(false);
      fetchBranches();
    } catch (err) {
      setDeleteError(err.response?.data?.message || "Failed to delete branch");
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: "Code",
      accessor: "branch_code",
      cellClassName: "font-medium text-gray-900",
    },
    {
      header: "Name",
      accessor: "branch_name",
    },
    {
      header: "Type",
      accessor: "branch_type",
    },
    {
      header: "Contact",
      cell: (row: unknown) => (
        <div className="text-sm text-gray-500">
          {row.phone && <div>{row.phone}</div>}
          {row.email && <div>{row.email}</div>}
          {!row.phone && !row.email && "-"}
        </div>
      ),
    },
    {
      header: "Main",
      cell: (row: unknown) => row.is_main_branch ? <Badge variant="info">Yes</Badge> : <span className="text-gray-400">-</span>,
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
        <div className="flex justify-end gap-1">
          <PermissionGuard permission="control.branch.update">
            <button
              onClick={() => openEditModal(row)}
              className="inline-flex items-center justify-center h-7 w-7 rounded-lg text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-colors duration-150"
              title="Edit"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </PermissionGuard>
          <PermissionGuard permission="control.branch.delete">
            <button
              onClick={() => confirmDelete(row)}
              className="inline-flex items-center justify-center h-7 w-7 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors duration-150"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </PermissionGuard>
        </div>
      ),
    },
  ];

  return (
    <div className="page-content">
      <PageHeader
        title="Branches"
        description="Manage company branches, warehouses, and distribution centers."
        action={
          <PermissionGuard permission="control.branch.create">
            <Button onClick={openCreateModal}>
              <Plus className="w-3.5 h-3.5" />
              Create Branch
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
              placeholder="Search branches..."
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
        <select
          name="branch_type"
          value={filters.branch_type}
          onChange={handleFilterChange}
          className="select-premium"
        >
          <option value="">All Types</option>
          <option value="Main Branch">Main Branch</option>
          <option value="Warehouse">Warehouse</option>
          <option value="Sales Branch">Sales Branch</option>
        </select>
        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          className="select-premium"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={branches}
        loading={loading}
        emptyTitle="No branches found"
        emptyDescription="Try adjusting your search or filters."
      />

      <Pagination
        pagination={pagination}
        onPageChange={(page: unknown) => setFilters({ ...filters, page })}
      />

      <BranchFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        branch={selectedBranch}
        onSuccess={handleFormSuccess}
      />

      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Branch"
        message={
          deleteError ||
          `Are you sure you want to delete branch "${branchToDelete?.branch_name}"? This action cannot be undone if the branch has no active assignments.`
        }
        confirmText="Delete Branch"
        isConfirming={isDeleting}
      />
    </div>
  );
};

export default BranchesPage;
