import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../auth/AuthContext';
import { financeApi } from '../../../../api/financeApi';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import DataTable from '../../../../components/common/DataTable';
import ReportPageHeader from '../../../../components/finance/reports/ReportPageHeader';
import ReportFilterCard from '../../../../components/finance/reports/ReportFilterCard';
import ReportAmountCell from '../../../../components/finance/reports/ReportAmountCell';
import ReportToolbar from '../../../../components/finance/reports/ReportToolbar';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { AlertCircle } from 'lucide-react';
import StatusBadge from '../../../../components/common/StatusBadge';

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

  const fetchFiltersData = async () => {
    try {
      const [fyRes, apRes] = await Promise.all([
        financeApi.getFinancialYears({ limit: 100 }),
        financeApi.getAccountingPeriods({ limit: 100 })
      ]);
      if (fyRes.data?.success) setFinancialYears(fyRes.data.data);
      if (apRes.data?.success) setAccountingPeriods(apRes.data.data);
    } catch (error) {
      console.error("Failed to load filters data", error);
    }
  };

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      Object.keys(params).forEach((key: unknown) => {
        if (params[key] === "") delete params[key];
      });

      const response = await financeApi.getReceiptRegisterReport(params);
      if (response.data?.success) {
        setData(response.data.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch receipt register report");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchFiltersData();
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBranch]);

  const handleFilterChange = (key: unknown, value: unknown) => {
    setFilters((prev: unknown) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    fetchReport();
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
    setTimeout(() => fetchReport(), 0);
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

  if (!hasPermission("finance.report.receipt_register.view")) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Access Denied</h2>
        <p className="text-gray-500 dark:text-gray-400">You do not have permission to view the Receipt Register report.</p>
      </div>
    );
  }

  const columns = [
    {
      header: "Receipt No",
      accessor: "receipt_number",
      cell: (row: unknown) => <div className="font-medium text-navy-800 dark:text-white">{row.receipt_number}</div>
    },
    {
      header: "Date",
      accessor: "receipt_date",
      cell: (row: unknown) => format(new Date(row.receipt_date), 'yyyy-MM-dd')
    },
    {
      header: "Type",
      accessor: "receipt_type",
      cell: (row: unknown) => row.receipt_type.split('_').map((w: unknown) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    },
    {
      header: "Method",
      accessor: "receipt_method",
      cell: (row: unknown) => row.receipt_method.charAt(0).toUpperCase() + row.receipt_method.slice(1)
    },
    {
      header: "Received To",
      accessor: "received_to_account_name",
      cell: (row: unknown) => <div className="max-w-[150px] truncate" title={row.received_to_account_name}>{row.received_to_account_name || '-'}</div>
    },
    {
      header: "Ref No",
      accessor: "reference_number"
    },
    {
      header: <div className="text-right">Total Amount</div>,
      accessor: "total_amount",
      cell: (row: unknown) => <ReportAmountCell amount={row.total_amount} />
    },
    {
      header: "Approval",
      accessor: "approval_status",
      cell: (row: unknown) => <StatusBadge status={row.approval_status} />
    },
    {
      header: "Posted",
      accessor: "posted_status",
      cell: (row: unknown) => <StatusBadge status={row.posted_status} />
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

      <ReportFilterCard 
        onApply={handleApplyFilters} 
        onClear={handleClearFilters}
        isLoading={loading}
      >
        <div className="space-y-2">
          <Label>Financial Year</Label>
          <Select 
            value={filters.financial_year_id} 
            onValueChange={(val: unknown) => handleFilterChange('financial_year_id', val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Years</SelectItem>
              {financialYears.map((fy: unknown) => (
                <SelectItem key={fy.id} value={fy.id.toString()}>{fy.year_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Accounting Period</Label>
          <Select 
            value={filters.accounting_period_id} 
            onValueChange={(val: unknown) => handleFilterChange('accounting_period_id', val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Periods" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Periods</SelectItem>
              {accountingPeriods.map((ap: unknown) => (
                <SelectItem key={ap.id} value={ap.id.toString()}>{ap.period_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Receipt Method</Label>
          <Select 
            value={filters.receipt_method} 
            onValueChange={(val: unknown) => handleFilterChange('receipt_method', val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Methods" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Methods</SelectItem>
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
            value={filters.receipt_type} 
            onValueChange={(val: unknown) => handleFilterChange('receipt_type', val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              <SelectItem value="customer_receipt">Customer Receipt</SelectItem>
              <SelectItem value="other_income">Other Income</SelectItem>
              <SelectItem value="loan_receipt">Loan Receipt</SelectItem>
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
          />
        </div>

        <div className="space-y-2">
          <Label>Date To</Label>
          <Input 
            type="date" 
            value={filters.date_to}
            onChange={(e: any) => handleFilterChange('date_to', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Select 
            value={filters.posted_status} 
            onValueChange={(val: unknown) => handleFilterChange('posted_status', val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
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

      {data && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ReportToolbar onRefresh={fetchReport} onExportJson={handleExportJson} isRefreshing={loading} />

          <div className="bg-white dark:bg-navy-800 rounded-lg shadow border border-gray-200 dark:border-navy-700 overflow-hidden">
            <DataTable
              columns={columns}
              data={data.lines || []}
              loading={loading}
              emptyMessage="No receipt vouchers found."
              pagination={{ page: 1, limit: data.lines?.length || 10, total: data.lines?.length || 0 }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptRegisterReportPage;
