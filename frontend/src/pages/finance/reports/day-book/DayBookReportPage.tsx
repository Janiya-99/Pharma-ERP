import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../../../auth/AuthContext';
import { financeApi } from '../../../../api/financeApi';
import { getBranches } from '../../../../api/controlApi';
import { toast } from 'react-hot-toast';
import { format, parseISO } from 'date-fns';
import ReportPageHeader from '../../../../components/finance/reports/ReportPageHeader';
import ReportFilterCard from '../../../../components/finance/reports/ReportFilterCard';
import ReportAmountCell from '../../../../components/finance/reports/ReportAmountCell';
import SourceTypeBadge from '../../../../components/finance/reports/SourceTypeBadge';
import { exportToPdf, exportToCsv, printFullReport } from '../../../../utils/reportExportUtils';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Button } from '../../../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { 
  AlertCircle, 
  RefreshCw, 
  FileSpreadsheet, 
  FileText, 
  Printer, 
  Loader2, 
  Search, 
  Calendar, 
  ArrowUpDown, 
  ShieldCheck, 
  AlertTriangle, 
  Layers, 
  ChevronDown, 
  ChevronRight, 
  X, 
  Eye, 
  EyeOff, 
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { TablePagination } from '../../../../components/common/TablePagination';
import { FinanceAiPromptBar } from '../../shared/FinanceAiPromptBar';
import { useDebounce } from '../../../../hooks/useDebounce';

interface DayBookLine {
  id: number;
  transaction_date: string;
  source_type: string;
  source_number: string;
  account_code: string;
  account_name: string;
  description: string;
  debit_amount: number;
  credit_amount: number;
}

interface DayBookDay {
  date: string;
  transaction_date?: string;
  lines: DayBookLine[];
  entries?: DayBookLine[];
  total_debit: number;
  total_credit: number;
}

interface DayBookReportData {
  groups?: DayBookDay[];
  days?: DayBookDay[];
  total_debit?: number;
  total_credit?: number;
  total_transactions?: number;
  total_days?: number;
}

const SOURCE_TYPES = [
  { value: 'all', label: 'All Source Types' },
  { value: 'JOURNAL', label: 'Journal Entries' },
  { value: 'PAYMENT_VOUCHER', label: 'Payment Vouchers' },
  { value: 'RECEIPT_VOUCHER', label: 'Receipt Vouchers' },
  { value: 'PETTY_CASH_VOUCHER', label: 'Petty Cash Vouchers' },
  { value: 'OPENING_BALANCE', label: 'Opening Balances' },
  { value: 'FIXED_ASSET_DEPRECIATION', label: 'Fixed Asset Depreciation' },
  { value: 'MANUAL_ADJUSTMENT', label: 'Manual Adjustments' },
];

