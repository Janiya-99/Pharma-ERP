import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../auth/AuthContext';
import { financeApi } from '../../../../api/financeApi';
import { getBranches } from '../../../../api/controlApi';
import { toast } from 'react-hot-toast';
import DataTable from '../../../../components/common/DataTable';
import ReportPageHeader from '../../../../components/finance/reports/ReportPageHeader';
import ReportFilterCard from '../../../../components/finance/reports/ReportFilterCard';
import ReportAmountCell from '../../../../components/finance/reports/ReportAmountCell';
import ReportToolbar from '../../../../components/finance/reports/ReportToolbar';
import BalanceStatusBadge from '../../../../components/finance/reports/BalanceStatusBadge';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { AlertCircle } from 'lucide-react';
import { FinanceAiPromptBar } from '../../shared/FinanceAiPromptBar';
import { useDebounce } from '../../../../hooks/useDebounce';

const TrialBalanceReportPage = () => {
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
      const response = await financeApi.getTrialBalanceReport(params);
      if (response.data?.success) {
        setData(response.data.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch trial balance report");
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
        setFilters((prev: any) => ({
          ...prev,
          financial_year_id: String(activeFy.id),
          branch_id: activeBranch?.id ? String(activeBranch.id) : prev.branch_id
        }));
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
    a.download = `trial-balance-${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const canView =
    hasPermission("finance.report.trial_balance.view") ||
    hasPermission("finance.report.view") ||
    hasPermission("finance.reports.view");

  if (!canView) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
        <p className="text-gray-500">You do not have permission to view the Trial Balance report.</p>
      </div>
    );
  }

  const columns = [
    {
      header: "Account Code",
      accessor: "account_code",
      cell: (row: any) => <div className="font-semibold text-slate-800">{row.account_code}</div>
    },
    {
      header: "Account Name",
      accessor: "account_name",
      cell: (row: any) => <div className="font-medium text-slate-700">{row.account_name}</div>
    },
    {
      header: <div className="text-right">Opening Dr</div>,
      accessor: "opening_debit",
      cell: (row: any) => <ReportAmountCell amount={row.opening_debit} />
    },
    {
      header: <div className="text-right">Opening Cr</div>,
      accessor: "opening_credit",
      cell: (row: any) => <ReportAmountCell amount={row.opening_credit} />
    },
    {
      header: <div className="text-right">Period Dr</div>,
      accessor: "period_debit",
      cell: (row: any) => <ReportAmountCell amount={row.period_debit} />
    },
    {
      header: <div className="text-right">Period Cr</div>,
      accessor: "period_credit",
      cell: (row: any) => <ReportAmountCell amount={row.period_credit} />
    },
    {
      header: <div className="text-right font-bold text-indigo-700">Closing Dr</div>,
      accessor: "closing_debit",
      cell: (row: any) => <ReportAmountCell amount={row.closing_debit} />
    },
    {
      header: <div className="text-right font-bold text-indigo-700">Closing Cr</div>,
      accessor: "closing_credit",
      cell: (row: any) => <ReportAmountCell amount={row.closing_credit} />
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <ReportPageHeader 
        title="Trial Balance" 
        description="Comprehensive summary of ledger closing balances verifying mathematical double-entry equilibrium." 
      />

      {/* AI Copilot Prompting Bar */}
      <FinanceAiPromptBar
        contextType="trial_balance"
        pageTitle="Trial Balance"
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

      {data && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex justify-between items-end mb-4">
            <ReportToolbar onRefresh={fetchReport} onExportJson={handleExportJson} isRefreshing={loading} />
            <div className="mb-4">
               <BalanceStatusBadge isBalanced={data.is_balanced ?? (Math.abs((data.total_closing_debit || 0) - (data.total_closing_credit || 0)) < 0.01)} />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden mb-6">
            <DataTable
              columns={columns}
              data={(data?.lines) || []}
              loading={loading}
              emptyMessage="No accounts found with activity for the selected period."
            />
            
            {/* Summary Row */}
            <div className="bg-slate-50 border-t border-slate-200 p-4">
              <div className="flex flex-col md:flex-row justify-between pt-2 gap-4 overflow-x-auto text-xs">
                 <div className="flex flex-col min-w-max">
                   <span className="text-slate-500 font-medium">Opening Dr</span>
                   <span className="font-bold text-slate-800"><ReportAmountCell amount={data.total_opening_debit} /></span>
                 </div>
                 <div className="flex flex-col min-w-max">
                   <span className="text-slate-500 font-medium">Opening Cr</span>
                   <span className="font-bold text-slate-800"><ReportAmountCell amount={data.total_opening_credit} /></span>
                 </div>
                 <div className="flex flex-col min-w-max">
                   <span className="text-slate-500 font-medium">Period Dr</span>
                   <span className="font-bold text-slate-800"><ReportAmountCell amount={data.total_period_debit} /></span>
                 </div>
                 <div className="flex flex-col min-w-max">
                   <span className="text-slate-500 font-medium">Period Cr</span>
                   <span className="font-bold text-slate-800"><ReportAmountCell amount={data.total_period_credit} /></span>
                 </div>
                 <div className="flex flex-col min-w-max">
                   <span className="text-indigo-600 font-semibold">Closing Dr</span>
                   <span className="font-bold text-indigo-700 text-sm"><ReportAmountCell amount={data.total_closing_debit} /></span>
                 </div>
                 <div className="flex flex-col min-w-max">
                   <span className="text-indigo-600 font-semibold">Closing Cr</span>
                   <span className="font-bold text-indigo-700 text-sm"><ReportAmountCell amount={data.total_closing_credit} /></span>
                 </div>
                 {data.is_balanced === false && (
                   <div className="flex flex-col min-w-max border-l pl-4 border-red-200">
                     <span className="text-red-500 font-medium">Difference</span>
                     <span className="font-bold text-red-600"><ReportAmountCell amount={data.difference} /></span>
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
          <h3 className="mt-4 text-lg font-medium text-slate-900">No Data</h3>
          <p className="mt-2 text-sm text-slate-500">
            Select a financial year to view the trial balance.
          </p>
        </div>
      )}
    </div>
  );
};

export default TrialBalanceReportPage;
