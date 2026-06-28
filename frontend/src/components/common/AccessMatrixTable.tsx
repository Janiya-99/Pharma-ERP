import React from "react";
import DataTable from "./DataTable";
import PermissionGuard from "../../auth/PermissionGuard";
import { Trash2 } from "lucide-react";

const AccessMatrixTable = ({
  data,
  loading,
  onRemove,
}: {
  data?: Record<string, unknown>;
  loading?: unknown;
  onRemove?: unknown;
}) => {
  const columns = [
    {
      header: "Branch",
      accessor: "branch_name",
      cell: (row: unknown) =>
        row.branch_name || row.branch?.branch_name || "Unknown Branch",
    },
    {
      header: "Software Module",
      accessor: "software_name",
      cell: (row: any) =>
        row.software_name ||
        row.software?.software_name ||
        row.software_module?.software_name ||
        "Unknown Module",
    },
    {
      header: "Role",
      accessor: "role_name",
      cell: (row: unknown) => (
        <div>
          <span className="font-medium text-gray-900">
            {row.role_name || row.role?.role_name || "Unknown Role"}
          </span>
          {row.role?.is_system && (
            <span className="ml-2 inline-flex items-center rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
              System
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      cell: (row: unknown) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
            row.status === "active"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {row.status || "Active"}
        </span>
      ),
    },
    {
      header: "Actions",
      cellClassName: "text-right",
      cell: (row: unknown) => (
        <PermissionGuard permission="control.access_matrix.remove">
          <button
            onClick={() => onRemove(row)}
            className="rounded p-1.5 text-red-600 transition-colors hover:bg-red-50 hover:text-red-900"
            title="Remove Access"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </PermissionGuard>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={data}
      loading={loading}
      emptyTitle="No access assignments found"
      emptyDescription="This user does not have any branch, software, and role access assigned yet."
    />
  );
};

export default AccessMatrixTable;
