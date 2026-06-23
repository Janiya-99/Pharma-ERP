import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../auth/AuthContext';
import { financeApi } from '../../../../api/financeApi';
import { toast } from 'react-hot-toast';
import ReportPageHeader from '../../../../components/finance/reports/ReportPageHeader';
import ReportFilterCard from '../../../../components/finance/reports/ReportFilterCard';
import ReportAmountCell from '../../../../components/finance/reports/ReportAmountCell';
import ReportToolbar from '../../../../components/finance/reports/ReportToolbar';
import ReportSection from '../../../../components/finance/reports/ReportSection';
import BalanceStatusBadge from '../../../../components/finance/reports/BalanceStatusBadge';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { AlertCircle } from 'lucide-react';

const BalanceSheetReportPage = () => {
  const { hasPermission, activeBranch } = useAuth();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filter State
  const [financialYears, setFinancialYears] = useState([]);

  const [filters, setFilters] = useState({
    financial_year_id: "",
    as_of_date: "",
    branch_id: activeBranch?.id || ""
  });

  const fetchFiltersData = async () => {
    try {
      const fyRes = await financeApi.getFinancialYears({ limit: 100 });
      if (fyRes.data?.success) setFinancialYears(fyRes.data.data);
    } catch (error) {
      console.error("Failed to load filters data", error);
    }
  };

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      Object.keys(params).forEach((key: unknown) => {
        if (params[key] === "") delete params[key];
      });

      const response = await financeApi.getBalanceSheetReport(params);
      if (response.data?.success) {
        setData(response.data.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch balance sheet report");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchFiltersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBranch]);

  const handleFilterChange = (key: unknown, value: unknown) => {
    setFilters((prev: unknown) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    fetchReport();
  };

  const handleClearFilters = () => {
    setFilters({
      financial_year_id: "",
      as_of_date: "",
      branch_id: activeBranch?.id || ""
    });
    setData(null);
  };

  const handleExportJson = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `balance-sheet-${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!hasPermission("finance.report.balance_sheet.view")) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Access Denied</h2>
        <p className="text-gray-500 dark:text-gray-400">You do not have permission to view the Balance Sheet report.</p>
      </div>
    );
  }

  const renderSectionLines = (lines: unknown) => {
    if (!lines || lines.length === 0) {
      return <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 italic text-center">No accounts found in this section.</div>;
    }

    return (
      <div className="divide-y divide-gray-100 dark:divide-navy-700">
        {lines.map((line: unknown) => (
          <div key={line.account_id} className="flex justify-between items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-navy-900/50 transition-colors">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-navy-800 dark:text-white">{line.account_code}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">{line.account_name}</span>
            </div>
            <div className="text-sm">
              <ReportAmountCell amount={line.balance} />
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <ReportPageHeader 
        title="Balance Sheet" 
        description="Snapshot of assets, liabilities, and equity at a specific point in time." 
      />

      <ReportFilterCard 
        onApply={handleApplyFilters} 
        onClear={handleClearFilters}
        isLoading={loading}
      >
        <div className="space-y-2">
          <Label>Financial Year</Label>
          <Select 
            value={filters.financial_year_id} 
            onValueChange={(val: unknown) => handleFilterChange('financial_year_id', val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Years</SelectItem>
              {financialYears.map((fy: unknown) => (
                <SelectItem key={fy.id} value={fy.id.toString()}>{fy.year_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>As Of Date</Label>
          <Input 
            type="date" 
            value={filters.as_of_date}
            onChange={(e: any) => handleFilterChange('as_of_date', e.target.value)}
          />
        </div>
      </ReportFilterCard>

      {data && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-end mb-6">
            <ReportToolbar onRefresh={fetchReport} onExportJson={handleExportJson} isRefreshing={loading} />
            <div className="mb-4">
               <BalanceStatusBadge isBalanced={data.is_balanced} />
            </div>
          </div>

          <div className="bg-white dark:bg-navy-800 rounded-lg shadow-sm border border-gray-200 dark:border-navy-700 p-6 mb-8">
            <h2 className="text-2xl font-bold text-center text-navy-800 dark:text-white mb-6">Balance Sheet</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Assets Column */}
              <div>
                <ReportSection title="Assets" totalLabel="Total Assets" totalAmount={data.assets?.total}>
                  {renderSectionLines(data.assets?.lines)}
                </ReportSection>

                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-lg px-4 py-3 flex justify-between items-center mt-4">
                  <span className="font-bold text-blue-800 dark:text-blue-400 text-lg">Total Assets</span>
                  <span className="font-bold text-blue-800 dark:text-blue-400 text-lg">
                    <ReportAmountCell amount={data.total_assets} />
                  </span>
                </div>
              </div>

              {/* Liabilities and Equity Column */}
              <div>
                <ReportSection title="Liabilities" totalLabel="Total Liabilities" totalAmount={data.liabilities?.total}>
                  {renderSectionLines(data.liabilities?.lines)}
                </ReportSection>

                <ReportSection title="Equity" totalLabel="Total Equity" totalAmount={data.equity?.total}>
                  {renderSectionLines(data.equity?.lines)}
                </ReportSection>

                <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 rounded-lg px-4 py-3 flex justify-between items-center mt-4">
                  <span className="font-bold text-blue-800 dark:text-blue-400 text-lg">Total Liabilities + Equity</span>
                  <span className="font-bold text-blue-800 dark:text-blue-400 text-lg">
                    <ReportAmountCell amount={data.total_liabilities_and_equity} />
                  </span>
                </div>

                {!data.is_balanced && (
                  <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-lg px-4 py-3 flex justify-between items-center mt-4">
                    <span className="font-bold text-red-800 dark:text-red-400">Difference</span>
                    <span className="font-bold text-red-800 dark:text-red-400">
                      <ReportAmountCell amount={data.difference} />
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {!data && !loading && (
        <div className="bg-white dark:bg-navy-800 rounded-lg shadow p-8 text-center border border-gray-200 dark:border-navy-700">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Run Report</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Click Apply Filters to view the balance sheet.
          </p>
        </div>
      )}
    </div>
  );
};

export default BalanceSheetReportPage;