const formatCurrency = (val: number | null | undefined): string => {
  if (val === null || val === undefined || isNaN(val)) return '0.00';
  return Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatDayHeading = (dateStr: string): string => {
  if (!dateStr) return 'Undated Transactions';
  try {
    const d = parseISO(dateStr);
    return format(d, 'EEEE, MMMM d, yyyy');
  } catch {
    return dateStr;
  }
};

const DayBookReportPage: React.FC = () => {
  const { hasPermission, activeBranch } = useAuth();
  
  const [data, setData] = useState<DayBookReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState<any[]>([]);

  // Filter State - Defaulting to All Transactions so data is immediately loaded
  const [filters, setFilters] = useState({
    date_from: "",
    date_to: "",
    preset: "all",
    source_type: "",
    branch_id: activeBranch?.id ? String(activeBranch.id) : ""
  });

  // Table In-page Search & Controls
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSourceTypePill, setSelectedSourceTypePill] = useState<string>('ALL');
  const [collapsedDays, setCollapsedDays] = useState<Record<string, boolean>>({});

  // Pagination for days
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const debouncedFilters = useDebounce(filters, 300);

  const fetchReport = useCallback(async (customFilters?: any) => {
    const activeF = customFilters || filters;
    setLoading(true);
    try {
      const params: Record<string, any> = {};
      if (activeF.date_from) params.date_from = activeF.date_from;
      if (activeF.date_to) params.date_to = activeF.date_to;
      if (activeF.branch_id && activeF.branch_id !== "all") params.branch_id = activeF.branch_id;
      if (activeF.source_type && activeF.source_type !== "all") params.source_type = activeF.source_type;

      const response = await financeApi.getDayBookReport(params);
      if (response.data?.success) {
        setData(response.data.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch Day Book report");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const loadBranches = async () => {
      try {
        const res = await getBranches({ limit: 100, status: "active" });
        const list = res.data?.data?.items || res.data?.data || res.data || [];
        if (Array.isArray(list)) setBranches(list);
      } catch (err) {
        console.error("Failed to load branches", err);
      }
    };
    loadBranches();
  }, []);

  useEffect(() => {
    if (activeBranch?.id) {
      setFilters(prev => ({ ...prev, branch_id: String(activeBranch.id) }));
    }
  }, [activeBranch]);

  // Initial Load
  useEffect(() => {
    fetchReport(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchReport(debouncedFilters);
  }, [debouncedFilters, fetchReport]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handlePresetChange = (preset: string) => {
    const today = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    const formatDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    if (preset === "all") {
      setFilters(prev => ({ ...prev, preset: "all", date_from: "", date_to: "" }));
    } else if (preset === "today") {
      const todayStr = formatDate(today);
      setFilters(prev => ({ ...prev, preset: "today", date_from: todayStr, date_to: todayStr }));
    } else if (preset === "this_month") {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      setFilters(prev => ({ ...prev, preset: "this_month", date_from: formatDate(startOfMonth), date_to: formatDate(today) }));
    } else if (preset === "last_month") {
      const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      setFilters(prev => ({ ...prev, preset: "last_month", date_from: formatDate(startOfLastMonth), date_to: formatDate(endOfLastMonth) }));
    } else if (preset === "ytd") {
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      setFilters(prev => ({ ...prev, preset: "ytd", date_from: formatDate(startOfYear), date_to: formatDate(today) }));
    } else {
      setFilters(prev => ({ ...prev, preset: "custom" }));
    }
  };

  const handleClearFilters = () => {
    const reset = {
      date_from: "",
      date_to: "",
      preset: "all",
      source_type: "",
      branch_id: activeBranch?.id ? String(activeBranch.id) : ""
    };
    setFilters(reset);
    fetchReport(reset);
  };

  // Normalization of Days / Groups
  const normalizedDays: DayBookDay[] = useMemo(() => {
    const rawList: DayBookDay[] = data?.days || data?.groups || [];
    return rawList.map((d: any) => ({
      date: d.date || d.transaction_date || '',
      transaction_date: d.transaction_date || d.date || '',
      lines: d.lines || d.entries || [],
      entries: d.entries || d.lines || [],
      total_debit: Number(d.total_debit || 0),
      total_credit: Number(d.total_credit || 0),
    }));
  }, [data]);

  // In-page search and pill filtering
  const filteredDays = useMemo(() => {
    if (!normalizedDays || normalizedDays.length === 0) return [];
    const term = searchTerm.toLowerCase().trim();
    const pill = selectedSourceTypePill.toUpperCase();

    return normalizedDays.map(day => {
      const filteredLines = (day.lines || []).filter(line => {
        // Pill filter
        if (pill !== 'ALL') {
          const sType = String(line.source_type || '').toUpperCase();
          if (!sType.includes(pill)) return false;
        }

        // Search term
        if (term) {
          const sNum = String(line.source_number || '').toLowerCase();
          const aCode = String(line.account_code || '').toLowerCase();
          const aName = String(line.account_name || '').toLowerCase();
          const desc = String(line.description || '').toLowerCase();
          const sType = String(line.source_type || '').toLowerCase();
          return sNum.includes(term) || aCode.includes(term) || aName.includes(term) || desc.includes(term) || sType.includes(term);
        }

        return true;
      });

      const dayTotalDr = filteredLines.reduce((sum, l) => sum + (l.debit_amount || 0), 0);
      const dayTotalCr = filteredLines.reduce((sum, l) => sum + (l.credit_amount || 0), 0);

      return {
        ...day,
        lines: filteredLines,
        total_debit: dayTotalDr,
        total_credit: dayTotalCr
      };
    }).filter(day => day.lines.length > 0);
  }, [normalizedDays, searchTerm, selectedSourceTypePill]);

  // Aggregated Overall Totals
  const { totalDebit, totalCredit, totalTransactions, isBalanced, variance } = useMemo(() => {
    let dr = 0;
    let cr = 0;
    let count = 0;

    for (const day of filteredDays) {
      dr += day.total_debit;
      cr += day.total_credit;
      count += day.lines.length;
    }

    const diff = Math.abs(dr - cr);
    return {
      totalDebit: dr,
      totalCredit: cr,
      totalTransactions: count,
      isBalanced: diff < 0.01,
      variance: diff
    };
  }, [filteredDays]);

  // Pagination
  useEffect(() => {
    if (page > 0 && page * pageSize >= filteredDays.length) {
      setPage(0);
    }
  }, [filteredDays.length, page, pageSize]);

  const pagedDays = useMemo(() => {
    const start = page * pageSize;
    return filteredDays.slice(start, start + pageSize);
  }, [filteredDays, page, pageSize]);

  const toggleDayCollapse = (date: string) => {
    setCollapsedDays(prev => ({ ...prev, [date]: !prev[date] }));
  };

  const expandAllDays = () => setCollapsedDays({});
  const collapseAllDays = () => {
    const allCollapsed: Record<string, boolean> = {};
    for (const d of filteredDays) {
      allCollapsed[d.date] = true;
    }
    setCollapsedDays(allCollapsed);
  };

  // Branch Name Label
  const selectedBranchName = useMemo(() => {
    if (!filters.branch_id || filters.branch_id === "all") return "All Branches (Consolidated)";
    const b = branches.find(br => String(br.id) === String(filters.branch_id));
    return b?.branch_name || b?.name || "Selected Branch";
  }, [branches, filters.branch_id]);

  // ==========================================
  // Export Handlers
  // ==========================================
  const handleExportCsv = () => {
    if (filteredDays.length === 0) return;
    const headers = [
      'Transaction Date', 
      'Source Type', 
      'Voucher / Ref No', 
      'Account Code', 
      'Account Name', 
      'Description', 
      'Debit (Rs.)', 
      'Credit (Rs.)'
    ];
    
    const rows: (string | number)[][] = [];

    filteredDays.forEach(day => {
      day.lines.forEach(l => {
        rows.push([
          day.date,
          l.source_type || '',
          l.source_number || '',
          l.account_code || '',
          l.account_name || '',
          l.description || '',
          (l.debit_amount || 0).toFixed(2),
          (l.credit_amount || 0).toFixed(2),
        ]);
      });
      rows.push([
        `${day.date} DAILY TOTAL`,
        '', '', '', '', 'Subtotal',
        day.total_debit.toFixed(2),
        day.total_credit.toFixed(2),
      ]);
    });

    // Grand totals
    rows.push([
      'GRAND EQUILIBRIUM TOTALS',
      isBalanced ? 'BALANCED' : 'IMBALANCE',
      '', '', '', 'Grand Total',
      totalDebit.toFixed(2),
      totalCredit.toFixed(2),
    ]);

    exportToCsv(
      `day-book-${filters.date_from || 'start'}-to-${filters.date_to || 'end'}-${new Date().toISOString().slice(0, 10)}`,
      headers,
      rows
    );
  };

  const handleExportPdf = () => {
    if (filteredDays.length === 0) return;
    const headers = ['Date', 'Source', 'Voucher #', 'Code', 'Account Title', 'Narration', 'Debit (Rs.)', 'Credit (Rs.)'];
    const rows: (string | number)[][] = [];

    filteredDays.forEach(day => {
      day.lines.forEach(l => {
        rows.push([
          day.date,
          l.source_type || '',
          l.source_number || '',
          l.account_code || '',
          l.account_name || '',
          l.description || '',
          formatCurrency(l.debit_amount),
          formatCurrency(l.credit_amount),
        ]);
      });
      rows.push([
        day.date,
        'DAILY TOTAL',
        '', '', '', 'Subtotal',
        formatCurrency(day.total_debit),
        formatCurrency(day.total_credit),
      ]);
    });

    rows.push([
      'ALL DAYS',
      'GRAND TOTALS',
      '', '', '', 'Grand Total',
      formatCurrency(totalDebit),
      formatCurrency(totalCredit),
    ]);

    exportToPdf({
      title: 'Day Book Ledger Report',
      filename: `day-book-${filters.date_from || 'start'}-to-${filters.date_to || 'end'}-${new Date().toISOString().slice(0, 10)}`,
      subtitle: `Period: ${filters.date_from || 'Full History'} to ${filters.date_to || 'Current'} | Scope: ${selectedBranchName}`,
      headers,
      rows,
      alignments: ['left', 'center', 'left', 'left', 'left', 'left', 'right', 'right'],
      summary: [
        { title: 'Total Debit Turnover', value: `Rs. ${formatCurrency(totalDebit)}` },
        { title: 'Total Credit Turnover', value: `Rs. ${formatCurrency(totalCredit)}` },
        { title: 'Total Transactions', value: `${totalTransactions} lines` },
        { title: 'Equilibrium Parity', value: isBalanced ? 'BALANCED (0.00 Variance)' : `IMBALANCE (Rs. ${formatCurrency(variance)})` },
      ],
      orientation: 'landscape'
    });
  };

  const handlePrint = () => {
    if (filteredDays.length === 0) return;
    const headers = ['Date', 'Source', 'Voucher #', 'Code', 'Account Title', 'Narration', 'Debit (Rs.)', 'Credit (Rs.)'];
    const rows: (string | number)[][] = [];

    filteredDays.forEach(day => {
      day.lines.forEach(l => {
        rows.push([
          day.date,
          l.source_type || '',
          l.source_number || '',
          l.account_code || '',
          l.account_name || '',
          l.description || '',
          formatCurrency(l.debit_amount),
          formatCurrency(l.credit_amount),
        ]);
      });
    });

    rows.push([
      'TOTAL',
      'GRAND TOTALS',
      '', '', '', 'Reconciliation',
      formatCurrency(totalDebit),
      formatCurrency(totalCredit),
    ]);

    printFullReport({
      title: 'Day Book Ledger Report',
      subtitle: `Period: ${filters.date_from || 'Earliest'} to ${filters.date_to || 'Latest'} | Scope: ${selectedBranchName}`,
      headers,
      rows,
      alignments: ['left', 'center', 'left', 'left', 'left', 'left', 'right', 'right'],
      summary: [
        { title: 'Total Debit', value: `Rs. ${formatCurrency(totalDebit)}` },
        { title: 'Total Credit', value: `Rs. ${formatCurrency(totalCredit)}` },
        { title: 'Transactions', value: `${totalTransactions} entries` },
        { title: 'Status', value: isBalanced ? 'BALANCED' : 'IMBALANCE' },
      ],
    });
  };

  const canView =
    hasPermission("finance.report.day_book.view") ||
    hasPermission("finance.report.view") ||
    hasPermission("finance.reports.view");

  if (!canView) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
        <p className="text-gray-500">You do not have permission to view the Day Book report.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* ── Page Header with Integrated Actions (Replacing old floating toolbar) ── */}
      <ReportPageHeader 
        title="Day Book" 
        description="Chronological audit register of all nominal general ledger vouchers, cash/bank transactions, and journal entries."
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => fetchReport()} 
              disabled={loading}
              className="h-8.5 gap-1.5 text-xs bg-white text-slate-700 hover:bg-slate-50 border-slate-200 shadow-2xs font-semibold cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExportCsv} 
              disabled={loading || filteredDays.length === 0}
              className="h-8.5 gap-1.5 text-xs bg-white text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-200 shadow-2xs font-semibold cursor-pointer"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
              Export Excel
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExportPdf} 
              disabled={loading || filteredDays.length === 0}
              className="h-8.5 gap-1.5 text-xs bg-white text-rose-700 hover:text-rose-800 hover:bg-rose-50 border-rose-200 shadow-2xs font-semibold cursor-pointer"
            >
              <FileText className="h-3.5 w-3.5 text-rose-600" />
              Export PDF
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePrint}
              disabled={loading || filteredDays.length === 0}
              className="h-8.5 gap-1.5 text-xs bg-white text-slate-700 hover:bg-slate-50 border-slate-200 shadow-2xs font-semibold cursor-pointer hidden sm:flex"
            >
              <Printer className="h-3.5 w-3.5" />
              Print
            </Button>
          </div>
        }
      />

      {/* AI Copilot Prompting Bar */}
      <FinanceAiPromptBar
        contextType="day_book"
        pageTitle="Day Book"
        dataSnapshot={data}
      />

      {/* ── Modern Report Filter Card ── */}
      <ReportFilterCard 
        onApply={() => fetchReport(filters)} 
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
          <Label>Quick Period Preset</Label>
          <Select
            value={filters.preset}
            onValueChange={handlePresetChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Transactions (Full History)</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="ytd">Year to Date (YTD)</SelectItem>
              <SelectItem value="custom">Custom Date Range</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Date From</Label>
          <Input 
            type="date" 
            value={filters.date_from}
            onChange={(e: any) => {
              handleFilterChange('date_from', e.target.value);
              handleFilterChange('preset', 'custom');
            }}
            placeholder="Start date" 
          />
        </div>

        <div className="space-y-2">
          <Label>Date To</Label>
          <Input 
            type="date" 
            value={filters.date_to}
            onChange={(e: any) => {
              handleFilterChange('date_to', e.target.value);
              handleFilterChange('preset', 'custom');
            }}
            placeholder="End date" 
          />
        </div>

        <div className="space-y-2">
          <Label>Source Type Filter</Label>
          <Select 
            value={filters.source_type || "all"} 
            onValueChange={(val: string) => handleFilterChange('source_type', val === "all" ? "" : val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Source Types" />
            </SelectTrigger>
            <SelectContent>
              {SOURCE_TYPES.map(st => (
                <SelectItem key={st.value} value={st.value}>{st.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </ReportFilterCard>

      {/* ── Table Loading State with Animated Gradient and Spinner ── */}
      {loading && !data && (
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 shadow-xs">
          <div className="absolute top-0 inset-x-0 h-0.5 bg-slate-100 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 via-sky-400 to-indigo-600 animate-pulse w-full" />
          </div>
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 shadow-inner">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Compiling Day Book...</h3>
            <p className="text-xs text-slate-500 max-w-sm text-center">
              Reconciling chronological general ledger movements, aggregating daily turnover, and verifying transaction equilibrium.
            </p>
          </div>
        </div>
      )}

      {/* ── 4 Executive CFO-Grade KPI Equilibrium Summary Cards ── */}
      {data && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Total Debit Volume */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs relative overflow-hidden transition-all hover:border-slate-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Total Debit Volume
                </span>
                <div className="h-8 w-8 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                Rs. {formatCurrency(totalDebit)}
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Active Days</span>
                <span className="font-semibold text-slate-700">{filteredDays.length} transaction days</span>
              </div>
            </div>

            {/* Card 2: Total Credit Volume */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs relative overflow-hidden transition-all hover:border-slate-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Total Credit Volume
                </span>
                <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <ArrowUpDown className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                Rs. {formatCurrency(totalCredit)}
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Net Posted Volume</span>
                <span className="font-semibold text-indigo-600">Rs. {formatCurrency(totalDebit + totalCredit)}</span>
              </div>
            </div>

            {/* Card 3: Transaction Activity */}
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs relative overflow-hidden transition-all hover:border-slate-300">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Transaction Lines
                </span>
                <div className="h-8 w-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <Layers className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 tracking-tight">
                {totalTransactions.toLocaleString()}
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span>Scope</span>
                <span className="font-semibold text-slate-700">{selectedBranchName}</span>
              </div>
            </div>

            {/* Card 4: Double-Entry Equilibrium Audit */}
            <div className={`rounded-2xl border p-5 shadow-xs relative overflow-hidden transition-all ${
              isBalanced 
                ? 'bg-gradient-to-br from-emerald-500 to-teal-700 text-white border-emerald-600' 
                : 'bg-gradient-to-br from-rose-500 to-amber-600 text-white border-rose-600'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-100">
                  Double-Entry Audit
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
                <span>Certification</span>
                <span className="font-semibold">Mathematical Parity Verified</span>
              </div>
            </div>

          </div>

          {/* ── Main Day Book Stream Container ── */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
            
            {/* Header Toolbar: Search, Source Pills, and Expand/Collapse Controls */}
            <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-slate-50/50 space-y-4">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">Chronological Day Book</h3>
                    <p className="text-xs text-slate-500">
                      Showing {filteredDays.length} active transaction days ({totalTransactions} entries total)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {/* Search box */}
                  <div className="relative flex-1 sm:w-64">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Search voucher, code, title..."
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

                  {/* Expand / Collapse All */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={expandAllDays}
                    className="h-8 text-xs bg-white text-slate-600 border-slate-200 cursor-pointer"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    Expand All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={collapseAllDays}
                    className="h-8 text-xs bg-white text-slate-600 border-slate-200 cursor-pointer"
                  >
                    <EyeOff className="h-3 w-3 mr-1" />
                    Collapse All
                  </Button>
                </div>
              </div>

              {/* Source Type Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                {[
                  { key: 'ALL', label: 'All Postings' },
                  { key: 'JOURNAL', label: 'Journal' },
                  { key: 'PAYMENT', label: 'Payments' },
                  { key: 'RECEIPT', label: 'Receipts' },
                  { key: 'PETTY', label: 'Petty Cash' },
                  { key: 'OPENING', label: 'Opening' },
                ].map((pill) => {
                  const isActive = selectedSourceTypePill === pill.key;
                  return (
                    <button
                      key={pill.key}
                      onClick={() => setSelectedSourceTypePill(pill.key)}
                      className={`inline-flex items-center px-3 py-1 rounded-lg font-semibold transition-all whitespace-nowrap cursor-pointer text-xs ${
                        isActive
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      {pill.label}
                    </button>
                  );
                })}
              </div>

            </div>

            {/* ── Days Stream ── */}
            {filteredDays.length > 0 ? (
              <div className="divide-y divide-slate-200">
                {pagedDays.map((day, dIdx) => {
                  const isCollapsed = Boolean(collapsedDays[day.date]);
                  const dayVariance = Math.abs(day.total_debit - day.total_credit);
                  const isDayBalanced = dayVariance < 0.01;

                  return (
                    <div key={day.date || dIdx} className="bg-white">
                      
                      {/* Day Header Bar */}
                      <div 
                        onClick={() => toggleDayCollapse(day.date)}
                        className="p-3.5 sm:px-6 bg-slate-50/70 hover:bg-slate-100/70 transition-colors flex items-center justify-between cursor-pointer border-b border-slate-200/60"
                      >
                        <div className="flex items-center gap-3">
                          <button className="text-slate-400 hover:text-slate-600">
                            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-indigo-600" />
                            <h4 className="font-bold text-sm text-slate-900">
                              {formatDayHeading(day.date)}
                            </h4>
                            <span className="font-mono text-xs text-slate-400">({day.date})</span>
                          </div>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700">
                            {day.lines.length} {day.lines.length === 1 ? 'entry' : 'entries'}
                          </span>
                        </div>

                        {/* Day Totals Summary */}
                        <div className="flex items-center gap-4 text-xs">
                          <div className="hidden sm:flex items-center gap-1.5">
                            <span className="text-slate-500 font-medium">Daily Dr:</span>
                            <span className="font-bold text-slate-900">Rs. {formatCurrency(day.total_debit)}</span>
                          </div>
                          <div className="hidden sm:flex items-center gap-1.5">
                            <span className="text-slate-500 font-medium">Daily Cr:</span>
                            <span className="font-bold text-slate-900">Rs. {formatCurrency(day.total_credit)}</span>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                            isDayBalanced 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {isDayBalanced ? 'Balanced' : 'Imbalance'}
                          </span>
                        </div>
                      </div>

                      {/* Day Table Content */}
                      {!isCollapsed && (
                        <div className="overflow-x-auto">
                          <table className="w-full text-xs text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-100/60 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                                <th scope="col" className="py-2.5 px-4 w-28">Source</th>
                                <th scope="col" className="py-2.5 px-4 w-32">Voucher / Ref #</th>
                                <th scope="col" className="py-2.5 px-4 w-28">Account Code</th>
                                <th scope="col" className="py-2.5 px-4">Account Title</th>
                                <th scope="col" className="py-2.5 px-4 max-w-xs">Narration / Description</th>
                                <th scope="col" className="py-2.5 px-4 text-right w-36">Debit Amount</th>
                                <th scope="col" className="py-2.5 px-4 text-right w-36">Credit Amount</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {day.lines.map((line, lIdx) => (
                                <tr key={line.id || lIdx} className="hover:bg-slate-50/70 transition-colors">
                                  <td className="py-2.5 px-4 whitespace-nowrap">
                                    <SourceTypeBadge type={line.source_type} />
                                  </td>
                                  <td className="py-2.5 px-4 whitespace-nowrap font-mono font-bold text-slate-800">
                                    <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200/80 text-[11px]">
                                      {line.source_number || '-'}
                                    </span>
                                  </td>
                                  <td className="py-2.5 px-4 whitespace-nowrap font-mono font-semibold text-slate-700">
                                    {line.account_code}
                                  </td>
                                  <td className="py-2.5 px-4 font-semibold text-slate-900">
                                    {line.account_name}
                                  </td>
                                  <td className="py-2.5 px-4 text-slate-600 max-w-xs truncate" title={line.description}>
                                    {line.description || '-'}
                                  </td>
                                  <td className={`py-2.5 px-4 text-right tabular-nums ${
                                    (line.debit_amount || 0) > 0 ? 'font-bold text-slate-900' : 'text-slate-400'
                                  }`}>
                                    <ReportAmountCell amount={line.debit_amount} />
                                  </td>
                                  <td className={`py-2.5 px-4 text-right tabular-nums ${
                                    (line.credit_amount || 0) > 0 ? 'font-bold text-slate-900' : 'text-slate-400'
                                  }`}>
                                    <ReportAmountCell amount={line.credit_amount} />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr className="bg-slate-50/80 font-bold border-t border-slate-200 text-xs">
                                <td colSpan={5} className="py-2 px-4 text-right text-slate-600 uppercase tracking-wider text-[10px]">
                                  {formatDayHeading(day.date)} Subtotal:
                                </td>
                                <td className="py-2 px-4 text-right tabular-nums font-bold text-slate-900">
                                  Rs. {formatCurrency(day.total_debit)}
                                </td>
                                <td className="py-2 px-4 text-right tabular-nums font-bold text-slate-900">
                                  Rs. {formatCurrency(day.total_credit)}
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-12 text-center text-slate-500">
                <AlertCircle className="mx-auto h-10 w-10 text-slate-400 mb-2" />
                <h4 className="text-base font-bold text-slate-800">No Transactions Found</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                  No general ledger entries found matching the current filters. Try selecting "All Transactions" or adjusting the date range.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                  className="mt-4 text-xs border-slate-200 cursor-pointer"
                >
                  Reset All Filters
                </Button>
              </div>
            )}

            {/* ── Accounting Double-Underlined Pinned Grand Totals Footer ── */}
            {filteredDays.length > 0 && (
              <div className="border-t-2 border-slate-900 bg-slate-900 text-white p-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold uppercase tracking-wider text-[11px]">
                      Grand Day Book Reconciliation
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                      isBalanced 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' 
                        : 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                    }`}>
                      {isBalanced ? 'Balanced' : 'Imbalance'}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      ({filteredDays.length} days / {totalTransactions} lines)
                    </span>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Total Debit:</span>
                      <span className="text-sm font-extrabold text-white border-b-2 border-white/60 pb-0.5">
                        Rs. {formatCurrency(totalDebit)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">Total Credit:</span>
                      <span className="text-sm font-extrabold text-white border-b-2 border-white/60 pb-0.5">
                        Rs. {formatCurrency(totalCredit)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Pagination Controls */}
            {filteredDays.length > pageSize && (
              <div className="p-4 bg-slate-50/50 border-t border-slate-200">
                <TablePagination
                  currentPage={page}
                  pageSize={pageSize}
                  totalCount={filteredDays.length}
                  onPageChange={setPage}
                  onPageSizeChange={(newSize) => {
                    setPageSize(newSize);
                    setPage(0);
                  }}
                  pageSizeOptions={[5, 10, 25, 50]}
                />
              </div>
            )}

          </div>

        </div>
      )}

      {/* High Fidelity Empty State */}
      {!data && !loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
          <div className="h-12 w-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mx-auto mb-4">
            <BookOpen className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No Day Book Data Loaded</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
            Click Refresh or apply filters to load nominal general ledger postings.
          </p>
        </div>
      )}

    </div>
  );
};

export default DayBookReportPage;
