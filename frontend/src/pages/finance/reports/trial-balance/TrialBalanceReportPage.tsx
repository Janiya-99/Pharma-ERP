import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../../../auth/AuthContext';
import { financeApi } from '../../../../api/financeApi';
import { getBranches } from '../../../../api/controlApi';
import { toast } from 'react-hot-toast';
import ReportPageHeader from '../../../../components/finance/reports/ReportPageHeader';
import ReportActions from '../../../../components/finance/reports/ReportActions';
import ReportFilterCard from '../../../../components/finance/reports/ReportFilterCard';
import ReportAmountCell from '../../../../components/finance/reports/ReportAmountCell';
import BalanceStatusBadge from '../../../../components/finance/reports/BalanceStatusBadge';
import { exportToPdf, exportToCsv, printFullReport } from '../../../../utils/reportExportUtils';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Button } from '../../../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  FileSpreadsheet, 
  FileText, 
  Printer, 
  Loader2, 
  Search, 
  Scale, 
  ShieldCheck, 
  AlertTriangle, 
  Layers, 
  ArrowUpDown, 
  Eye, 
  EyeOff, 
  Building2, 
  Calendar,
  X,
  SlidersHorizontal
} from 'lucide-react';
import { FinanceAiPromptBar } from '../../shared/FinanceAiPromptBar';
import { useDebounce } from '../../../../hooks/useDebounce';

interface TrialBalanceLine {
  account_id?: number;
  account_code: string;
  account_name: string;
  classification_name?: string;
  category?: string;
  opening_debit: number;
  opening_credit: number;
  period_debit: number;
  period_credit: number;
  closing_debit: number;
  closing_credit: number;
}

interface TrialBalanceData {
  lines: TrialBalanceLine[];
  total_opening_debit: number;
  total_opening_credit: number;
  total_period_debit: number;
  total_period_credit: number;
  total_closing_debit: number;
  total_closing_credit: number;
  is_balanced?: boolean;
  difference?: number;
}

const getAccountClassification = (line: TrialBalanceLine): 'Assets' | 'Liabilities' | 'Equity' | 'Revenue' | 'Expenses' | 'Other' => {
  const cName = (line.classification_name || line.category || '').toLowerCase();
  if (cName.includes('asset')) return 'Assets';
  if (cName.includes('liabilit')) return 'Liabilities';
  if (cName.includes('equity') || cName.includes('capital') || cName.includes('reserve') || cName.includes('retained')) return 'Equity';
  if (cName.includes('revenue') || cName.includes('income') || cName.includes('turnover') || cName.includes('sale')) return 'Revenue';
  if (cName.includes('expense') || cName.includes('cost') || cName.includes('overhead')) return 'Expenses';

  // Fallback to international standard numerical chart of accounts prefix
  const code = String(line.account_code || '').trim();
  if (code.startsWith('1')) return 'Assets';
  if (code.startsWith('2')) return 'Liabilities';
  if (code.startsWith('3')) return 'Equity';
  if (code.startsWith('4')) return 'Revenue';
  if (/^[5-9]/.test(code)) return 'Expenses';

  return 'Other';
};

