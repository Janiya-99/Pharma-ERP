import React from "react";
import DepreciationLinesTable from "../../../components/finance/DepreciationLinesTable";

const DepreciationPreviewTable = ({ previewData, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center p-10 bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-100 dark:border-navy-700">
        <div className="text-brand-500">Generating preview...</div>
      </div>
    );
  }

  if (!previewData) {
    return (
      <div className="flex items-center justify-center p-10 bg-gray-50 dark:bg-navy-800 rounded-2xl shadow-sm border border-dashed border-gray-200 dark:border-navy-700">
        <div className="text-gray-500 text-sm">Fill in the details and click Preview Depreciation to calculate eligible depreciation amounts.</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-100 dark:border-navy-700 p-6 mb-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-navy-700 dark:text-white">
          Depreciation Preview
        </h3>
        <div className="text-right">
          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Depreciation</p>
          <p className="text-xl font-bold text-red-600 dark:text-red-400">
            LKR {Number(previewData.total_depreciation_amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {previewData.lines?.length === 0 ? (
        <div className="p-6 text-center bg-gray-50 dark:bg-navy-900 rounded-xl border border-gray-100 dark:border-navy-700">
          <p className="text-gray-500 dark:text-gray-400">No eligible assets found for the selected period.</p>
        </div>
      ) : (
        <div className="border border-gray-100 dark:border-navy-700 rounded-xl overflow-hidden">
          <DepreciationLinesTable lines={previewData.lines} loading={loading} />
        </div>
      )}
    </div>
  );
};

export default DepreciationPreviewTable;
