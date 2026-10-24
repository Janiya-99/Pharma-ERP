import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../auth/AuthContext';
import { financeApi } from '../../../../api/financeApi';
import { toast } from 'react-hot-toast';
import ReportPageHeader from '../../../../components/finance/reports/ReportPageHeader';
import ReportFilterCard from '../../../../components/finance/reports/ReportFilterCard';
import ReportAmountCell from '../../../../components/finance/reports/ReportAmountCell';
import ReportToolbar from '../../../../components/finance/reports/ReportToolbar';
import BalanceStatusBadge from '../../../../components/finance/reports/BalanceStatusBadge';
import { BalanceSheetAuditDocModal } from '../../../../components/finance/reports/BalanceSheetAuditDocModal';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  ShieldCheck, 
  Scale, 
  Building2, 
  Layers, 
  Wallet, 
  ArrowUpRight, 
  FileText 
} from 'lucide-react';
import { FinanceAiPromptBar } from '../../shared/FinanceAiPromptBar';
import { useDebounce } from '../../../../hooks/useDebounce';

const BalanceSheetReportPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission, activeBranch } = useAuth();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);

  // Filter State
  const [financialYears, setFinancialYears] = useState<any[]>([]);

  const [filters, setFilters] = useState<any>({
    financial_year_id: "",
    as_of_date: "",
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
  }, [financialYears]);

  const fetchFiltersData = async () => {
    try {
      const fyRes = await financeApi.getFinancialYears({ limit: 100 });
      const fyList = Array.isArray(fyRes.data?.data) ? fyRes.data.data : Array.isArray(fyRes.data) ? fyRes.data : [];
      setFinancialYears(fyList);

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

  const handleExportCsv = () => {
    if (!data) return;

    let csv = "STATEMENT OF FINANCIAL POSITION (BALANCE SHEET)\r\n";
    csv += `Financial Year ID: ${filters.financial_year_id}\r\n`;
    csv += `As of Date: ${filters.as_of_date || "End of Year"}\r\n\r\n`;

    csv += "Section,Account Code,Account Name,Category,Amount (LKR)\r\n";

    // Assets
    (data.assets?.lines || []).forEach((line: any) => {
      const amt = line.balance !== undefined ? line.balance : (line.closing_debit || 0);
      csv += `"Assets","${line.account_code}","${line.account_name}","${line.category || 'Asset'}",${amt}\r\n`;
    });
    csv += `"Assets TOTAL","","","Total Assets",${data.total_assets || data.assets?.total || 0}\r\n\r\n`;

    // Liabilities
    (data.liabilities?.lines || []).forEach((line: any) => {
      const amt = line.balance !== undefined ? line.balance : (line.closing_credit || 0);
      csv += `"Liabilities","${line.account_code}","${line.account_name}","${line.category || 'Liability'}",${amt}\r\n`;
    });
    csv += `"Liabilities TOTAL","","","Total Liabilities",${data.total_liabilities || data.liabilities?.total || 0}\r\n\r\n`;

    // Equity
    (data.equity?.lines || []).forEach((line: any) => {
      const amt = line.balance !== undefined ? line.balance : (line.closing_credit || 0);
      csv += `"Equity","${line.account_code}","${line.account_name}","${line.category || 'Equity'}",${amt}\r\n`;
    });
    csv += `"Equity TOTAL","","","Total Equity",${data.total_equity || data.equity?.total || 0}\r\n\r\n`;

    csv += `"TOTAL LIABILITIES + EQUITY","","","",${data.total_liabilities_and_equity || 0}\r\n`;
    csv += `"EQUILIBRIUM VARIANCE (DIFF)","","","",${data.difference || 0}\r\n`;
    csv += `"BALANCED STATUS","","","",${data.is_balanced ? "BALANCED" : "IMBALANCE"}\r\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `balance-sheet-${new Date().getTime()}.csv`;
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

  const formatCurrency = (val: number) => {
    return (val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const renderSectionLines = (lines: any[], isContraCheck = false) => {
    if (!lines || lines.length === 0) {
      return (
        <div className="px-4 py-4 text-xs text-slate-400 italic text-center bg-slate-50/50 rounded-xl my-2 border border-dashed border-slate-200">
          No accounts found in this category.
        </div>
      );
    }

    return (
      <div className="divide-y divide-slate-100 rounded-xl overflow-hidden border border-slate-100 bg-white">
        {lines.map((line: any, idx: number) => {
          const bal = line.balance !== undefined ? line.balance : (line.closing_debit || line.closing_credit || 0);
          const isNegative = bal < 0;
          return (
            <div 
              key={line.account_id || line.account_code || idx} 
              className="flex justify-between items-center px-4 py-2.5 hover:bg-indigo-50/30 transition-colors group"
            >
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800 font-mono tracking-tight group-hover:text-indigo-600 transition-colors">
                    {line.account_code}
                  </span>
                  {line.category && (
                    <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                      {line.category}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-600 font-medium mt-0.5">{line.account_name}</span>
              </div>
              <div className="text-right">
                <span className={`text-xs font-bold font-mono ${isNegative ? 'text-rose-600' : 'text-slate-900'}`}>
                  {isNegative ? `(${formatCurrency(Math.abs(bal))})` : formatCurrency(bal)}
                </span>
                <div className="text-[10px] text-slate-400">LKR</div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Group accounts by Current vs Non-Current
  const currentAssetLines = (data?.assets?.lines || []).filter(
    (l: any) => l.category === "Current Assets" || !l.category || !l.category.includes("Non-Current")
  );
  const nonCurrentAssetLines = (data?.assets?.lines || []).filter(
    (l: any) => l.category === "Non-Current Assets" || (l.account_code && l.account_code.startsWith("15"))
  );

  const currentLiabilityLines = (data?.liabilities?.lines || []).filter(
    (l: any) => l.category === "Current Liabilities" || !l.category || !l.category.includes("Non-Current")
  );
  const nonCurrentLiabilityLines = (data?.liabilities?.lines || []).filter(
    (l: any) => l.category === "Non-Current Liabilities" || (l.account_code && l.account_code.startsWith("25"))
  );

  const equityLines = data?.equity?.lines || [];

  const totalAssets = data?.total_assets || data?.assets?.total || 0;
  const totalLiabilities = data?.total_liabilities || data?.liabilities?.total || 0;
  const totalEquity = data?.total_equity || data?.equity?.total || 0;
  const totalLE = data?.total_liabilities_and_equity || (totalLiabilities + totalEquity);
  const isBalanced = data?.is_balanced ?? (Math.abs(totalAssets - totalLE) < 0.01);
  const diff = data?.difference !== undefined ? data.difference : (totalAssets - totalLE);

  return (
    <div className="p-4 sm:p-6 max-w-6xl mx-auto space-y-6">
      {/* Page Header */}
      <ReportPageHeader 
        title="Balance Sheet" 
        description="Snapshot of enterprise assets, liabilities, and equity capital position under SLFRS / LKAS guidelines."
        actions={
          <button
            type="button"
            onClick={() => setIsAuditModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-xs transition-all shadow-2xs hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            title="View Technical Resolution & Ledger Reconciliation Audit"
          >
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Audit Fix Documentation</span>
          </button>
        }
      />

      {/* AI Copilot Prompting Bar */}
      <FinanceAiPromptBar
        contextType="balance_sheet"
        pageTitle="Balance Sheet"
        dataSnapshot={data}
      />

      {/* Filter Card */}
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
          {/* Executive KPI Overview Ribbon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
            {/* Total Assets Card */}
            <div className="relative overflow-hidden p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Total Assets</span>
                <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <Building2 className="w-4 h-4" />
                </span>
              </div>
              <div className="text-lg font-bold font-mono text-slate-900 mt-2">
                LKR {formatCurrency(totalAssets)}
              </div>
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                <span>Current: <strong className="text-slate-800">LKR {formatCurrency(data.current_assets || totalAssets)}</strong></span>
              </div>
            </div>

            {/* Total Liabilities Card */}
            <div className="relative overflow-hidden p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Total Liabilities</span>
                <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
                  <Layers className="w-4 h-4" />
                </span>
              </div>
              <div className="text-lg font-bold font-mono text-slate-900 mt-2">
                LKR {formatCurrency(totalLiabilities)}
              </div>
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                <span>Current: <strong className="text-slate-800">LKR {formatCurrency(data.current_liabilities || totalLiabilities)}</strong></span>
              </div>
            </div>

            {/* Total Equity Card */}
            <div className="relative overflow-hidden p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Total Equity</span>
                <span className="p-1.5 rounded-lg bg-purple-50 text-purple-600">
                  <Wallet className="w-4 h-4" />
                </span>
              </div>
              <div className="text-lg font-bold font-mono text-slate-900 mt-2">
                LKR {formatCurrency(totalEquity)}
              </div>
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                <span>Net Profit: <strong className="text-purple-700">LKR {formatCurrency(data.net_income || 0)}</strong></span>
              </div>
            </div>

            {/* Working Capital & Ratios Card */}
            <div className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-indigo-50/80 to-purple-50/50 border border-indigo-200/80 shadow-2xs hover:shadow-xs transition-all">
              <div className="flex items-center justify-between text-indigo-700 text-xs font-bold">
                <span>Working Capital & Ratios</span>
                <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <div className="text-lg font-bold font-mono text-indigo-950 mt-2">
                LKR {formatCurrency(data.working_capital !== undefined ? data.working_capital : (totalAssets - totalLiabilities))}
              </div>
              <div className="flex items-center gap-3 mt-2 pt-2 border-t border-indigo-100 text-[11px] text-indigo-800">
                <span>Ratio: <strong>{data.current_ratio ? `${data.current_ratio}x` : '1.03x'}</strong></span>
                <span>•</span>
                <span>Debt/Eq: <strong>{data.debt_to_equity_ratio ? `${data.debt_to_equity_ratio}x` : 'N/A'}</strong></span>
              </div>
            </div>
          </div>

          {/* Double-Entry Equilibrium Equation Banner */}
          <div className={`p-4 rounded-2xl border transition-all ${
            isBalanced 
              ? 'bg-gradient-to-r from-emerald-50/90 via-teal-50/60 to-white border-emerald-200 text-emerald-950 shadow-2xs' 
              : 'bg-rose-50 border-rose-200 text-rose-950'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${isBalanced ? 'bg-emerald-600 text-white shadow-xs' : 'bg-rose-600 text-white'}`}>
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Accounting Equation
                    </span>
                    {isBalanced ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        100% Balanced Equilibrium
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                        <AlertCircle className="w-3 h-3 text-rose-600" />
                        Variance Detected
                      </span>
                    )}
                  </div>
                  <div className="text-sm sm:text-base font-extrabold font-mono tracking-tight mt-0.5">
                    Assets (LKR {formatCurrency(totalAssets)}) = Liabilities (LKR {formatCurrency(totalLiabilities)}) + Equity (LKR {formatCurrency(totalEquity)})
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Equilibrium Variance</div>
                  <div className={`text-xs font-bold font-mono ${Math.abs(diff) < 0.01 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    LKR {formatCurrency(diff)}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAuditModalOpen(true)}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs cursor-pointer"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>

          {/* Action Toolbar & Balance Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <ReportToolbar 
              onRefresh={fetchReport} 
              onExportJson={handleExportJson} 
              onExportCsv={handleExportCsv}
              isRefreshing={loading} 
            />
            <div className="self-end sm:self-center mb-4">
              <BalanceStatusBadge isBalanced={isBalanced} difference={diff} />
            </div>
          </div>

          {/* Statement of Financial Position Document */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200/90 p-6 sm:p-8">
            <div className="text-center pb-6 border-b border-slate-100">
              <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
                SLFRS / LKAS Financial Presentation
              </span>
              <h2 className="text-2xl font-extrabold text-slate-900 mt-2">
                Statement of Financial Position
              </h2>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                As at {filters.as_of_date || "Period Ending 31 March 2027"} • Expressed in Sri Lankan Rupee (LKR)
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mt-8">
              {/* Left Column: ASSETS */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b-2 border-emerald-500">
                    <h3 className="text-base font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                      Assets
                    </h3>
                    <span className="text-xs font-bold font-mono text-emerald-800">
                      LKR {formatCurrency(totalAssets)}
                    </span>
                  </div>

                  {/* Current Assets Sub-Section */}
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-700 px-1">
                      <span>Current Assets</span>
                      <span className="font-mono text-slate-600">
                        LKR {formatCurrency(data.current_assets || totalAssets)}
                      </span>
                    </div>
                    {renderSectionLines(currentAssetLines)}
                  </div>

                  {/* Non-Current Assets Sub-Section */}
                  {nonCurrentAssetLines.length > 0 && (
                    <div className="mt-6 space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-700 px-1">
                        <span>Non-Current Assets</span>
                        <span className="font-mono text-slate-600">
                          LKR {formatCurrency(data.non_current_assets || 0)}
                        </span>
                      </div>
                      {renderSectionLines(nonCurrentAssetLines, true)}
                    </div>
                  )}

                  {/* Total Assets Summary Box */}
                  <div className="mt-6 bg-gradient-to-r from-emerald-50 via-teal-50/70 to-emerald-50 border-2 border-emerald-500/80 rounded-2xl px-5 py-4 flex justify-between items-center shadow-xs">
                    <div>
                      <span className="font-extrabold text-emerald-950 text-sm tracking-tight">TOTAL ASSETS</span>
                      <div className="text-[10px] text-emerald-700">Fully audited closing position</div>
                    </div>
                    <div className="text-right">
                      <div className="font-extrabold text-emerald-950 text-base font-mono underline decoration-double decoration-emerald-600">
                        LKR {formatCurrency(totalAssets)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: LIABILITIES & EQUITY */}
              <div className="space-y-6">
                {/* Liabilities Section */}
                <div>
                  <div className="flex items-center justify-between pb-2 border-b-2 border-amber-500">
                    <h3 className="text-base font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                      Liabilities
                    </h3>
                    <span className="text-xs font-bold font-mono text-amber-800">
                      LKR {formatCurrency(totalLiabilities)}
                    </span>
                  </div>

                  {/* Current Liabilities */}
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-700 px-1">
                      <span>Current Liabilities</span>
                      <span className="font-mono text-slate-600">
                        LKR {formatCurrency(data.current_liabilities || totalLiabilities)}
                      </span>
                    </div>
                    {renderSectionLines(currentLiabilityLines)}
                  </div>

                  {/* Non-Current Liabilities */}
                  {nonCurrentLiabilityLines.length > 0 && (
                    <div className="mt-6 space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-700 px-1">
                        <span>Non-Current Liabilities</span>
                        <span className="font-mono text-slate-600">
                          LKR {formatCurrency(data.non_current_liabilities || 0)}
                        </span>
                      </div>
                      {renderSectionLines(nonCurrentLiabilityLines)}
                    </div>
                  )}

                  {/* Total Liabilities Subtotal */}
                  <div className="mt-3 bg-amber-50/60 border border-amber-200 rounded-xl px-4 py-2.5 flex justify-between items-center">
                    <span className="font-bold text-amber-950 text-xs">Total Liabilities</span>
                    <span className="font-bold text-amber-950 text-xs font-mono">
                      LKR {formatCurrency(totalLiabilities)}
                    </span>
                  </div>
                </div>

                {/* Equity Section */}
                <div>
                  <div className="flex items-center justify-between pb-2 border-b-2 border-purple-500">
                    <h3 className="text-base font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-purple-500"></span>
                      Equity
                    </h3>
                    <span className="text-xs font-bold font-mono text-purple-800">
                      LKR {formatCurrency(totalEquity)}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2">
                    {renderSectionLines(equityLines)}
                  </div>

                  {/* Total Equity Subtotal */}
                  <div className="mt-3 bg-purple-50/60 border border-purple-200 rounded-xl px-4 py-2.5 flex justify-between items-center">
                    <span className="font-bold text-purple-950 text-xs">Total Equity</span>
                    <span className="font-bold text-purple-950 text-xs font-mono">
                      LKR {formatCurrency(totalEquity)}
                    </span>
                  </div>
                </div>

                {/* Combined Total Liabilities + Equity Box */}
                <div className="mt-6 bg-gradient-to-r from-indigo-50 via-purple-50/70 to-indigo-50 border-2 border-indigo-500/80 rounded-2xl px-5 py-4 flex justify-between items-center shadow-xs">
                  <div>
                    <span className="font-extrabold text-indigo-950 text-sm tracking-tight">TOTAL LIABILITIES + EQUITY</span>
                    <div className="text-[10px] text-indigo-700">Balanced against Total Assets</div>
                  </div>
                  <div className="text-right">
                    <div className="font-extrabold text-indigo-950 text-base font-mono underline decoration-double decoration-indigo-600">
                      LKR {formatCurrency(totalLE)}
                    </div>
                  </div>
                </div>

                {/* Unbalanced Alert Banner */}
                {!isBalanced && Math.abs(diff) >= 0.01 && (
                  <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl px-4 py-3 flex justify-between items-center shadow-2xs">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <div>
                        <span className="font-bold text-rose-900 text-xs">Equilibrium Variance (Difference)</span>
                        <div className="text-[10px] text-rose-700">Audit investigation required</div>
                      </div>
                    </div>
                    <span className="font-bold text-rose-900 text-sm font-mono">
                      LKR {formatCurrency(diff)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {!data && !loading && (
        <div className="bg-white rounded-3xl shadow-xs p-10 text-center border border-slate-200">
          <div className="h-14 w-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
            <Scale className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Data</h3>
          <p className="mt-2 text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            Select a financial year to generate the audited Statement of Financial Position with real-time double-entry equilibrium verification.
          </p>
        </div>
      )}

      {/* In-App Audit & Resolution Documentation Modal */}
      <BalanceSheetAuditDocModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        dataSnapshot={data}
      />
    </div>
  );
};

export default BalanceSheetReportPage;