const getClassificationBadgeStyle = (classification: string) => {
  switch (classification) {
    case 'Assets':
      return 'bg-sky-50 text-sky-700 border-sky-200';
    case 'Liabilities':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Equity':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'Revenue':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Expenses':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

const formatCurrency = (val: number | null | undefined): string => {
  if (val === null || val === undefined || isNaN(val)) return '0.00';
  return Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const TrialBalanceReportPage: React.FC = () => {
  const { hasPermission, activeBranch } = useAuth();
  
  const [data, setData] = useState<TrialBalanceData | null>(null);
  const [loading, setLoading] = useState(false);

  // Filter State
  const [financialYears, setFinancialYears] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);

  const [filters, setFilters] = useState({
    financial_year_id: "",
    date_from: "",
    date_to: "",
    branch_id: activeBranch?.id ? String(activeBranch.id) : ""
  });

  // In-table search & category filtering state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [hideZeroBalances, setHideZeroBalances] = useState(false);

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
        const initial = {
          ...filters,
          financial_year_id: String(activeFy.id),
          branch_id: activeBranch?.id ? String(activeBranch.id) : filters.branch_id
        };
        setFilters(initial);
        // Directly load report with initial filters
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

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
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

  // Filtered Lines
  const filteredLines = useMemo(() => {
    if (!data?.lines) return [];
    return data.lines.filter((line) => {
      // Zero balance check
      if (hideZeroBalances) {
        const hasClosing = (line.closing_debit || 0) !== 0 || (line.closing_credit || 0) !== 0;
        const hasPeriod = (line.period_debit || 0) !== 0 || (line.period_credit || 0) !== 0;
        if (!hasClosing && !hasPeriod) return false;
      }

      // Category check
      if (selectedCategory !== 'ALL') {
        const classification = getAccountClassification(line);
        if (classification !== selectedCategory) return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const codeMatch = (line.account_code || '').toLowerCase().includes(term);
        const nameMatch = (line.account_name || '').toLowerCase().includes(term);
        const classMatch = (line.classification_name || '').toLowerCase().includes(term);
        return codeMatch || nameMatch || classMatch;
      }

      return true;
    });
  }, [data?.lines, hideZeroBalances, selectedCategory, searchTerm]);

  // Counts by category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { ALL: 0, Assets: 0, Liabilities: 0, Equity: 0, Revenue: 0, Expenses: 0, Other: 0 };
    if (!data?.lines) return counts;
    counts.ALL = data.lines.length;
    for (const line of data.lines) {
      const cat = getAccountClassification(line);
      counts[cat] = (counts[cat] || 0) + 1;
    }
    return counts;
  }, [data?.lines]);

  // Equilibrium status calculation
  const totalClosingDr = data?.total_closing_debit || 0;
  const totalClosingCr = data?.total_closing_credit || 0;
  const variance = Math.abs(totalClosingDr - totalClosingCr);
  const isBalanced = data?.is_balanced ?? (variance < 0.01);

  // Selected financial year label
  const selectedFyName = useMemo(() => {
    const fy = financialYears.find(f => String(f.id) === String(filters.financial_year_id));
    return fy?.year_name || 'Current FY';
  }, [financialYears, filters.financial_year_id]);

  // Selected branch label
  const selectedBranchName = useMemo(() => {
    if (!filters.branch_id || filters.branch_id === 'all') return 'All Branches (Consolidated)';
    const br = branches.find(b => String(b.id) === String(filters.branch_id));
    return br?.branch_name || br?.name || 'Selected Branch';
  }, [branches, filters.branch_id]);

  // ==========================================
  // Export Handlers
  // ==========================================
  const handleExportCsv = () => {
    if (!data) return;
    const lines = filteredLines.length > 0 ? filteredLines : (data.lines || []);
    const headers = [
      'Account Code', 
      'Account Name', 
      'Classification',
      'Opening Dr (Rs.)', 
      'Opening Cr (Rs.)', 
      'Period Dr (Rs.)', 
      'Period Cr (Rs.)', 
      'Closing Dr (Rs.)', 
      'Closing Cr (Rs.)'
    ];
    
    const rows = lines.map((l: TrialBalanceLine) => [
      l.account_code || '',
      l.account_name || '',
      getAccountClassification(l),
      (l.opening_debit ?? 0).toFixed(2),
      (l.opening_credit ?? 0).toFixed(2),
      (l.period_debit ?? 0).toFixed(2),
      (l.period_credit ?? 0).toFixed(2),
      (l.closing_debit ?? 0).toFixed(2),
      (l.closing_credit ?? 0).toFixed(2),
    ]);

    // Grand totals row
    rows.push([
      'TOTAL',
      'EQUILIBRIUM GRAND TOTALS',
      isBalanced ? 'BALANCED' : 'IMBALANCE',
      (data.total_opening_debit ?? 0).toFixed(2),
      (data.total_opening_credit ?? 0).toFixed(2),
      (data.total_period_debit ?? 0).toFixed(2),
      (data.total_period_credit ?? 0).toFixed(2),
      (data.total_closing_debit ?? 0).toFixed(2),
      (data.total_closing_credit ?? 0).toFixed(2),
    ]);

    exportToCsv(
      `trial-balance-${filters.financial_year_id || 'fy'}-${new Date().toISOString().slice(0, 10)}`,
      headers,
      rows
    );
  };

  const handleExportPdf = () => {
    if (!data) return;
    const lines = filteredLines.length > 0 ? filteredLines : (data.lines || []);
    const headers = ['Code', 'Account Name', 'Opening Dr', 'Opening Cr', 'Period Dr', 'Period Cr', 'Closing Dr', 'Closing Cr'];
    
    const rows = lines.map((l: TrialBalanceLine) => [
      l.account_code || '',
      l.account_name || '',
      formatCurrency(l.opening_debit),
      formatCurrency(l.opening_credit),
      formatCurrency(l.period_debit),
      formatCurrency(l.period_credit),
      formatCurrency(l.closing_debit),
      formatCurrency(l.closing_credit),
    ]);

    rows.push([
      'TOTAL',
      'EQUILIBRIUM GRAND TOTALS',
      formatCurrency(data.total_opening_debit),
      formatCurrency(data.total_opening_credit),
      formatCurrency(data.total_period_debit),
      formatCurrency(data.total_period_credit),
      formatCurrency(data.total_closing_debit),
      formatCurrency(data.total_closing_credit),
    ]);

    exportToPdf({
      title: 'Trial Balance Report',
      filename: `trial-balance-${filters.financial_year_id || 'fy'}-${new Date().toISOString().slice(0, 10)}`,
      subtitle: `FY: ${selectedFyName} | Period: ${filters.date_from || 'Year Start'} to ${filters.date_to || 'Year End'} | Branch: ${selectedBranchName}`,
      headers,
      rows,
      alignments: ['left', 'left', 'right', 'right', 'right', 'right', 'right', 'right'],
      summary: [
        { title: 'Total Closing Debit', value: `Rs. ${formatCurrency(data.total_closing_debit)}` },
        { title: 'Total Closing Credit', value: `Rs. ${formatCurrency(data.total_closing_credit)}` },
        { title: 'Equilibrium Variance', value: `Rs. ${formatCurrency(variance)}` },
        { title: 'Double-Entry Status', value: isBalanced ? 'BALANCED' : 'IMBALANCE DETECTED' },
      ],
      orientation: 'landscape'
    });
  };

  const handlePrint = () => {
    if (!data) return;
    const lines = filteredLines.length > 0 ? filteredLines : (data.lines || []);
    const headers = ['Code', 'Account Name', 'Class', 'Opening Dr', 'Opening Cr', 'Period Dr', 'Period Cr', 'Closing Dr', 'Closing Cr'];
    
    const rows = lines.map((l: TrialBalanceLine) => [
      l.account_code || '',
      l.account_name || '',
      getAccountClassification(l),
      formatCurrency(l.opening_debit),
      formatCurrency(l.opening_credit),
      formatCurrency(l.period_debit),
      formatCurrency(l.period_credit),
      formatCurrency(l.closing_debit),
      formatCurrency(l.closing_credit),
    ]);

    rows.push([
      'TOTAL',
      'EQUILIBRIUM GRAND TOTALS',
      '-',
      formatCurrency(data.total_opening_debit),
      formatCurrency(data.total_opening_credit),
      formatCurrency(data.total_period_debit),
      formatCurrency(data.total_period_credit),
      formatCurrency(data.total_closing_debit),
      formatCurrency(data.total_closing_credit),
    ]);

    printFullReport({
      title: 'Trial Balance Report',
      subtitle: `Financial Year: ${selectedFyName} | Period: ${filters.date_from || 'Start'} to ${filters.date_to || 'End'} | Scope: ${selectedBranchName}`,
      headers,
      rows,
      alignments: ['left', 'left', 'center', 'right', 'right', 'right', 'right', 'right', 'right'],
      summary: [
        { title: 'Total Closing Debit', value: `Rs. ${formatCurrency(data.total_closing_debit)}` },
        { title: 'Total Closing Credit', value: `Rs. ${formatCurrency(data.total_closing_credit)}` },
        { title: 'Variance', value: `Rs. ${formatCurrency(variance)}` },
        { title: 'Status', value: isBalanced ? 'BALANCED' : 'OUT OF BALANCE' },
      ],
    });
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

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* ── Page Header with Integrated Executive Action Bar (Replacing old floating toolbar) ── */}
      <ReportPageHeader 
        title="Trial Balance" 
        description="Comprehensive nominal ledger verification statement checking mathematical equilibrium between debit and credit postings."
        actions={
          <ReportActions
            onRefresh={() => fetchReport()}
            onExportCsv={handleExportCsv}
            onExportPdf={handleExportPdf}
            onPrint={handlePrint}
            loading={loading}
            disabled={!data}
          />
        }
      />

      {/* AI Copilot Prompting Bar */}
      <FinanceAiPromptBar
        contextType="trial_balance"
        pageTitle="Trial Balance"
        dataSnapshot={data}
      />

      {/* ── Modern Report Filter Card ── */}
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

      {/* ── Table Section Loading State with Animated Gradient and Spinner ── */}
      {loading && !data && (
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 shadow-xs">
          <div className="absolute top-0 inset-x-0 h-0.5 bg-slate-100 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 via-sky-400 to-indigo-600 animate-pulse w-full" />
          </div>
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 shadow-inner">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Compiling Trial Balance...</h3>
            <p className="text-xs text-slate-500 max-w-sm text-center">
              Reconciling general ledger debit and credit entries, computing opening positions, and verifying double-entry equilibrium.
            </p>
          </div>
        </div>
      )}

      {data && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* ── 4 Executive CFO-Grade Equilibrium KPI Summary Cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Opening Position */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs relative overflow-hidden transition-all hover:border-slate-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Opening Position
                </span>
                <div className="h-8 w-8 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
                  <Layers className="h-4 w-4" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-500 font-medium">Opening Dr:</span>
                  <span className="text-sm font-bold text-slate-800">Rs. {formatCurrency(data.total_opening_debit)}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-500 font-medium">Opening Cr:</span>
                  <span className="text-sm font-bold text-slate-800">Rs. {formatCurrency(data.total_opening_credit)}</span>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Net Position</span>
                <span className="font-semibold text-slate-700">
                  Rs. {formatCurrency(Math.abs((data.total_opening_debit || 0) - (data.total_opening_credit || 0)))}
                </span>
              </div>
            </div>

            {/* Card 2: Period Turnover */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs relative overflow-hidden transition-all hover:border-slate-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Period Movement
                </span>
                <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-500 font-medium">Period Dr:</span>
                  <span className="text-sm font-bold text-slate-800">Rs. {formatCurrency(data.total_period_debit)}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-500 font-medium">Period Cr:</span>
                  <span className="text-sm font-bold text-slate-800">Rs. {formatCurrency(data.total_period_credit)}</span>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Total Turnover</span>
                <span className="font-semibold text-indigo-600">
                  Rs. {formatCurrency((data.total_period_debit || 0) + (data.total_period_credit || 0))}
                </span>
              </div>
            </div>

            {/* Card 3: Closing Balance */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs relative overflow-hidden transition-all hover:border-slate-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Closing Balances
                </span>
                <div className="h-8 w-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <Scale className="h-4 w-4" />
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-500 font-medium">Closing Dr:</span>
                  <span className="text-sm font-bold text-slate-900">Rs. {formatCurrency(data.total_closing_debit)}</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-slate-500 font-medium">Closing Cr:</span>
                  <span className="text-sm font-bold text-slate-900">Rs. {formatCurrency(data.total_closing_credit)}</span>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Active Accounts</span>
                <span className="font-semibold text-slate-700">{data.lines?.length || 0} accounts</span>
              </div>
            </div>

            {/* Card 4: Double-Entry Equilibrium Status */}
            <div className={`rounded-2xl border p-5 shadow-xs relative overflow-hidden transition-all ${
              isBalanced 
                ? 'bg-gradient-to-br from-emerald-500 to-teal-700 text-white border-emerald-600' 
                : 'bg-gradient-to-br from-rose-500 to-amber-600 text-white border-rose-600'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-100">
                  Equilibrium Audit
                </span>
                <div className="h-8 w-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                  {isBalanced ? <ShieldCheck className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
                </div>
              </div>
              <div className="text-2xl font-black tracking-tight mt-1">
                {isBalanced ? 'BALANCED' : 'IMBALANCE'}
              </div>
              <p className="text-xs text-white/80 mt-1">
                {isBalanced 
                  ? 'Variance: Rs. 0.00 (Dr = Cr)' 
                  : `Variance: Rs. ${formatCurrency(variance)} (Debit ≠ Credit)`}
              </p>
              <div className="mt-3 pt-2 border-t border-white/20 text-[10px] text-white/80 flex items-center justify-between">
                <span>Verification</span>
                <span className="font-semibold">Double-Entry Certified</span>
              </div>
            </div>

          </div>

          {/* ── Main Trial Balance Card ── */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            
            {/* Header Toolbar: Title, Search, and Classification Pills */}
            <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-slate-50/50 space-y-4">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <Scale className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Nominal Ledger Accounts</h3>
                    <p className="text-xs text-slate-500">
                      Showing {filteredLines.length} of {data.lines?.length || 0} nominal ledger accounts
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {/* Search box */}
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Search code, title..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 pr-7 h-8 text-xs bg-white border-slate-200"
                    />
                    {searchTerm && (
                      <button 
                        onClick={() => setSearchTerm('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Hide zero balances toggle */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setHideZeroBalances(prev => !prev)}
                    className={`h-8 gap-1.5 text-xs border-slate-200 cursor-pointer font-medium ${
                      hideZeroBalances ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-white text-slate-600'
                    }`}
                  >
                    {hideZeroBalances ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                    <span className="hidden sm:inline">{hideZeroBalances ? 'Active Only' : 'Show All'}</span>
                  </Button>
                </div>
              </div>

              {/* Classification Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {[
                  { key: 'ALL', label: 'All Accounts' },
                  { key: 'Assets', label: 'Assets' },
                  { key: 'Liabilities', label: 'Liabilities' },
                  { key: 'Equity', label: 'Equity' },
                  { key: 'Revenue', label: 'Revenue' },
                  { key: 'Expenses', label: 'Expenses' },
                ].map((cat) => {
                  const count = categoryCounts[cat.key] || 0;
                  const isActive = selectedCategory === cat.key;
                  return (
                    <button
                      key={cat.key}
                      onClick={() => setSelectedCategory(cat.key)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer text-xs ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                        isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

            </div>

            {/* Table Container */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                    <th scope="col" className="py-3 px-4 w-28">Account Code</th>
                    <th scope="col" className="py-3 px-4">Account Name & Classification</th>
                    <th scope="col" className="py-3 px-4 text-right w-32">Opening Dr</th>
                    <th scope="col" className="py-3 px-4 text-right w-32">Opening Cr</th>
                    <th scope="col" className="py-3 px-4 text-right w-32">Period Dr</th>
                    <th scope="col" className="py-3 px-4 text-right w-32">Period Cr</th>
                    <th scope="col" className="py-3 px-4 text-right w-36 bg-indigo-50/60 text-indigo-900 border-l border-indigo-100">Closing Dr</th>
                    <th scope="col" className="py-3 px-4 text-right w-36 bg-indigo-50/60 text-indigo-900">Closing Cr</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredLines.length > 0 ? (
                    filteredLines.map((line: TrialBalanceLine, idx: number) => {
                      const classification = getAccountClassification(line);
                      const badgeClass = getClassificationBadgeStyle(classification);
                      const hasClosingDr = (line.closing_debit || 0) > 0;
                      const hasClosingCr = (line.closing_credit || 0) > 0;

                      return (
                        <tr 
                          key={line.account_id || line.account_code || idx} 
                          className="hover:bg-slate-50/80 transition-colors"
                        >
                          {/* Code */}
                          <td className="py-2.5 px-4 font-mono font-bold text-slate-800 whitespace-nowrap">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200/60 text-[11px]">
                              {line.account_code}
                            </span>
                          </td>

                          {/* Name & Classification badge */}
                          <td className="py-2.5 px-4 font-medium text-slate-900">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-slate-800">{line.account_name}</span>
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border ${badgeClass}`}>
                                {classification}
                              </span>
                            </div>
                          </td>

                          {/* Opening Dr */}
                          <td className="py-2.5 px-4 text-right tabular-nums text-slate-700">
                            <ReportAmountCell amount={line.opening_debit} />
                          </td>

                          {/* Opening Cr */}
                          <td className="py-2.5 px-4 text-right tabular-nums text-slate-700">
                            <ReportAmountCell amount={line.opening_credit} />
                          </td>

                          {/* Period Dr */}
                          <td className="py-2.5 px-4 text-right tabular-nums text-slate-700 font-medium">
                            <ReportAmountCell amount={line.period_debit} />
                          </td>

                          {/* Period Cr */}
                          <td className="py-2.5 px-4 text-right tabular-nums text-slate-700 font-medium">
                            <ReportAmountCell amount={line.period_credit} />
                          </td>

                          {/* Closing Dr */}
                          <td className={`py-2.5 px-4 text-right tabular-nums bg-indigo-50/30 border-l border-indigo-100 ${
                            hasClosingDr ? 'font-bold text-slate-900' : 'text-slate-400'
                          }`}>
                            <ReportAmountCell amount={line.closing_debit} />
                          </td>

                          {/* Closing Cr */}
                          <td className={`py-2.5 px-4 text-right tabular-nums bg-indigo-50/30 ${
                            hasClosingCr ? 'font-bold text-slate-900' : 'text-slate-400'
                          }`}>
                            <ReportAmountCell amount={line.closing_credit} />
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        <AlertCircle className="h-8 w-8 mx-auto text-slate-400 mb-2" />
                        <p className="font-semibold text-slate-700">No accounts match the selected criteria</p>
                        <p className="text-xs text-slate-400 mt-1">
                          Try clearing the search query or selecting "All Accounts".
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>

                {/* ── Accounting Standard Double-Underlined Pinned Equilibrium Grand Totals Footer ── */}
                <tfoot>
                  <tr className="bg-slate-900 text-white font-bold border-t-2 border-slate-900 text-xs">
                    <td className="py-3 px-4 font-mono uppercase tracking-wider text-[11px]" colSpan={2}>
                      <div className="flex items-center gap-2">
                        <span>Grand Equilibrium Totals</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                          isBalanced ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' : 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                        }`}>
                          {isBalanced ? 'Balanced' : 'Imbalance'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums text-slate-200">
                      Rs. {formatCurrency(data.total_opening_debit)}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums text-slate-200">
                      Rs. {formatCurrency(data.total_opening_credit)}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums text-slate-200">
                      Rs. {formatCurrency(data.total_period_debit)}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums text-slate-200">
                      Rs. {formatCurrency(data.total_period_credit)}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums text-white bg-slate-800/90 font-extrabold border-l border-slate-700">
                      <span className="border-b-2 border-white/60 pb-0.5">
                        Rs. {formatCurrency(data.total_closing_debit)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums text-white bg-slate-800/90 font-extrabold">
                      <span className="border-b-2 border-white/60 pb-0.5">
                        Rs. {formatCurrency(data.total_closing_credit)}
                      </span>
                    </td>
                  </tr>

                  {/* Variance row if out of balance */}
                  {!isBalanced && (
                    <tr className="bg-rose-50 text-rose-800 font-bold border-t border-rose-200 text-xs">
                      <td colSpan={6} className="py-2 px-4">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-rose-600" />
                          <span>Double-Entry Discrepancy (Total Closing Debit - Total Closing Credit):</span>
                        </div>
                      </td>
                      <td colSpan={2} className="py-2 px-4 text-right text-rose-700 font-mono font-bold text-sm">
                        Rs. {formatCurrency(variance)}
                      </td>
                    </tr>
                  )}
                </tfoot>
              </table>
            </div>

            {/* Bottom meta caption */}
            <div className="p-3 bg-slate-50/70 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className={`h-3.5 w-3.5 ${isBalanced ? 'text-emerald-600' : 'text-amber-500'}`} />
                <span>
                  {isBalanced 
                    ? 'Mathematical equilibrium certified: Total Debits equal Total Credits.' 
                    : `Warning: A non-zero equilibrium variance of Rs. ${formatCurrency(variance)} exists.`}
                </span>
              </div>
              <div className="text-slate-400">
                Generated from nominal general ledger transactions
              </div>
            </div>

          </div>

        </div>
      )}
      
      {/* ── High-Fidelity Empty State ── */}
      {!data && !loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto mb-4">
            <Scale className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Select Financial Year & Parameters</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            Choose a financial year and optional date range or branch filter above to generate the reconciled Trial Balance report.
          </p>
        </div>
      )}
    </div>
  );
};

export default TrialBalanceReportPage;
