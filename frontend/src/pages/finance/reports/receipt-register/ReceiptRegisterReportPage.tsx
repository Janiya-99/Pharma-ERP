import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../auth/AuthContext';
import { financeApi } from '../../../../api/financeApi';
import { useDebounce } from '../../../../hooks/useDebounce';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import DataTable from '../../../../components/common/DataTable';
import ReportPageHeader from '../../../../components/finance/reports/ReportPageHeader';
import ReportFilterCard from '../../../../components/finance/reports/ReportFilterCard';
import ReportAmountCell from '../../../../components/finance/reports/ReportAmountCell';
import ReportToolbar from '../../../../components/finance/reports/ReportToolbar';
import { exportToPdf } from '../../../../utils/reportExportUtils';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { AlertCircle } from 'lucide-react';
import StatusBadge from '../../../../components/common/StatusBadge';
import { FinanceAiPromptBar } from '../../shared/FinanceAiPromptBar';

const ReceiptRegisterReportPage = () => {
  const { hasPermission, activeBranch } = useAuth();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filter State
  const [financialYears, setFinancialYears] = useState([]);
  const [accountingPeriods, setAccountingPeriods] = useState([]);

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

  const fetchReport = useCallback(async (overrideFilters?: any) => {
    setLoading(true);
    try {
      const params = { ...(overrideFilters || {}) };
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    fetchReport();
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
      receipt_type: "",
      receipt_method: "",
      branch_id: activeBranch?.id || ""
    });
  };

  const handleExportJson = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-register-${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    const list = (Array.isArray(data) ? data : data?.lines) || [];
    if (!list.length) return;
    const headers = ['Receipt No', 'Date', 'Ref No', 'Type', 'Received From', 'Total Amount', 'Approval Status', 'Posted Status', 'Created By'];
    const rows = list.map((r: any) => [
      `"${r.receipt_number || ''}"`,
      `"${r.receipt_date ? format(new Date(r.receipt_date), 'yyyy-MM-dd') : ''}"`,
      `"${r.reference_number || ''}"`,
      `"${r.receipt_type || ''}"`,
      `"${(r.received_from || '').replace(/"/g, '""')}"`,
      (r.total_amount ?? 0),
      `"${r.approval_status || ''}"`,
      `"${r.posted_status || ''}"`,
      `"${r.created_by_name || ''}"`
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
    const list = (Array.isArray(data) ? data : data?.lines) || [];
    if (!list.length) return;
    const formatCurrency = (val: number) => (val || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    const headers = ['Receipt No', 'Date', 'Ref No', 'Type', 'Received From', 'Amount (LKR)', 'Status'];
    const rows = list.map((r: any) => [
      r.receipt_number || '',
      r.receipt_date ? format(new Date(r.receipt_date), 'yyyy-MM-dd') : '',
      r.reference_number || '',
      r.receipt_type || '',
      r.received_from || '',
      formatCurrency(r.total_amount),
      r.approval_status || ''
    ]);

    const totalAmount = list.reduce((sum: number, r: any) => sum + (Number(r.total_amount) || 0), 0);

    exportToPdf({
      title: 'Receipt Register Report',
      filename: `receipt-register-${new Date().getTime()}`,
      subtitle: `Branch: ${activeBranch?.name || 'All'} | Records: ${list.length}`,
      headers,
      rows,
      alignments: ['left', 'center', 'left', 'left', 'left', 'right', 'center'],
      summary: [
        { title: 'Total Receipts', value: String(list.length) },
        { title: 'Total Received', value: formatCurrency(totalAmount) },
      ],
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
        <h2 className="text-2xl font-bold text-gray-800  mb-2">Access Denied</h2>
        <p className="text-gray-500 ">You do not have permission to view the Receipt Register report.</p>
      </div>
    );
  }

  const columns = [
    {
      header: "Receipt No",
      accessor: "receipt_number",
      cell: (row: any) => <div className="font-medium text-navy-800 ">{row.receipt_number}</div>
    },
    {
      header: "Date",
      accessor: "receipt_date",
      cell: (row: any) => format(new Date(row.receipt_date), 'yyyy-MM-dd')
    },
    {
      header: "Ref No",
      accessor: "reference_number"
    },
    {
      header: "Type",
      accessor: "receipt_type",
      cell: (row: any) => (row.receipt_type || '').split('_').map((w: any) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    },
    {
      header: "Received From",
      accessor: "received_from",
      cell: (row: any) => <div className="max-w-[150px] truncate" title={row.received_from}>{row.received_from || '-'}</div>
    },
    {
      header: <div className="text-right">Total Amount</div>,
      accessor: "total_amount",
      cell: (row: any) => <ReportAmountCell amount={row.total_amount} />
    },
    {
      header: "Approval Status",
      accessor: "approval_status",
      cell: (row: any) => <StatusBadge status={row.approval_status} />
    },
    {
      header: "Posted Status",
      accessor: "posted_status",
      cell: (row: any) => <StatusBadge status={row.posted_status} />
    },
    {
      header: "Created By",
      accessor: "created_by_name"
    }
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <ReportPageHeader 
        title="Receipt Register" 
        description="Log of all receipt vouchers with their approval and posting status." 
      />

      <FinanceAiPromptBar
        contextType="receipt_register"
        pageTitle="Receipt Register"
        dataSnapshot={data}
        className="mb-6"
      />

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
              <SelectItem value="other_income">Other Income</SelectItem>
              <SelectItem value="loan_receipt">Loan Receipt</SelectItem>
              <SelectItem value="other">Other</SelectItem>
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
           placeholder="Enter value" />
        </div>

        <div className="space-y-2">
          <Label>Date To</Label>
          <Input 
            type="date" 
            value={filters.date_to}
            onChange={(e: any) => handleFilterChange('date_to', e.target.value)}
           placeholder="Enter value" />
        </div>

        <div className="space-y-2 lg:col-span-2">
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

      {data && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ReportToolbar 
            onRefresh={fetchReport} 
            onExportJson={handleExportJson} 
            onExportCsv={handleExportCsv}
            onExportPdf={handleExportPdf}
            onPrint={() => window.print()}
            isRefreshing={loading} 
          />

          <div className="bg-white  rounded-lg shadow border border-gray-200  overflow-hidden">
            <DataTable
              columns={columns}
              data={(Array.isArray(data) ? data : data?.lines) || []}
              loading={loading}
              emptyMessage="No receipt vouchers found."
              pagination={{ page: 1, limit: (Array.isArray(data) ? data.length : data?.lines?.length) || 10, total: (Array.isArray(data) ? data.length : data?.lines?.length) || 0 }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptRegisterReportPage;
