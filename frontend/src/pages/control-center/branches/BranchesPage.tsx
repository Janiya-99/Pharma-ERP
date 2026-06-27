import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getBranches, deleteBranch } from "../../../api/controlApi";
import PageHeader from "../../../components/common/PageHeader";
import DataTable from "../../../components/common/DataTable";
import Pagination from "../../../components/common/Pagination";
import Button from "../../../components/common/Button";
import Badge from "../../../components/common/Badge";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import FormError from "../../../components/common/FormError";
import PermissionGuard from "../../../auth/PermissionGuard";
import BranchFormModal from "./BranchFormModal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Plus, Edit2, Trash2, Search } from "lucide-react";

interface Branch {
  id: number;
  branch_code: string;
  branch_name: string;
  branch_type: string;
  address?: string;
  phone?: string;
  email?: string;
  is_main_branch: boolean;
  status: string;
}

const BranchesPage = () => {
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    branch_type: "",
    page: 1,
    limit: 10,
  });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [branchToDelete, setBranchToDelete] = useState<Branch | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const { data: queryData, isLoading, error, refetch } = useQuery({
    queryKey: ["branches", filters],
    queryFn: async () => {
      const res = await getBranches(filters);
      if (res.success === false) {
        throw new Error(res.message || "Failed to load branches");
      }
      return res;
    },
  });

  const branches = queryData?.data || [];
  const pagination = queryData?.pagination || null;


  const handleFilterChange = (e: any) => {
    setFilters({ ...filters, [e.target.name]: e.target.value, page: 1 });
  };

  const openCreateModal = () => {
    setSelectedBranch(null);
    setIsFormOpen(true);
  };

  const openEditModal = (branch: any) => {
    setSelectedBranch(branch);
    setIsFormOpen(true);
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    refetch();
  };

  const confirmDelete = (branch: any) => {
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
      refetch();
    } catch (err: any) {
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
      cell: (row: any) => {
        const status = (row.status || "active").toLowerCase();
        let variant: "default" | "success" | "danger" | "warning" | "info" | "indigo" = "default";
        if (status === "active" || status === "active ") {
          variant = "success";
        } else if (status === "suspended") {
          variant = "warning";
        } else if (status === "locked") {
          variant = "danger";
        }
        return (
          <Badge variant={variant}>
            {status}
          </Badge>
        );
      },
    },
    {
      header: "Actions",
      cellClassName: "text-right",
      cell: (row: any) => (
        <div className="flex justify-end gap-1">
          <PermissionGuard permission="control.branch.update">
            <button
              onClick={() => openEditModal(row)}
              className="inline-flex items-center justify-center h-8 w-8 rounded-xl text-green-600 bg-transparent hover:bg-green-50 hover:text-green-700 transition-all duration-200 hover:scale-105 active:scale-95"
              title="Edit"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </PermissionGuard>
          <PermissionGuard permission="control.branch.delete">
            <button
              onClick={() => confirmDelete(row)}
              className="inline-flex items-center justify-center h-8 w-8 rounded-xl text-red-500 bg-transparent hover:bg-red-50 hover:text-red-600 transition-all duration-200 hover:scale-105 active:scale-95"
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

      <FormError message={error instanceof Error ? error.message : null} />

      <div className="filter-bar">
        <div className="relative flex-1 max-w-sm min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <input
            type="text"
            placeholder="Search branches..."
            name="search"
            value={filters.search}
            onChange={(e: any) => setFilters({ ...filters, search: e.target.value, page: 1 })}
            className="input-premium pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={filters.branch_type || "all"}
            onValueChange={(val) => setFilters({ ...filters, branch_type: val === "all" ? "" : val, page: 1 })}
          >
            <SelectTrigger className="w-[140px] h-[38px] bg-white border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-slate-100/50">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200 rounded-xl">
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Main Branch">Main Branch</SelectItem>
              <SelectItem value="Warehouse">Warehouse</SelectItem>
              <SelectItem value="Sales Branch">Sales Branch</SelectItem>
              <SelectItem value="Distribution Center">Distribution Center</SelectItem>
              <SelectItem value="Admin Office">Admin Office</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.status || "all"}
            onValueChange={(val) => setFilters({ ...filters, status: val === "all" ? "" : val, page: 1 })}
          >
            <SelectTrigger className="w-[140px] h-[38px] bg-white border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-slate-100/50">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent className="bg-white border-slate-200 rounded-xl">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={branches}
        loading={isLoading}
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
        existingBranches={branches}
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
