import React from "react";
import DepreciationLinesTable from "../../../components/finance/DepreciationLinesTable";

const DepreciationPreviewTable = ({
  previewData,
  loading,
}: {
  previewData?: unknown;
  loading?: unknown;
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-gray-100 bg-white p-10 shadow-sm dark:border-navy-700 dark:bg-navy-800">
        <div className="text-brand-500">Generating preview...</div>
      </div>
    );
  }

  if (!previewData) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-10 shadow-sm dark:border-navy-700 dark:bg-navy-800">
        <div className="text-sm text-gray-500">
          Fill in the details and click Preview Depreciation to calculate
          eligible depreciation amounts.
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-navy-700 dark:bg-navy-800">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-bold text-navy-700 dark:text-white">
          Depreciation Preview
        </h3>
        <div className="text-right">
          <p className="mb-1 text-xs uppercase tracking-wider text-gray-500">
            Total Depreciation
          </p>
          <p className="text-xl font-bold text-red-600 dark:text-red-400">
            LKR{" "}
            {Number(previewData.total_depreciation_amount || 0).toLocaleString(
              undefined,
              { minimumFractionDigits: 2, maximumFractionDigits: 2 }
            )}
          </p>
        </div>
      </div>

      {previewData.lines?.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-6 text-center dark:border-navy-700 dark:bg-navy-900">
          <p className="text-gray-500 dark:text-gray-400">
            No eligible assets found for the selected period.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-100 dark:border-navy-700">
          <DepreciationLinesTable lines={previewData.lines} loading={loading} />
        </div>
      )}
    </div>
  );
};

export default DepreciationPreviewTable;
