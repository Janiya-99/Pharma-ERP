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

const JournalRegisterReportPage = () => {
  const { hasPermission, activeBranch } = useAuth();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filter State
  const [financialYears, setFinancialYears] = useState([]);
  const [accountingPeriods, setAccountingPeriods] = useState([]);

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

  const fetchFiltersData = async () => {
    try {
      const [fyRes, apRes] = await Promise.all([
        financeApi.getFinancialYears({ limit: 100 }),
        financeApi.getAccountingPeriods({ limit: 100 })
      ]);
      if (fyRes.data?.success) setFinancialYears(fyRes.data.data || []);
      if (apRes.data?.success) setAccountingPeriods(apRes.data.data || []);
    } catch (error) {
      console.error("Failed to load filters data", error);
    }
  };

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const params = { ...filters };
      Object.keys(params).forEach((key: any) => {
        if (params[key] === "") delete params[key];
      });

      const response = await financeApi.getJournalRegisterReport(params);
      if (response.data?.success) {
        setData(response.data.data || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch journal register report");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchFiltersData();
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBranch]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev: any) => ({ ...prev, [key]: value }));
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
    a.download = `journal-register-${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!hasPermission("finance.report.journal_register.view")) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800  mb-2">Access Denied</h2>
        <p className="text-gray-500 ">You do not have permission to view the Journal Register report.</p>
      </div>
    );
  }

  const columns = [
    {
      header: "Journal No",
      accessor: "journal_number",
      cell: (row: any) => <div className="font-medium text-navy-800 ">{row.journal_number}</div>
    },
    {
      header: "Date",
      accessor: "journal_date",
      cell: (row: any) => format(new Date(row.journal_date), 'yyyy-MM-dd')
    },
    {
      header: "Ref No",
      accessor: "reference_number"
    },
    {
      header: "Description",
      accessor: "description",
      cell: (row: any) => <div className="max-w-[150px] truncate" title={row.description}>{row.description || '-'}</div>
    },
    {
      header: <div className="text-right">Total Debit</div>,
      accessor: "total_debit",
      cell: (row: any) => <ReportAmountCell amount={row.total_debit} />
    },
    {
      header: <div className="text-right">Total Credit</div>,
      accessor: "total_credit",
      cell: (row: any) => <ReportAmountCell amount={row.total_credit} />
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
        title="Journal Register" 
        description="Log of all manual journal entries with their approval and posting status." 
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
            onValueChange={(val: any) => handleFilterChange('financial_year_id', val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Years</SelectItem>
              {(financialYears || []).map((fy: any) => (
                <SelectItem key={fy.id} value={fy.id.toString()}>{fy.year_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Accounting Period</Label>
          <Select 
            value={filters.accounting_period_id} 
            onValueChange={(val: any) => handleFilterChange('accounting_period_id', val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Periods" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Periods</SelectItem>
              {(accountingPeriods || []).map((ap: any) => (
                <SelectItem key={ap.id} value={ap.id.toString()}>{ap.period_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Approval Status</Label>
          <Select 
            value={filters.approval_status} 
            onValueChange={(val: any) => handleFilterChange('approval_status', val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Posted Status</Label>
          <Select 
            value={filters.posted_status} 
            onValueChange={(val: any) => handleFilterChange('posted_status', val)}
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

      {data && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <ReportToolbar onRefresh={fetchReport} onExportJson={handleExportJson} isRefreshing={loading} />

          <div className="bg-white  rounded-lg shadow border border-gray-200  overflow-hidden">
            <DataTable
              columns={columns}
              data={(Array.isArray(data) ? data : data?.lines) || []}
              loading={loading}
              emptyMessage="No journal entries found."
              pagination={{ page: 1, limit: (Array.isArray(data) ? data.length : data?.lines?.length) || 10, total: (Array.isArray(data) ? data.length : data?.lines?.length) || 0 }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default JournalRegisterReportPage;
