import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../../../auth/AuthContext';
import { financeApi } from '../../../../api/financeApi';
import { useDebounce } from '../../../../hooks/useDebounce';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import DataTable from '../../../../components/common/DataTable';
import ReportPageHeader from '../../../../components/finance/reports/ReportPageHeader';
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
  Wallet, 
  FileCheck, 
  CheckCircle2, 
  Send 
} from 'lucide-react';
import StatusBadge from '../../../../components/common/StatusBadge';
import { FinanceAiPromptBar } from '../../shared/FinanceAiPromptBar';

const ReceiptRegisterReportPage = () => {
  const { hasPermission, activeBranch } = useAuth();
  
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  // Filter State
  const [financialYears, setFinancialYears] = useState<any[]>([]);
  const [accountingPeriods, setAccountingPeriods] = useState<any[]>([]);

  const [filters, setFilters] = useState({
    financial_year_id: "",
    accounting_period_id: "",
    receipt_type: "",
    receipt_method: "",
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

      const response = await financeApi.getReceiptRegisterReport(params);
      if (response.data?.success) {
        setData(response.data.data || []);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch receipt register report");
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
      receipt_type: "",
      receipt_method: "",
      approval_status: "",
      posted_status: "",
      date_from: "",
      date_to: "",
      search: "",
      branch_id: activeBranch?.id || ""
    });
  };

  const list: any[] = (Array.isArray(data) ? data : (data as any)?.lines) || [];
  const totalCollections = list.reduce((sum: number, r: any) => sum + (Number(r.total_amount) || 0), 0);
  const approvedCount = list.filter((r: any) => r.approval_status === 'approved').length;
  const postedCount = list.filter((r: any) => r.posted_status === 'posted').length;

  const handleExportJson = () => {
    if (!list.length) return;
    const blob = new Blob([JSON.stringify(list, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-register-${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    if (!list.length) return;
    const headers = ['Receipt No', 'Date', 'Ref No', 'Type', 'Received To', 'Total Amount', 'Approval Status', 'Posted Status', 'Created By'];
    const rows = list.map((r: any) => [
      `"${r.receipt_number || ''}"`,
      `"${r.receipt_date ? format(new Date(r.receipt_date), 'yyyy-MM-dd') : ''}"`,
      `"${r.reference_number || ''}"`,
      `"${r.receipt_type || ''}"`,
      `"${(r.received_to_account_name || r.received_to_account?.account_name || r.received_from || '').replace(/"/g, '""')}"`,
      (r.total_amount ?? 0),
      `"${r.approval_status || ''}"`,
      `"${r.posted_status || ''}"`,
      `"${(r.created_by_name || '').replace(/"/g, '""')}"`
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-register-${new Date().getTime()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = () => {
    if (!list.length) return;
    const formatCurrency = (val: number) => (val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const headers = ['Receipt No', 'Date', 'Ref No', 'Type', 'Received To', 'Amount (LKR)', 'Approval', 'Posted', 'Created By'];
    const rows = list.map((r: any) => [
      r.receipt_number || '',
      r.receipt_date ? format(new Date(r.receipt_date), 'yyyy-MM-dd') : '',
      r.reference_number || '-',
      (r.receipt_type || '').split('_').map((w: any) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      r.received_to_account_name || r.received_to_account?.account_name || r.received_from || '-',
      formatCurrency(r.total_amount),
      r.approval_status || '',
      r.posted_status || '',
      r.created_by_name || (r.created_by ? `User #${r.created_by}` : '-')
    ]);

    exportToPdf({
      title: 'Receipt Register Report',
      filename: `receipt-register-${new Date().getTime()}`,
      subtitle: `Branch: ${activeBranch?.name || 'All Branches'} | Records: ${list.length} receipts`,
      headers,
      rows,
      alignments: ['left', 'center', 'left', 'left', 'left', 'right', 'center', 'center', 'left'],
      summary: [
        { title: 'Total Receipts', value: String(list.length) },
        { title: 'Total Collected', value: `Rs. ${formatCurrency(totalCollections)}` },
        { title: 'Approved Receipts', value: `${approvedCount} of ${list.length}` },
        { title: 'Posted Receipts', value: `${postedCount} of ${list.length}` },
      ],
      orientation: 'landscape'
    });
  };

  if (
    !hasPermission("finance.report.receipt_register.view") &&
    !hasPermission("finance.report.view") &&
    !hasPermission("finance.reports.view") &&
    !hasPermission("admin")
  ) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
        <p className="text-gray-500">You do not have permission to view the Receipt Register report.</p>
      </div>
    );
  }

  const columns = [
    {
      header: "Receipt No",
      accessor: "receipt_number",
      cell: (row: any) => (
        <div className="font-semibold text-slate-900 font-mono tracking-tight text-xs">
          {row.receipt_number}
        </div>
      )
    },
    {
      header: "Date",
      accessor: "receipt_date",
      cell: (row: any) => (
        <span className="text-xs text-slate-600 font-medium">
          {row.receipt_date ? format(new Date(row.receipt_date), 'yyyy-MM-dd') : '-'}
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
      header: "Type",
      accessor: "receipt_type",
      cell: (row: any) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
          {(row.receipt_type || '').split('_').map((w: any) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
        </span>
      )
    },
    {
      header: "Received To",
      accessor: "received_to_account_name",
      cell: (row: any) => {
        const accName = row.received_to_account_name || row.received_to_account?.account_name || row.received_from || '-';
        return (
          <div className="max-w-[170px] truncate font-medium text-slate-800 text-xs" title={accName}>
            {accName}
          </div>
        );
      }
    },
    {
      header: <div className="text-right">Total Amount</div>,
      accessor: "total_amount",
      cell: (row: any) => (
        <div className="text-right font-mono font-bold text-slate-900 text-xs">
          Rs. {Number(row.total_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
        title="Receipt Register" 
        description="Comprehensive audit register of all incoming cash receipts, customer collections, and bank deposits." 
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
              disabled={loading || list.length === 0}
              className="h-8.5 gap-1.5 text-xs bg-white text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 border-emerald-200 shadow-2xs font-semibold cursor-pointer"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
              Export Excel
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExportPdf} 
              disabled={loading || list.length === 0}
              className="h-8.5 gap-1.5 text-xs bg-white text-rose-700 hover:text-rose-800 hover:bg-rose-50 border-rose-200 shadow-2xs font-semibold cursor-pointer"
            >
              <FileText className="h-3.5 w-3.5 text-rose-600" />
              Export PDF
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExportJson} 
              disabled={loading || list.length === 0}
              className="h-8.5 gap-1.5 text-xs bg-white text-blue-700 hover:text-blue-800 hover:bg-blue-50 border-blue-200 shadow-2xs font-semibold cursor-pointer"
            >
              <FileJson className="h-3.5 w-3.5 text-blue-600" />
              Export JSON
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => window.print()}
              disabled={loading || list.length === 0}
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
        contextType="receipt_register"
        pageTitle="Receipt Register"
        dataSnapshot={data}
      />

      {/* ── Executive CFO KPI Summary Cards ── */}
      {list.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Collected</p>
              <p className="text-xl font-bold font-mono text-slate-900 mt-1">
                Rs. {totalCollections.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Across {list.length} receipts</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Wallet className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Receipts</p>
              <p className="text-xl font-bold text-slate-900 mt-1">{list.length}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Collection receipts logged</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Approved Receipts</p>
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
          <Label>Receipt Method</Label>
          <Select 
            value={filters.receipt_method || "all"} 
            onValueChange={(val: any) => handleFilterChange('receipt_method', val === "all" ? "" : val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Methods" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="bank">Bank Transfer</SelectItem>
              <SelectItem value="cheque">Cheque</SelectItem>
              <SelectItem value="credit_card">Credit Card</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Receipt Type</Label>
          <Select 
            value={filters.receipt_type || "all"} 
            onValueChange={(val: any) => handleFilterChange('receipt_type', val === "all" ? "" : val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="customer_receipt">Customer Receipt</SelectItem>
              <SelectItem value="advance_receipt">Advance Receipt</SelectItem>
              <SelectItem value="other_receipt">Other Receipt</SelectItem>
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

        <div className="space-y-2">
          <Label>Status</Label>
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
          <Label>Search</Label>
          <Input 
            type="text" 
            placeholder="Search receipt or ref..." 
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
            <h3 className="text-sm font-bold text-slate-900">Receipt Vouchers</h3>
            <p className="text-xs text-slate-500">Showing {list.length} recorded receipt entries</p>
          </div>
          {list.length > 0 && (
            <div className="text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              Collected Total: <span className="text-slate-900 font-bold font-mono">Rs. {totalCollections.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          )}
        </div>

        <DataTable
          columns={columns}
          data={list}
          loading={loading}
          emptyMessage="No receipt vouchers found."
          pagination={{ page: 1, limit: list.length || 10, total: list.length || 0 }}
        />
      </div>
    </div>
  );
};

export default ReceiptRegisterReportPage;
