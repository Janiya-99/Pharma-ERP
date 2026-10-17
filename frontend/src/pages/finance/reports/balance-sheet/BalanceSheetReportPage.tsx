import { useState, useEffect, useCallback } from 'react';
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
import { FinanceAiPromptBar } from '../../shared/FinanceAiPromptBar';

const BalanceSheetReportPage = () => {
  const { hasPermission, activeBranch } = useAuth();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Filter State
  const [financialYears, setFinancialYears] = useState<any[]>([]);

  const [filters, setFilters] = useState<any>({
    financial_year_id: "",
    as_of_date: "",
    branch_id: activeBranch?.id ? String(activeBranch.id) : ""
  });

  const fetchReport = useCallback(async (customFilters?: Record<string, unknown>) => {
    const activeFilters: any = customFilters || filters;
    const params: Record<string, unknown> = { ...activeFilters };
    Object.keys(params).forEach((key: string) => {
      if (params[key] === "" || params[key] === undefined || params[key] === null) {
        delete params[key];
      }
    });

    if (!params.financial_year_id && financialYears.length > 0) {
      const activeFy: any = financialYears.find((f: any) => f.is_active || f.is_current || f.status === 'active') || financialYears[0];
      if (activeFy) params.financial_year_id = String(activeFy.id);
    }

    if (!params.financial_year_id) {
      return;
    }

    setLoading(true);
    try {
      const response = await financeApi.getBalanceSheetReport(params);
      if (response.data?.success) {
        setData(response.data.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch balance sheet report");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [filters, financialYears]);

  const fetchFiltersData = async () => {
    try {
      const fyRes = await financeApi.getFinancialYears({ limit: 100 });
      const fyList = Array.isArray(fyRes.data?.data) ? fyRes.data.data : Array.isArray(fyRes.data) ? fyRes.data : [];
      setFinancialYears(fyList);

      const activeFy: any = fyList.find((f: any) => f.is_active || f.is_current || f.status === 'active') || fyList[0];
      if (activeFy) {
        const initial = {
          financial_year_id: String(activeFy.id),
          as_of_date: "",
          branch_id: activeBranch?.id ? String(activeBranch.id) : ""
        };
        setFilters(initial);
        fetchReport(initial);
      }
    } catch (error) {
      console.error("Failed to load filters data", error);
    }
  };

  useEffect(() => {
    fetchFiltersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBranch]);

  const handleFilterChange = (key: unknown, value: unknown) => {
    setFilters((prev: any) => ({ ...prev, [key as string]: value }));
  };

  const handleApplyFilters = () => {
    fetchReport();
  };

  const handleClearFilters = () => {
    const activeFy: any = financialYears.find((f: any) => f.is_active || f.is_current || f.status === 'active') || financialYears[0];
    const initial = {
      financial_year_id: activeFy ? String(activeFy.id) : "",
      as_of_date: "",
      branch_id: activeBranch?.id ? String(activeBranch.id) : ""
    };
    setFilters(initial);
    if (initial.financial_year_id) {
      fetchReport(initial);
    } else {
      setData(null);
    }
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

  const canView =
    hasPermission("finance.report.balance_sheet.view") ||
    hasPermission("finance.report.view") ||
    hasPermission("finance.reports.view");

  if (!canView) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
        <p className="text-gray-500">You do not have permission to view the Balance Sheet report.</p>
      </div>
    );
  }

  const renderSectionLines = (lines: any) => {
    if (!lines || lines.length === 0) {
      return <div className="px-4 py-3 text-xs text-slate-500 italic text-center">No accounts found in this section.</div>;
    }

    return (
      <div className="divide-y divide-slate-100">
        {lines.map((line: any, idx: number) => {
          const bal = line.balance !== undefined ? line.balance : (line.closing_debit || line.closing_credit || 0);
          return (
            <div key={line.account_id || line.account_code || idx} className="flex justify-between items-center px-4 py-2 hover:bg-slate-50 transition-colors">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-800">{line.account_code}</span>
                <span className="text-[11px] text-slate-500">{line.account_name}</span>
              </div>
              <div className="text-xs font-medium">
                <ReportAmountCell amount={bal} />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <ReportPageHeader 
        title="Balance Sheet" 
        description="Snapshot of enterprise assets, liabilities, and equity capital position." 
      />

      {/* AI Copilot Prompting Bar */}
      <FinanceAiPromptBar
        contextType="balance_sheet"
        pageTitle="Balance Sheet"
        dataSnapshot={data}
      />

      <ReportFilterCard 
        onApply={handleApplyFilters} 
        onClear={handleClearFilters}
        isLoading={loading}
      >
        <div className="space-y-2">
          <Label>Financial Year <span className="text-red-500">*</span></Label>
          <Select 
            value={filters.financial_year_id} 
            onValueChange={(val: string) => handleFilterChange('financial_year_id', val)}
          >
            <SelectTrigger className={!filters.financial_year_id ? "border-red-300" : ""}>
              <SelectValue placeholder="Select Financial Year" />
            </SelectTrigger>
            <SelectContent>
              {(financialYears || []).map((fy: any) => (
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
            placeholder="Enter value" 
          />
        </div>
      </ReportFilterCard>

      {data && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
          <div className="flex justify-between items-end">
            <ReportToolbar onRefresh={fetchReport} onExportJson={handleExportJson} isRefreshing={loading} />
            <div>
               <BalanceStatusBadge isBalanced={data.is_balanced ?? (Math.abs((data.total_assets || 0) - (data.total_liabilities_and_equity || 0)) < 0.01)} />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 p-6">
            <h2 className="text-xl font-bold text-center text-slate-800 mb-6">Statement of Financial Position</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Assets Column */}
              <div>
                <ReportSection title="Assets" totalLabel="Total Assets" totalAmount={data.assets?.total || data.total_assets}>
                  {renderSectionLines(data.assets?.lines)}
                </ReportSection>

                <div className="bg-indigo-50/80 border border-indigo-200 rounded-xl px-4 py-3 flex justify-between items-center mt-4 shadow-2xs">
                  <span className="font-bold text-indigo-900 text-sm">Total Assets</span>
                  <span className="font-bold text-indigo-900 text-sm">
                    <ReportAmountCell amount={data.total_assets || data.assets?.total} />
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

                <div className="bg-indigo-50/80 border border-indigo-200 rounded-xl px-4 py-3 flex justify-between items-center mt-4 shadow-2xs">
                  <span className="font-bold text-indigo-900 text-sm">Total Liabilities + Equity</span>
                  <span className="font-bold text-indigo-900 text-sm">
                    <ReportAmountCell amount={data.total_liabilities_and_equity || ((data.liabilities?.total || 0) + (data.equity?.total || 0))} />
                  </span>
                </div>

                {!data.is_balanced && data.difference !== undefined && data.difference !== 0 && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3 flex justify-between items-center mt-4">
                    <span className="font-bold text-rose-800 text-xs">Difference</span>
                    <span className="font-bold text-rose-800 text-xs">
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
        <div className="bg-white rounded-xl shadow-xs p-8 text-center border border-slate-200">
          <AlertCircle className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-4 text-lg font-medium text-slate-900">Run Report</h3>
          <p className="mt-2 text-sm text-slate-500">
            Select a financial year and click Apply Filters to view the statement of financial position.
          </p>
        </div>
      )}
    </div>
  );
};

export default BalanceSheetReportPage;
