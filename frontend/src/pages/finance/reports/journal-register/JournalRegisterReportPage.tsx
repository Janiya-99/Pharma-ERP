import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../../../auth/AuthContext';
import { financeApi } from '../../../../api/financeApi';
import { useDebounce } from '../../../../hooks/useDebounce';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import DataTable from '../../../../components/common/DataTable';
import ReportPageHeader from '../../../../components/finance/reports/ReportPageHeader';
import ReportActions from '../../../../components/finance/reports/ReportActions';
import ReportFilterCard from '../../../../components/finance/reports/ReportFilterCard';
import { exportToPdf } from '../../../../utils/reportExportUtils';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Button } from '../../../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { 
  AlertCircle, 
  RefreshCw, 
  FileSpreadsheet, 
  FileText, 
  FileJson, 
  Printer, 
  BookOpen, 
  FileCheck, 
  CheckCircle2, 
  Send 
} from 'lucide-react';
import StatusBadge from '../../../../components/common/StatusBadge';
import { FinanceAiPromptBar } from '../../shared/FinanceAiPromptBar';

const JournalRegisterReportPage = () => {
  const { hasPermission, activeBranch } = useAuth();
  
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  // Filter State
  const [financialYears, setFinancialYears] = useState<any[]>([]);
  const [accountingPeriods, setAccountingPeriods] = useState<any[]>([]);

  const [filters, setFilters] = useState({
    financial_year_id: "",
    accounting_period_id: "",
    approval_status: "",
    posted_status: "",
    date_from: "",
    date_to: "",
    search: "",
    branch_id: activeBranch?.id || ""
  });

  const debouncedFilters = useDebounce(filters, 300);

  const fetchFiltersData = async () => {
    try {
      const [fyRes, apRes] = await Promise.all([
        financeApi.getFinancialYears({ limit: 100 }),
        financeApi.getAccountingPeriods({ limit: 100 })
      ]);
      let initialFilters: any = null;
      if (fyRes.data?.success) {
        const years = fyRes.data.data || [];
        setFinancialYears(years);
        const activeYr = years.find((y: any) => y.is_active) || years[0];
        if (activeYr && !filters.financial_year_id) {
          initialFilters = { ...filters, financial_year_id: activeYr.id.toString() };
          setFilters(initialFilters);
        }
      }
      if (apRes.data?.success) setAccountingPeriods(apRes.data.data || []);
      fetchReport(initialFilters || filters);
    } catch (error) {
      console.error("Failed to load filters data", error);
    }
  };

  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  const fetchReport = useCallback(async (overrideFilters?: any) => {
    setLoading(true);
    try {
      const activeFilters = overrideFilters !== undefined ? overrideFilters : filtersRef.current;
      const params = { ...(activeFilters || {}) };
      Object.keys(params).forEach((key: any) => {
        if (params[key] === "") delete params[key];
      });

      const response = await financeApi.getJournalRegisterReport(params);
      if (response.data?.success) {
        setData(response.data.data || []);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch journal register report");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFiltersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBranch]);

  useEffect(() => {
    fetchReport(debouncedFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFilters]);

  const handleFilterChange = (key: unknown, value: unknown) => {
    setFilters((prev: any) => ({ ...prev, [key as string]: value }));
  };

  const handleApplyFilters = () => {
    fetchReport(filters);
  };

  const handleClearFilters = () => {
    setFilters({
      financial_year_id: "",
      accounting_period_id: "",
      approval_status: "",
      posted_status: "",
      date_from: "",
      date_to: "",
      search: "",
      branch_id: activeBranch?.id || ""
    });
  };

  const list: any[] = (Array.isArray(data) ? data : (data as any)?.lines) || [];
  const totalDebit = list.reduce((sum: number, r: any) => sum + (Number(r.total_debit) || 0), 0);
  const totalCredit = list.reduce((sum: number, r: any) => sum + (Number(r.total_credit) || 0), 0);
  const approvedCount = list.filter((r: any) => r.approval_status === 'approved').length;
  const postedCount = list.filter((r: any) => r.posted_status === 'posted').length;

  const handleExportJson = () => {
    if (!list.length) return;
    const blob = new Blob([JSON.stringify(list, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `journal-register-${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    if (!list.length) return;
    const headers = ['Journal No', 'Date', 'Ref No', 'Description', 'Total Debit', 'Total Credit', 'Approval Status', 'Posted Status', 'Created By'];
    const rows = list.map((r: any) => [
      `"${r.journal_number || ''}"`,
      `"${r.journal_date ? format(new Date(r.journal_date), 'yyyy-MM-dd') : ''}"`,
      `"${r.reference_number || ''}"`,
      `"${(r.description || '').replace(/"/g, '""')}"`,
      (r.total_debit ?? 0),
      (r.total_credit ?? 0),
      `"${r.approval_status || ''}"`,
      `"${r.posted_status || ''}"`,
      `"${(r.created_by_name || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `journal-register-${new Date().getTime()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = () => {
    if (!list.length) return;
    const formatCurrency = (val: number) => (val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const headers = ['Journal No', 'Date', 'Ref No', 'Description', 'Debit (LKR)', 'Credit (LKR)', 'Approval', 'Posted', 'Created By'];
    const rows = list.map((r: any) => [
      r.journal_number || '',
      r.journal_date ? format(new Date(r.journal_date), 'yyyy-MM-dd') : '',
      r.reference_number || '-',
      r.description || '-',
      formatCurrency(r.total_debit),
      formatCurrency(r.total_credit),
      r.approval_status || '',
      r.posted_status || '',
      r.created_by_name || (r.created_by ? `User #${r.created_by}` : '-')
    ]);

    exportToPdf({
      title: 'Journal Register Report',
      filename: `journal-register-${new Date().getTime()}`,
      subtitle: `Branch: ${activeBranch?.name || 'All Branches'} | Records: ${list.length} journals`,
      headers,
      rows,
      alignments: ['left', 'center', 'left', 'left', 'right', 'right', 'center', 'center', 'left'],
      summary: [
        { title: 'Total Journals', value: String(list.length) },
        { title: 'Total Debit', value: `Rs. ${formatCurrency(totalDebit)}` },
        { title: 'Total Credit', value: `Rs. ${formatCurrency(totalCredit)}` },
        { title: 'Approved', value: `${approvedCount} of ${list.length}` },
      ],
      orientation: 'landscape'
    });
  };

  if (
    !hasPermission("finance.report.journal_register.view") &&
    !hasPermission("finance.report.view") &&
    !hasPermission("finance.reports.view") &&
    !hasPermission("admin")
  ) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
        <p className="text-gray-500">You do not have permission to view the Journal Register report.</p>
      </div>
    );
  }

  const columns = [
    {
      header: "Journal No",
      accessor: "journal_number",
      cell: (row: any) => (
        <div className="font-semibold text-slate-900 font-mono tracking-tight text-xs">
          {row.journal_number}
        </div>
      )
    },
    {
      header: "Date",
      accessor: "journal_date",
      cell: (row: any) => (
        <span className="text-xs text-slate-600 font-medium">
          {row.journal_date ? format(new Date(row.journal_date), 'yyyy-MM-dd') : '-'}
        </span>
      )
    },
    {
      header: "Ref No",
      accessor: "reference_number",
      cell: (row: any) => (
        <span className="text-xs text-slate-500 font-mono">
          {row.reference_number || '—'}
        </span>
      )
    },
    {
      header: "Description",
      accessor: "description",
      cell: (row: any) => (
        <div className="max-w-[200px] truncate text-slate-700 text-xs" title={row.description}>
          {row.description || '—'}
        </div>
      )
    },
    {
      header: <div className="text-right">Total Debit</div>,
      accessor: "total_debit",
      cell: (row: any) => (
        <div className="text-right font-mono font-bold text-slate-900 text-xs">
          Rs. {Number(row.total_debit || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      )
    },
    {
      header: <div className="text-right">Total Credit</div>,
      accessor: "total_credit",
      cell: (row: any) => (
        <div className="text-right font-mono font-bold text-slate-900 text-xs">
          Rs. {Number(row.total_credit || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      )
    },
    {
      header: "Approval",
      accessor: "approval_status",
      cell: (row: any) => <StatusBadge status={row.approval_status} />
    },
    {
      header: "Posted",
      accessor: "posted_status",
      cell: (row: any) => <StatusBadge status={row.posted_status} />
    },
    {
      header: "Created By",
      accessor: "created_by_name",
      cell: (row: any) => {
        const name = row.created_by_name || (row.created_by ? `User #${row.created_by}` : '—');
        return (
          <div className="flex items-center gap-1.5" title={name}>
            {name !== '—' ? (
              <>
                <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-700 shrink-0">
                  {name.charAt(0).toUpperCase()}
                </div>
                <span className="font-medium text-slate-800 text-xs truncate max-w-[130px]">{name}</span>
              </>
            ) : (
              <span className="text-slate-400 text-xs">—</span>
            )}
          </div>
        );
      }
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* ── Page Header with Integrated Actions ── */}
      <ReportPageHeader 
        title="Journal Register" 
        description="Comprehensive audit register of all general journal vouchers, non-cash ledger entries, and manual adjustments." 
        actions={
          <ReportActions
            onRefresh={() => fetchReport()}
            onExportCsv={handleExportCsv}
            onExportPdf={handleExportPdf}
            onExportJson={handleExportJson}
            onPrint={() => window.print()}
            loading={loading}
            disabled={list.length === 0}
          />
        }
      />

      {/* AI Copilot Prompting Bar */}
      <FinanceAiPromptBar
        contextType="journal_register"
        pageTitle="Journal Register"
        dataSnapshot={data}
      />

      {/* ── Executive CFO KPI Summary Cards ── */}
      {list.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Debit Volume</p>
              <p className="text-xl font-bold font-mono text-slate-900 mt-1">
                Rs. {totalDebit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Across {list.length} journal entries</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Credit Volume</p>
              <p className="text-xl font-bold font-mono text-slate-900 mt-1">
                Rs. {totalCredit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Dual equilibrium balance</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Approved Journals</p>
              <p className="text-xl font-bold text-emerald-700 mt-1">{approvedCount}</p>
              <p className="text-[11px] text-emerald-600 font-medium mt-0.5">
                {list.length > 0 ? `${Math.round((approvedCount / list.length) * 100)}% approval rate` : '0%'}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Posted to GL</p>
              <p className="text-xl font-bold text-indigo-700 mt-1">{postedCount}</p>
              <p className="text-[11px] text-indigo-600 font-medium mt-0.5">
                {list.length > 0 ? `${Math.round((postedCount / list.length) * 100)}% posted to ledger` : '0%'}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Send className="w-5 h-5" />
            </div>
          </div>
        </div>
      )}

      {/* ── Report Filter Card ── */}
      <ReportFilterCard 
        onApply={handleApplyFilters} 
        onClear={handleClearFilters}
        isLoading={loading}
      >
        <div className="space-y-2">
          <Label>Financial Year</Label>
          <Select 
            value={filters.financial_year_id || "all"} 
            onValueChange={(val: any) => handleFilterChange('financial_year_id', val === "all" ? "" : val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {(financialYears || []).map((fy: any) => (
                <SelectItem key={fy.id} value={fy.id.toString()}>{fy.year_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Accounting Period</Label>
          <Select 
            value={filters.accounting_period_id || "all"} 
            onValueChange={(val: any) => handleFilterChange('accounting_period_id', val === "all" ? "" : val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Periods" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Periods</SelectItem>
              {(accountingPeriods || []).map((ap: any) => (
                <SelectItem key={ap.id} value={ap.id.toString()}>{ap.period_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Approval Status</Label>
          <Select 
            value={filters.approval_status || "all"} 
            onValueChange={(val: any) => handleFilterChange('approval_status', val === "all" ? "" : val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Posted Status</Label>
          <Select 
            value={filters.posted_status || "all"} 
            onValueChange={(val: any) => handleFilterChange('posted_status', val === "all" ? "" : val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="unposted">Unposted</SelectItem>
              <SelectItem value="posted">Posted</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
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

        <div className="space-y-2 lg:col-span-2">
          <Label>Search</Label>
          <Input 
            type="text" 
            placeholder="Search journal number or ref..." 
            value={filters.search}
            onChange={(e: any) => handleFilterChange('search', e.target.value)}
            onKeyDown={(e: any) => { if (e.key === 'Enter') handleApplyFilters(); }}
          />
        </div>
      </ReportFilterCard>

      {/* ── Data Table Section ── */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Journal Entries</h3>
            <p className="text-xs text-slate-500">Showing {list.length} recorded journal vouchers</p>
          </div>
          {list.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                Total Debit: <span className="text-slate-900 font-bold font-mono">Rs. {totalDebit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                Total Credit: <span className="text-slate-900 font-bold font-mono">Rs. {totalCredit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          )}
        </div>

        <DataTable
          columns={columns}
          data={list}
          loading={loading}
          emptyMessage="No journal entries found."
          pagination={{ page: 1, limit: list.length || 10, total: list.length || 0 }}
        />
      </div>
    </div>
  );
};

export default JournalRegisterReportPage;
