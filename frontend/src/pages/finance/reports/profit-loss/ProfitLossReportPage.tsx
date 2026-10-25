import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../../../auth/AuthContext';
import { financeApi } from '../../../../api/financeApi';
import { getBranches } from '../../../../api/controlApi';
import { toast } from 'react-hot-toast';
import ReportPageHeader from '../../../../components/finance/reports/ReportPageHeader';
import ReportFilterCard from '../../../../components/finance/reports/ReportFilterCard';
import ReportAmountCell from '../../../../components/finance/reports/ReportAmountCell';
import ProfitLossBadge from '../../../../components/finance/reports/ProfitLossBadge';
import { exportToPdf } from '../../../../utils/reportExportUtils';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Button } from '../../../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  Package, 
  Printer, 
  FileSpreadsheet, 
  FileText, 
  RefreshCw, 
  Loader2, 
  Coins, 
  Eye, 
  EyeOff, 
  Building2, 
  Layers, 
  Download,
  Percent
} from 'lucide-react';
import { FinanceAiPromptBar } from '../../shared/FinanceAiPromptBar';
import { useDebounce } from '../../../../hooks/useDebounce';

const ProfitLossReportPage: React.FC = () => {
  const { hasPermission, activeBranch } = useAuth();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [compactZeroSections, setCompactZeroSections] = useState(true);

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
        // Directly load report with initial filters (bypasses debounce)
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

  // Mathematical milestones computed from statement data
  const metrics = useMemo(() => {
    if (!data) return null;
    const revenueTotal = Number(data.revenue?.total || 0);
    const otherIncomeTotal = Number(data.other_income?.total || 0);
    const totalIncome = data.total_income !== undefined ? Number(data.total_income) : (revenueTotal + otherIncomeTotal);
    
    const cogsTotal = Number(data.direct_expenses?.total || 0);
    const grossProfit = revenueTotal - cogsTotal;
    const grossMarginPct = revenueTotal > 0 ? (grossProfit / revenueTotal) * 100 : 0;

    const adminTotal = Number(data.administrative_expenses?.total || 0);
    const sellingTotal = Number(data.selling_expenses?.total || 0);
    const operatingExpenses = adminTotal + sellingTotal;
    
    const operatingProfit = grossProfit - operatingExpenses;
    const operatingMarginPct = revenueTotal > 0 ? (operatingProfit / revenueTotal) * 100 : 0;

    const financeTotal = Number(data.finance_expenses?.total || 0);
    const totalExpenses = data.total_expense !== undefined ? Number(data.total_expense) : (cogsTotal + operatingExpenses + financeTotal);
    const netProfit = data.net_profit !== undefined ? Number(data.net_profit) : (data.net_profit_loss !== undefined ? Number(data.net_profit_loss) : (totalIncome - totalExpenses));
    const netMarginPct = totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0;

    return {
      revenueTotal,
      otherIncomeTotal,
      totalIncome,
      cogsTotal,
      grossProfit,
      grossMarginPct,
      adminTotal,
      sellingTotal,
      operatingExpenses,
      operatingProfit,
      operatingMarginPct,
      financeTotal,
      totalExpenses,
      netProfit,
      netMarginPct,
      isProfitable: netProfit >= 0,
    };
  }, [data]);

  const activeFyName = useMemo(() => {
    const fy = financialYears.find((f: any) => String(f.id) === String(filters.financial_year_id));
    return fy?.year_name || "FY 2026/2027";
  }, [financialYears, filters.financial_year_id]);

  const activeBranchName = useMemo(() => {
    if (!filters.branch_id || filters.branch_id === "all") return "All Branches (Consolidated)";
    const b = branches.find((item: any) => String(item.id) === String(filters.branch_id));
    return b?.branch_name || b?.name || "Selected Branch";
  }, [branches, filters.branch_id]);

  const formatCurrency = (val: number) => 
    (val || 0).toLocaleString("en-LK", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

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

  const handleExportCsv = () => {
    if (!data || !metrics) return;
    const formatAmt = (val: number) => (val || 0).toFixed(2);

    let csv = "STATEMENT OF PROFIT OR LOSS (INCOME STATEMENT)\r\n";
    csv += `Company: Ceylon MedEx Pharmaceuticals\r\n`;
    csv += `Financial Year: ${activeFyName}\r\n`;
    csv += `Operating Branch: ${activeBranchName}\r\n`;
    csv += `Period: ${filters.date_from || 'Start'} to ${filters.date_to || 'End'}\r\n\r\n`;
    csv += "Section,Account Code,Account Name,Amount (LKR),% of Revenue\r\n";

    const addSection = (sectionName: string, lines: any[], total: number) => {
      (lines || []).forEach((l: any) => {
        const amt = Number(l.amount || l.balance || 0);
        const pct = metrics.revenueTotal > 0 ? ((amt / metrics.revenueTotal) * 100).toFixed(2) + "%" : "0.00%";
        csv += `"${sectionName}","${l.account_code || ''}","${(l.account_name || '').replace(/"/g, '""')}",${formatAmt(amt)},"${pct}"\r\n`;
      });
      const secPct = metrics.revenueTotal > 0 ? ((total / metrics.revenueTotal) * 100).toFixed(2) + "%" : "0.00%";
      csv += `"${sectionName} Subtotal","","",${formatAmt(total)},"${secPct}"\r\n`;
    };

    addSection("1. Operating Revenue", data.revenue?.lines, data.revenue?.total || 0);
    addSection("2. Cost of Goods Sold (COGS)", data.direct_expenses?.lines, data.direct_expenses?.total || 0);
    csv += `"GROSS PROFIT (Trading Margin)","","",${formatAmt(metrics.grossProfit)},"${metrics.grossMarginPct.toFixed(2)}%"\r\n\r\n`;

    addSection("3. Administrative Expenses", data.administrative_expenses?.lines, data.administrative_expenses?.total || 0);
    addSection("4. Selling & Distribution Expenses", data.selling_expenses?.lines, data.selling_expenses?.total || 0);
    csv += `"OPERATING PROFIT (EBITDA)","","",${formatAmt(metrics.operatingProfit)},"${metrics.operatingMarginPct.toFixed(2)}%"\r\n\r\n`;

    addSection("5. Other Income", data.other_income?.lines, data.other_income?.total || 0);
    addSection("6. Finance Charges", data.finance_expenses?.lines, data.finance_expenses?.total || 0);
    csv += `"TOTAL OPERATING & DIRECT EXPENSES","","",${formatAmt(metrics.totalExpenses)},""\r\n`;
    csv += `"NET PROFIT / (LOSS) FOR THE PERIOD","","",${formatAmt(metrics.netProfit)},"${metrics.netMarginPct.toFixed(2)}%"\r\n`;

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `profit-and-loss-${filters.financial_year_id || 'all'}-${new Date().getTime()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Excel / CSV report exported successfully");
  };

  const handleExportPdf = () => {
    if (!data || !metrics) return;
    const headers = ['Category / Account', 'Code', '% Revenue', 'Amount (LKR)'];
    const rows: (string | number)[][] = [];

    const addSectionRows = (sectionName: string, lines: any[], total: number) => {
      (lines || []).forEach((l: any) => {
        const amt = Number(l.amount || l.balance || 0);
        const pct = metrics.revenueTotal > 0 ? ((amt / metrics.revenueTotal) * 100).toFixed(1) + "%" : "0.0%";
        rows.push([l.account_name || sectionName, l.account_code || '—', pct, formatCurrency(amt)]);
      });
      const secPct = metrics.revenueTotal > 0 ? ((total / metrics.revenueTotal) * 100).toFixed(1) + "%" : "0.0%";
      rows.push([`Subtotal: ${sectionName}`, '', secPct, formatCurrency(total)]);
    };

    addSectionRows("Operating Revenue", data.revenue?.lines, data.revenue?.total || 0);
    addSectionRows("Cost of Goods Sold (Direct Costs)", data.direct_expenses?.lines, data.direct_expenses?.total || 0);
    rows.push(['GROSS PROFIT (Trading Margin)', '', `${metrics.grossMarginPct.toFixed(1)}%`, formatCurrency(metrics.grossProfit)]);

    addSectionRows("Administrative Expenses", data.administrative_expenses?.lines, data.administrative_expenses?.total || 0);
    if ((data.selling_expenses?.lines || []).length > 0 || !compactZeroSections) {
      addSectionRows("Selling & Distribution Expenses", data.selling_expenses?.lines, data.selling_expenses?.total || 0);
    }
    rows.push(['OPERATING PROFIT (EBITDA)', '', `${metrics.operatingMarginPct.toFixed(1)}%`, formatCurrency(metrics.operatingProfit)]);

    if ((data.other_income?.lines || []).length > 0 || !compactZeroSections) {
      addSectionRows("Other Operating Income", data.other_income?.lines, data.other_income?.total || 0);
    }
    if ((data.finance_expenses?.lines || []).length > 0 || !compactZeroSections) {
      addSectionRows("Finance Charges & Bank Fees", data.finance_expenses?.lines, data.finance_expenses?.total || 0);
    }

    rows.push(['TOTAL EXPENSES (Direct & Overheads)', '', '', formatCurrency(metrics.totalExpenses)]);
    rows.push([
      `NET ${metrics.isProfitable ? 'PROFIT' : 'LOSS'} FOR THE PERIOD`,
      '',
      `${metrics.netMarginPct.toFixed(1)}%`,
      formatCurrency(metrics.netProfit)
    ]);

    exportToPdf({
      title: 'Statement of Profit or Loss (Income Statement)',
      filename: `profit-and-loss-${filters.financial_year_id || 'all'}-${new Date().getTime()}`,
      subtitle: `Financial Year: ${activeFyName} | Branch: ${activeBranchName} | Period: ${filters.date_from || 'Start'} to ${filters.date_to || 'End'}`,
      headers,
      rows,
      alignments: ['left', 'center', 'right', 'right'],
      summary: [
        { title: 'Total Revenue', value: formatCurrency(metrics.revenueTotal) },
        { title: 'Gross Profit', value: `${formatCurrency(metrics.grossProfit)} (${metrics.grossMarginPct.toFixed(1)}%)` },
        { title: 'Operating Profit', value: `${formatCurrency(metrics.operatingProfit)} (${metrics.operatingMarginPct.toFixed(1)}%)` },
        { title: metrics.isProfitable ? 'Net Profit' : 'Net Loss', value: `${formatCurrency(metrics.netProfit)} (${metrics.netMarginPct.toFixed(1)}%)` },
      ],
    });
    toast.success("PDF report generated successfully");
  };

  const canView =
    hasPermission("finance.report.profit_loss.view") ||
    hasPermission("finance.report.view") ||
    hasPermission("finance.reports.view");

  if (!canView) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Access Denied</h2>
        <p className="text-slate-500">You do not have permission to view the Profit and Loss report.</p>
      </div>
    );
  }

  // Render a clean section block with real accounts table
  const renderAccountSection = (
    title: string,
    lines: any[],
    subtotal: number,
    tag?: string,
    badgeColor: "emerald" | "amber" | "rose" | "blue" | "slate" = "slate"
  ) => {
    const hasLines = Array.isArray(lines) && lines.length > 0;
    
    // If compactZeroSections is on and section is completely empty with 0 total, render a sleek 1-line item
    if (compactZeroSections && !hasLines && subtotal === 0) {
      return (
        <div className="flex items-center justify-between py-2.5 px-4 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">{title}</span>
            <span className="text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.2 rounded font-mono">0 accounts</span>
          </div>
          <span className="font-mono text-slate-400">LKR 0.00</span>
        </div>
      );
    }

    const badgeStyles = {
      emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
      amber: "bg-amber-50 text-amber-700 border-amber-200",
      rose: "bg-rose-50 text-rose-700 border-rose-200",
      blue: "bg-blue-50 text-blue-700 border-blue-200",
      slate: "bg-slate-100 text-slate-600 border-slate-200",
    };

    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs">
        {/* Section Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-5 py-3">
          <div className="flex items-center gap-2.5">
            <h4 className="text-sm font-bold text-slate-800">{title}</h4>
            {tag && (
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${badgeStyles[badgeColor]}`}>
                {tag}
              </span>
            )}
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-slate-400 mr-2 uppercase tracking-wider">Subtotal</span>
            <span className="text-sm font-bold font-mono text-slate-900">
              LKR {formatCurrency(subtotal)}
            </span>
          </div>
        </div>

        {/* Accounts Table */}
        {!hasLines ? (
          <div className="text-center py-6 text-xs text-slate-400 italic bg-white">
            No active accounts or transactions recorded in this section for the period.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {lines.map((line: any, idx: number) => {
              const lineBal = Number(line.balance !== undefined ? line.balance : (line.amount || 0));
              const pctOfRev = metrics?.revenueTotal && metrics.revenueTotal > 0 
                ? ((lineBal / metrics.revenueTotal) * 100).toFixed(2) + "%" 
                : "—";

              return (
                <div 
                  key={line.account_id || line.account_code || idx} 
                  className="flex items-center justify-between px-5 py-3 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200/70 px-2 py-0.5 rounded-md">
                      {line.account_code}
                    </span>
                    <span className="text-xs font-semibold text-slate-800">
                      {line.account_name}
                    </span>
                  </div>

                  <div className="flex items-center gap-6">
                    <span className="text-[11px] font-mono text-slate-400 hidden sm:inline-block w-16 text-right">
                      {pctOfRev}
                    </span>
                    <span className="text-xs font-bold font-mono text-slate-900 w-28 text-right">
                      <ReportAmountCell amount={lineBal} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* ── Page Header with Integrated Actions ── */}
      <ReportPageHeader 
        title="Profit and Loss" 
        description="Multi-step comprehensive income statement showing operating revenues, cost of sales, overheads, and net profit."
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchReport} 
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
              disabled={loading || !data}
              className="h-8.5 gap-1.5 text-xs bg-white text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-200 shadow-2xs font-semibold cursor-pointer"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
              Export Excel
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExportPdf} 
              disabled={loading || !data}
              className="h-8.5 gap-1.5 text-xs bg-white text-rose-700 hover:text-rose-800 hover:bg-rose-50 border-rose-200 shadow-2xs font-semibold cursor-pointer"
            >
              <FileText className="h-3.5 w-3.5 text-rose-600" />
              Export PDF
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.print()}
              disabled={loading || !data}
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
        contextType="profit_loss"
        pageTitle="Profit and Loss"
        dataSnapshot={data}
      />

      {/* ── Filter Card ── */}
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

      {/* ── Table Section Loading State with Loading Icon ── */}
      {loading && !data && (
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 shadow-xs">
          <div className="absolute top-0 inset-x-0 h-0.5 bg-slate-100 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 via-sky-400 to-indigo-600 animate-pulse w-full" />
          </div>
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 border border-indigo-100 shadow-inner">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Compiling Profit & Loss Statement...</h3>
            <p className="text-xs text-slate-500 max-w-sm text-center">
              Reconciling nominal ledger lines, computing gross trading margins, and calculating statutory net profit.
            </p>
          </div>
        </div>
      )}

      {/* ── Main Income Statement Render ── */}
      {data && metrics && (
        <div className="animate-in fade-in slide-in-from-bottom-3 duration-300 space-y-6">
          {/* ── 1. Executive CFO Financial Summary Cards Ribbon ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
            {/* Revenue Card */}
            <div className="relative overflow-hidden p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Total Operating Revenue</span>
                <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100/60">
                  <Coins className="w-4 h-4" />
                </span>
              </div>
              <div className="text-xl font-bold font-mono text-slate-900 mt-2.5">
                LKR {formatCurrency(metrics.revenueTotal)}
              </div>
              <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
                <span>Top-line turnover</span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded-full">
                  100% Base
                </span>
              </div>
            </div>

            {/* COGS Card */}
            <div className="relative overflow-hidden p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Cost of Goods Sold (COGS)</span>
                <span className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100/60">
                  <Package className="w-4 h-4" />
                </span>
              </div>
              <div className="text-xl font-bold font-mono text-slate-900 mt-2.5">
                LKR {formatCurrency(metrics.cogsTotal)}
              </div>
              <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
                <span>Direct product costs</span>
                <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.2 rounded-full font-mono">
                  {metrics.revenueTotal > 0 ? ((metrics.cogsTotal / metrics.revenueTotal) * 100).toFixed(1) : 0}% of Rev
                </span>
              </div>
            </div>

            {/* Gross Profit Card */}
            <div className="relative overflow-hidden p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-xs transition-all">
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Gross Trading Profit</span>
                <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100/60">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <div className="text-xl font-bold font-mono text-indigo-900 mt-2.5">
                LKR {formatCurrency(metrics.grossProfit)}
              </div>
              <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500">
                <span>Gross Trading Margin</span>
                <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.2 rounded-full font-mono">
                  {metrics.grossMarginPct.toFixed(2)}% Margin
                </span>
              </div>
            </div>

            {/* Net Profit Card */}
            <div className={`relative overflow-hidden p-5 rounded-2xl border shadow-2xs hover:shadow-xs transition-all ${
              metrics.isProfitable 
                ? "bg-emerald-50/40 border-emerald-200/90" 
                : "bg-rose-50/40 border-rose-200/90"
            }`}>
              <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
                <span>Net Profit for Period</span>
                <span className={`p-2 rounded-xl border ${
                  metrics.isProfitable 
                    ? "bg-emerald-100 text-emerald-700 border-emerald-200" 
                    : "bg-rose-100 text-rose-700 border-rose-200"
                }`}>
                  {metrics.isProfitable ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                </span>
              </div>
              <div className={`text-xl font-bold font-mono mt-2.5 ${
                metrics.isProfitable ? "text-emerald-950" : "text-rose-950"
              }`}>
                LKR {formatCurrency(metrics.netProfit)}
              </div>
              <div className="flex items-center justify-between mt-2.5 pt-2.5 border-t border-slate-200/60 text-[11px]">
                <span className="text-slate-600">Net Return</span>
                <span className={`font-bold px-2 py-0.2 rounded-full font-mono ${
                  metrics.isProfitable 
                    ? "bg-emerald-100 text-emerald-800" 
                    : "bg-rose-100 text-rose-800"
                }`}>
                  {metrics.netMarginPct.toFixed(2)}% Net Margin
                </span>
              </div>
            </div>
          </div>

          {/* ── 2. Unified Statement Card with Clean Header Bar ── */}
          <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xs">
            {/* Top progress line when refreshing with data */}
            {loading && (
              <div className="absolute top-0 inset-x-0 h-0.5 bg-slate-100 overflow-hidden z-20">
                <div className="h-full bg-gradient-to-r from-emerald-500 via-sky-400 to-indigo-600 animate-pulse w-full" />
              </div>
            )}

            {/* Floating update badge during background refetch */}
            {loading && (
              <div className="absolute inset-0 top-16 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[1px] z-20 pointer-events-none transition-all">
                <div className="flex items-center gap-3 rounded-2xl border border-slate-200/90 bg-white/95 px-5 py-2.5 shadow-xl ring-1 ring-slate-900/5">
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-600 shrink-0" />
                  <span className="text-xs font-bold text-slate-800">Updating statement records...</span>
                </div>
              </div>
            )}

            {/* Statement Card Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/50 p-6">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                    Statement of Profit or Loss
                  </h3>
                  <span className="rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                    Multi-Step Format
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {activeFyName} • {activeBranchName} • SLFRS/LKAS Statutory Framework
                </p>
              </div>

              {/* View options & actions */}
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => setCompactZeroSections(!compactZeroSections)}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  {compactZeroSections ? (
                    <>
                      <Eye className="h-3.5 w-3.5 text-slate-500" />
                      <span>Compact Empty Sections</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="h-3.5 w-3.5 text-slate-500" />
                      <span>Showing All Sections</span>
                    </>
                  )}
                </button>

                <div className="hidden sm:flex items-center gap-1.5 border-l border-slate-200 pl-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleExportCsv}
                    className="h-8 gap-1.5 text-xs text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-200 shadow-2xs font-semibold cursor-pointer"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                    Excel
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleExportPdf}
                    className="h-8 gap-1.5 text-xs text-rose-700 hover:text-rose-800 hover:bg-rose-50 border-rose-200 shadow-2xs font-semibold cursor-pointer"
                  >
                    <FileText className="h-3.5 w-3.5 text-rose-600" />
                    PDF
                  </Button>
                </div>
              </div>
            </div>

            {/* Statement Body */}
            <div className="p-6 space-y-6">
              {/* ── PART 1: OPERATING REVENUE ── */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Part I: Operating Turnover & Inflows
                  </h4>
                </div>
                {renderAccountSection(
                  "Operating Revenue", 
                  data.revenue?.lines, 
                  metrics.revenueTotal, 
                  "Primary Turnover", 
                  "emerald"
                )}
              </div>

              {/* ── PART 2: DIRECT COST OF SALES (COGS) ── */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Part II: Direct Cost of Goods Sold
                  </h4>
                </div>
                {renderAccountSection(
                  "Cost of Goods Sold (COGS)", 
                  data.direct_expenses?.lines, 
                  metrics.cogsTotal, 
                  "Direct Materials & Goods", 
                  "amber"
                )}
              </div>

              {/* ── MILESTONE 1: GROSS TRADING PROFIT ── */}
              <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-50/80 via-white to-indigo-50/50 p-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-indigo-950 uppercase tracking-wide">
                          Gross Trading Profit
                        </span>
                        <span className="rounded-md bg-indigo-100 text-indigo-800 px-2 py-0.5 text-xs font-bold font-mono">
                          {metrics.grossMarginPct.toFixed(2)}% Margin
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        Operating revenue less cost of inventory and direct goods sold
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold font-mono text-indigo-950">
                      LKR {formatCurrency(metrics.grossProfit)}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── PART 3: OPERATING OVERHEADS & EXPENSES ── */}
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Part III: Operating Overheads & Operational Expenses
                  </h4>
                  <span className="text-xs font-semibold font-mono text-slate-500">
                    Total Overheads: LKR {formatCurrency(metrics.operatingExpenses)}
                  </span>
                </div>

                {renderAccountSection(
                  "Administrative Expenses", 
                  data.administrative_expenses?.lines, 
                  metrics.adminTotal, 
                  "General & Office Admin", 
                  "slate"
                )}

                {renderAccountSection(
                  "Selling & Distribution Expenses", 
                  data.selling_expenses?.lines, 
                  metrics.sellingTotal, 
                  "Sales & Logistics", 
                  "slate"
                )}
              </div>

              {/* ── MILESTONE 2: OPERATING PROFIT (EBITDA) ── */}
              <div className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50/70 via-white to-blue-50/40 p-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
                      <Layers className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-blue-950 uppercase tracking-wide">
                          Operating Profit (EBITDA)
                        </span>
                        <span className="rounded-md bg-blue-100 text-blue-800 px-2 py-0.5 text-xs font-bold font-mono">
                          {metrics.operatingMarginPct.toFixed(2)}% Margin
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        Gross trading profit less core administrative and commercial overheads
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-bold font-mono text-blue-950">
                      LKR {formatCurrency(metrics.operatingProfit)}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── PART 4: NON-OPERATING ITEMS & FINANCIAL CHARGES ── */}
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Part IV: Other Income & Financial Charges
                  </h4>
                </div>

                {renderAccountSection(
                  "Other Operating & Non-Operating Income", 
                  data.other_income?.lines, 
                  metrics.otherIncomeTotal, 
                  "Secondary Income", 
                  "emerald"
                )}

                {renderAccountSection(
                  "Finance Charges & Bank Expenses", 
                  data.finance_expenses?.lines, 
                  metrics.financeTotal, 
                  "Financing & Borrowings", 
                  "rose"
                )}
              </div>

              {/* ── MILESTONE 3: GRAND NET PROFIT / (LOSS) FOR THE PERIOD ── */}
              <div className={`rounded-2xl border-2 p-6 shadow-md transition-all ${
                metrics.isProfitable 
                  ? "bg-gradient-to-r from-emerald-50/90 via-white to-emerald-50/70 border-emerald-400" 
                  : "bg-gradient-to-r from-rose-50/90 via-white to-rose-50/70 border-rose-400"
              }`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm shrink-0 ${
                      metrics.isProfitable 
                        ? "bg-emerald-600 text-white" 
                        : "bg-rose-600 text-white"
                    }`}>
                      {metrics.isProfitable ? (
                        <CheckCircle2 className="h-6 w-6" />
                      ) : (
                        <AlertCircle className="h-6 w-6" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className={`text-base font-extrabold uppercase tracking-wide ${
                          metrics.isProfitable ? "text-emerald-950" : "text-rose-950"
                        }`}>
                          Net {metrics.isProfitable ? "Profit" : "Loss"} for the Period
                        </h3>
                        <span className={`rounded-full px-3 py-0.5 text-xs font-bold font-mono border ${
                          metrics.isProfitable 
                            ? "bg-emerald-100 text-emerald-800 border-emerald-300" 
                            : "bg-rose-100 text-rose-800 border-rose-300"
                        }`}>
                          {metrics.isProfitable ? "PROFITABLE" : "NET DEFICIT"} • {metrics.netMarginPct.toFixed(2)}% Net Return
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        Final bottom-line comprehensive income after all operating, administrative, direct, and financing costs
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs uppercase font-bold tracking-wider text-slate-400 block mb-0.5">
                      Statutory Bottom-Line Total
                    </span>
                    <span className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${
                      metrics.isProfitable ? "text-emerald-950" : "text-rose-950"
                    }`}>
                      LKR {formatCurrency(metrics.netProfit)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Empty State ── */}
      {!data && !loading && (
        <div className="bg-white rounded-2xl shadow-xs p-12 text-center border border-slate-200">
          <AlertCircle className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-4 text-base font-bold text-slate-900">No Statement Data Available</h3>
          <p className="mt-1.5 text-xs text-slate-500 max-w-sm mx-auto">
            Select an active financial year and date period from the filters above, then click Apply to generate the Income Statement.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfitLossReportPage;
