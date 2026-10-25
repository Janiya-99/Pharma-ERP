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

const PaymentRegisterReportPage = () => {
  const { hasPermission, activeBranch } = useAuth();
  
  const [data, setData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  // Filter State
  const [financialYears, setFinancialYears] = useState<any[]>([]);
  const [accountingPeriods, setAccountingPeriods] = useState<any[]>([]);

  const [filters, setFilters] = useState({
    financial_year_id: "",
    accounting_period_id: "",
    payment_type: "",
    payment_method: "",
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
      // Directly trigger report load with resolved initial filters (bypasses debounce delay)
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

      const response = await financeApi.getPaymentRegisterReport(params);
      if (response.data?.success) {
        setData(response.data.data || []);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch payment register report");
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
    // Auto-reload when debounced filters change (user changed a filter)
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
      payment_type: "",
      payment_method: "",
      approval_status: "",
      posted_status: "",
      date_from: "",
      date_to: "",
      search: "",
      branch_id: activeBranch?.id || ""
    });
  };

  const list: any[] = (Array.isArray(data) ? data : (data as any)?.lines) || [];
  const totalDisbursed = list.reduce((sum: number, r: any) => sum + (Number(r.total_amount) || 0), 0);
  const approvedCount = list.filter((r: any) => r.approval_status === 'approved').length;
  const postedCount = list.filter((r: any) => r.posted_status === 'posted').length;

  const handleExportJson = () => {
    if (!list.length) return;
    const blob = new Blob([JSON.stringify(list, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-register-${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    if (!list.length) return;
    const headers = ['Voucher No', 'Date', 'Type', 'Method', 'Paid From', 'Ref No', 'Total Amount', 'Approval Status', 'Posted Status', 'Created By'];
    const rows = list.map((r: any) => [
      `"${r.voucher_number || ''}"`,
      `"${r.payment_date ? format(new Date(r.payment_date), 'yyyy-MM-dd') : ''}"`,
      `"${r.payment_type || ''}"`,
      `"${r.payment_method || ''}"`,
      `"${(r.paid_from_account_name || r.paid_from_account?.account_name || '').replace(/"/g, '""')}"`,
      `"${r.reference_number || ''}"`,
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
    a.download = `payment-register-${new Date().getTime()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = () => {
    if (!list.length) return;
    const formatCurrency = (val: number) => (val || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const headers = ['Voucher No', 'Date', 'Type', 'Method', 'Paid From', 'Ref No', 'Amount (LKR)', 'Approval', 'Posted', 'Created By'];
    const rows = list.map((r: any) => [
      r.voucher_number || '',
      r.payment_date ? format(new Date(r.payment_date), 'yyyy-MM-dd') : '',
      (r.payment_type || '').split('_').map((w: any) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      (r.payment_method || '').charAt(0).toUpperCase() + (r.payment_method || '').slice(1),
      r.paid_from_account_name || r.paid_from_account?.account_name || '-',
      r.reference_number || '-',
      formatCurrency(r.total_amount),
      r.approval_status || '',
      r.posted_status || '',
      r.created_by_name || (r.created_by ? `User #${r.created_by}` : '-')
    ]);

    exportToPdf({
      title: 'Payment Register Report',
      filename: `payment-register-${new Date().getTime()}`,
      subtitle: `Branch: ${activeBranch?.name || 'All Branches'} | Records: ${list.length} vouchers`,
      headers,
      rows,
      alignments: ['left', 'center', 'left', 'left', 'left', 'left', 'right', 'center', 'center', 'left'],
      summary: [
        { title: 'Total Vouchers', value: String(list.length) },
        { title: 'Total Disbursed', value: `Rs. ${formatCurrency(totalDisbursed)}` },
        { title: 'Approved Vouchers', value: `${approvedCount} of ${list.length}` },
        { title: 'Posted Vouchers', value: `${postedCount} of ${list.length}` },
      ],
      orientation: 'landscape'
    });
  };

  if (
    !hasPermission("finance.report.payment_register.view") &&
    !hasPermission("finance.report.view") &&
    !hasPermission("finance.reports.view") &&
    !hasPermission("admin")
  ) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
        <p className="text-gray-500">You do not have permission to view the Payment Register report.</p>
      </div>
    );
  }

  const columns = [
    {
      header: "Voucher No",
      accessor: "voucher_number",
      cell: (row: any) => (
        <div className="font-semibold text-slate-900 font-mono tracking-tight text-xs">
          {row.voucher_number}
        </div>
      )
    },
    {
      header: "Date",
      accessor: "payment_date",
      cell: (row: any) => (
        <span className="text-xs text-slate-600 font-medium">
          {row.payment_date ? format(new Date(row.payment_date), 'yyyy-MM-dd') : '-'}
        </span>
      )
    },
    {
      header: "Type",
      accessor: "payment_type",
      cell: (row: any) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
          {(row.payment_type || '').split('_').map((w: any) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
        </span>
      )
    },
    {
      header: "Method",
      accessor: "payment_method",
      cell: (row: any) => (
        <span className="text-xs text-slate-700 capitalize font-medium">
          {(row.payment_method || '').replace('_', ' ')}
        </span>
      )
    },
    {
      header: "Paid From",
      accessor: "paid_from_account_name",
      cell: (row: any) => {
        const accName = row.paid_from_account_name || row.paid_from_account?.account_name || (row.paid_from_account_id ? `Account #${row.paid_from_account_id}` : '-');
        return (
          <div className="max-w-[170px] truncate font-medium text-slate-800 text-xs" title={accName}>
            {accName}
          </div>
        );
      }
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
        title="Payment Register" 
        description="Comprehensive audit register of all payment vouchers, disbursements, and supplier settlements." 
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
        contextType="payment_register"
        pageTitle="Payment Register"
        dataSnapshot={data}
      />

      {/* ── Executive CFO KPI Summary Cards ── */}
      {list.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Disbursed</p>
              <p className="text-xl font-bold font-mono text-slate-900 mt-1">
                Rs. {totalDisbursed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Across {list.length} payment vouchers</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <Wallet className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Vouchers</p>
              <p className="text-xl font-bold text-slate-900 mt-1">{list.length}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Disbursement vouchers logged</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <FileCheck className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 p-4 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Approved Vouchers</p>
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
          <Label>Payment Method</Label>
          <Select 
            value={filters.payment_method || "all"} 
            onValueChange={(val: any) => handleFilterChange('payment_method', val === "all" ? "" : val)}
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
          <Label>Payment Type</Label>
          <Select 
            value={filters.payment_type || "all"} 
            onValueChange={(val: any) => handleFilterChange('payment_type', val === "all" ? "" : val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="supplier_payment">Supplier Payment</SelectItem>
              <SelectItem value="expense_payment">Expense Payment</SelectItem>
              <SelectItem value="payroll_payment">Payroll Payment</SelectItem>
              <SelectItem value="tax_payment">Tax Payment</SelectItem>
              <SelectItem value="other">Other</SelectItem>
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
            placeholder="Search voucher or ref..." 
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
            <h3 className="text-sm font-bold text-slate-900">Payment Vouchers</h3>
            <p className="text-xs text-slate-500">Showing {list.length} recorded voucher entries</p>
          </div>
          {list.length > 0 && (
            <div className="text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              Disbursed Total: <span className="text-slate-900 font-bold font-mono">Rs. {totalDisbursed.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          )}
        </div>

        <DataTable
          columns={columns}
          data={list}
          loading={loading}
          emptyMessage="No payment vouchers found."
          pagination={{ page: 1, limit: list.length || 10, total: list.length || 0 }}
        />
      </div>
    </div>
  );
};

export default PaymentRegisterReportPage;
