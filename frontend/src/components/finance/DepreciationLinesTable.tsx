import React from "react";
import DataTable from "../common/DataTable";

const DepreciationLinesTable = ({
  lines,
  loading,
}: {
  lines?: unknown;
  loading?: unknown;
}) => {
  const columns = [
    {
      key: "asset_code",
      label: "Asset Code",
      render: (val: unknown, row: unknown) => (
        <span className="font-medium text-navy-700 dark:text-white">
          {row.fixed_asset?.asset_code || val}
        </span>
      ),
    },
    {
      key: "asset_name",
      label: "Asset Name",
      render: (val: unknown, row: unknown) => (
        <span>{row.fixed_asset?.asset_name || val}</span>
      ),
    },
    {
      key: "depreciation_amount",
      label: "Depreciation Amount",
      align: "right",
      render: (val: unknown) => (
        <span className="font-medium text-red-600 dark:text-red-400">
          LKR{" "}
          {Number(val || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      ),
    },
    {
      key: "accumulated_before",
      label: "Acc. Before",
      align: "right",
      render: (val: unknown) => (
        <span>LKR {Number(val || 0).toLocaleString()}</span>
      ),
    },
    {
      key: "accumulated_after",
      label: "Acc. After",
      align: "right",
      render: (val: unknown) => (
        <span className="font-medium">
          LKR {Number(val || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: "nbv_before",
      label: "NBV Before",
      align: "right",
      render: (val: unknown) => (
        <span>LKR {Number(val || 0).toLocaleString()}</span>
      ),
    },
    {
      key: "nbv_after",
      label: "NBV After",
      align: "right",
      render: (val: unknown) => (
        <span className="font-medium">
          LKR {Number(val || 0).toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={lines || []}
      loading={loading}
      totalCount={lines?.length || 0}
      page={1}
      limit={lines?.length || 10}
      onPageChange={() => {}}
      onLimitChange={() => {}}
      hidePagination={true}
    />
  );
};

export default DepreciationLinesTable;
