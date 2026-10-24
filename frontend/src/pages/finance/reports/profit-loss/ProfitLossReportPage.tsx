import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../auth/AuthContext';
import { financeApi } from '../../../../api/financeApi';
import { getBranches } from '../../../../api/controlApi';
import { toast } from 'react-hot-toast';
import ReportPageHeader from '../../../../components/finance/reports/ReportPageHeader';
import ReportFilterCard from '../../../../components/finance/reports/ReportFilterCard';
import ReportAmountCell from '../../../../components/finance/reports/ReportAmountCell';
import ReportToolbar from '../../../../components/finance/reports/ReportToolbar';
import ReportSection from '../../../../components/finance/reports/ReportSection';
import ProfitLossBadge from '../../../../components/finance/reports/ProfitLossBadge';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { AlertCircle } from 'lucide-react';
import { FinanceAiPromptBar } from '../../shared/FinanceAiPromptBar';
import { useDebounce } from '../../../../hooks/useDebounce';

const ProfitLossReportPage = () => {
  const { hasPermission, activeBranch } = useAuth();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Filter State
  const [financialYears, setFinancialYears] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);

  const [filters, setFilters] = useState<any>({
    financial_year_id: "",
    date_from: "",
    date_to: "",
    branch_id: activeBranch?.id ? String(activeBranch.id) : ""
  });

  const debouncedFilters = useDebounce(filters, 300);

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
      const response = await financeApi.getProfitLossReport(params);
      if (response.data?.success) {
        setData(response.data.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch profit and loss report");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [financialYears]);

  const fetchFiltersData = async () => {
    try {
      const [fyRes, branchRes] = await Promise.all([
        financeApi.getFinancialYears({ limit: 100 }),
        getBranches({ limit: 100, status: "active" })
      ]);
      const fyList = Array.isArray(fyRes.data?.data) ? fyRes.data.data : Array.isArray(fyRes.data) ? fyRes.data : [];
      setFinancialYears(fyList);
      const bList = branchRes.data?.data?.items || branchRes.data?.data || branchRes.data || [];
      if (Array.isArray(bList)) setBranches(bList);

      const activeFy: any = fyList.find((f: any) => f.is_active || f.is_current || f.status === 'active') || fyList[0];
      if (activeFy && !filters.financial_year_id) {
        const initial = {
          ...filters,
          financial_year_id: String(activeFy.id),
          branch_id: activeBranch?.id ? String(activeBranch.id) : filters.branch_id
        };
        setFilters(initial);
        // Directly load report with initial filters (bypasses 300ms debounce delay)
        fetchReport(initial);
      }
    } catch (error) {
      console.error("Failed to load filters data", error);
    }
  };

  useEffect(() => {
    fetchFiltersData();
  }, [activeBranch]);

  useEffect(() => {
    if (debouncedFilters.financial_year_id) {
      fetchReport(debouncedFilters);
    }
  }, [debouncedFilters, fetchReport]);

  const handleFilterChange = (key: unknown, value: unknown) => {
    setFilters((prev: any) => ({ ...prev, [key as string]: value }));
  };

  const handleApplyFilters = () => {
    fetchReport(filters);
  };

  const handleClearFilters = () => {
    const activeFy: any = financialYears.find((f: any) => f.is_active || f.is_current || f.status === 'active') || financialYears[0];
    const initial = {
      financial_year_id: activeFy ? String(activeFy.id) : "",
      date_from: "",
      date_to: "",
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
    a.download = `profit-and-loss-${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const canView =
    hasPermission("finance.report.profit_loss.view") ||
    hasPermission("finance.report.view") ||
    hasPermission("finance.reports.view");

  if (!canView) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
        <p className="text-gray-500">You do not have permission to view the Profit and Loss report.</p>
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
          const lineBal = line.balance !== undefined ? line.balance : (line.closing_credit || line.closing_debit || 0);
          return (
            <div key={line.account_id || line.account_code || idx} className="flex justify-between items-center px-4 py-2 hover:bg-slate-50 transition-colors">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-800">{line.account_code}</span>
                <span className="text-[11px] text-slate-500">{line.account_name}</span>
              </div>
              <div className="text-xs font-medium">
                <ReportAmountCell amount={lineBal} />
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
        title="Profit and Loss" 
        description="Multi-step income statement showing operating revenues, cost of sales, overheads, and net profit." 
      />

      {/* AI Copilot Prompting Bar */}
      <FinanceAiPromptBar
        contextType="profit_loss"
        pageTitle="Profit and Loss"
        dataSnapshot={data}
      />

      <ReportFilterCard 
        onApply={handleApplyFilters} 
        onClear={handleClearFilters}
        isLoading={loading}
      >
        <div className="space-y-2">
          <Label>Operating Branch</Label>
          <Select 
            value={filters.branch_id || "all"} 
            onValueChange={(val: string) => handleFilterChange('branch_id', val === "all" ? "" : val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Branches" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches (Consolidated)</SelectItem>
              {(branches || []).map((b: any) => (
                <SelectItem key={b.id} value={b.id.toString()}>{b.branch_name || b.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
          <Label>Quick Period Preset</Label>
          <Select
            value="custom"
            onValueChange={(val: string) => {
              const today = new Date();
              const pad = (n: number) => String(n).padStart(2, "0");
              const formatDate = (d: Date) =>
                `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

              if (val === "this_month") {
                const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                handleFilterChange('date_from', formatDate(startOfMonth));
                handleFilterChange('date_to', formatDate(today));
              } else if (val === "last_month") {
                const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
                handleFilterChange('date_from', formatDate(startOfLastMonth));
                handleFilterChange('date_to', formatDate(endOfLastMonth));
              } else if (val === "ytd") {
                const startOfYear = new Date(today.getFullYear(), 0, 1);
                handleFilterChange('date_from', formatDate(startOfYear));
                handleFilterChange('date_to', formatDate(today));
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Quick Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="custom">Quick Range...</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="ytd">Year to Date (YTD)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Date From</Label>
          <Input 
            type="date" 
            value={filters.date_from}
            onChange={(e: any) => handleFilterChange('date_from', e.target.value)}
            placeholder="Enter value" 
          />
        </div>

        <div className="space-y-2">
          <Label>Date To</Label>
          <Input 
            type="date" 
            value={filters.date_to}
            onChange={(e: any) => handleFilterChange('date_to', e.target.value)}
            placeholder="Enter value" 
          />
        </div>
      </ReportFilterCard>

      {data && (() => {
        const totalIncome = data.total_income !== undefined ? data.total_income : ((data.revenue?.total || 0) + (data.other_income?.total || 0));
        const totalExpense = data.total_expense !== undefined ? data.total_expense : ((data.direct_expenses?.total || 0) + (data.administrative_expenses?.total || 0) + (data.selling_expenses?.total || 0) + (data.finance_expenses?.total || 0));
        const netProfit = data.net_profit !== undefined ? data.net_profit : (data.net_profit_loss !== undefined ? data.net_profit_loss : (totalIncome - totalExpense));

        return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
          <div className="flex justify-between items-end">
            <ReportToolbar onRefresh={fetchReport} onExportJson={handleExportJson} isRefreshing={loading} />
            <div>
               <ProfitLossBadge amount={netProfit} />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 p-6">
            <h2 className="text-xl font-bold text-center text-slate-800 mb-6">Income Statement</h2>
            
            {/* Income Sections */}
            <ReportSection title="Revenue" totalLabel="Total Revenue" totalAmount={data.revenue?.total}>
              {renderSectionLines(data.revenue?.lines)}
            </ReportSection>

            <ReportSection title="Other Income" totalLabel="Total Other Income" totalAmount={data.other_income?.total}>
              {renderSectionLines(data.other_income?.lines)}
            </ReportSection>

            <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl px-4 py-3 flex justify-between items-center mb-6 shadow-2xs">
              <span className="font-bold text-emerald-900 text-sm">Total Income</span>
              <span className="font-bold text-emerald-900 text-sm">
                <ReportAmountCell amount={totalIncome} />
              </span>
            </div>

            {/* Expense Sections */}
            <ReportSection title="Direct Expenses (COGS)" totalLabel="Total Direct Expenses" totalAmount={data.direct_expenses?.total}>
              {renderSectionLines(data.direct_expenses?.lines)}
            </ReportSection>

            <ReportSection title="Administrative Expenses" totalLabel="Total Administrative Expenses" totalAmount={data.administrative_expenses?.total}>
              {renderSectionLines(data.administrative_expenses?.lines)}
            </ReportSection>

            <ReportSection title="Selling & Distribution Expenses" totalLabel="Total Selling Expenses" totalAmount={data.selling_expenses?.total}>
              {renderSectionLines(data.selling_expenses?.lines)}
            </ReportSection>

            <ReportSection title="Finance Charges" totalLabel="Total Finance Expenses" totalAmount={data.finance_expenses?.total}>
              {renderSectionLines(data.finance_expenses?.lines)}
            </ReportSection>

            <div className="bg-rose-50/80 border border-rose-200 rounded-xl px-4 py-3 flex justify-between items-center mb-6 shadow-2xs">
              <span className="font-bold text-rose-900 text-sm">Total Expenses</span>
              <span className="font-bold text-rose-900 text-sm">
                <ReportAmountCell amount={totalExpense} />
              </span>
            </div>

            {/* Net Profit Summary */}
            <div className={`rounded-xl px-6 py-4 flex justify-between items-center border shadow-xs ${
              netProfit > 0 
                ? "bg-emerald-50 border-emerald-300" 
                : netProfit < 0 
                  ? "bg-rose-50 border-rose-300"
                  : "bg-slate-50 border-slate-300"
            }`}>
              <span className={`text-base font-bold ${
                netProfit > 0 ? "text-emerald-900" : netProfit < 0 ? "text-rose-900" : "text-slate-800"
              }`}>
                Net {netProfit > 0 ? "Profit" : netProfit < 0 ? "Loss" : "Profit/Loss"}
              </span>
              <span className={`text-xl font-bold ${
                netProfit > 0 ? "text-emerald-900" : netProfit < 0 ? "text-rose-900" : "text-slate-800"
              }`}>
                <ReportAmountCell amount={netProfit} />
              </span>
            </div>

          </div>
        </div>
        );
      })()}
      
      {!data && !loading && (
        <div className="bg-white rounded-xl shadow-xs p-8 text-center border border-slate-200">
          <AlertCircle className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-4 text-lg font-medium text-slate-900">No Data</h3>
          <p className="mt-2 text-sm text-slate-500">
            Select a financial year to generate the profit and loss statement.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfitLossReportPage;
