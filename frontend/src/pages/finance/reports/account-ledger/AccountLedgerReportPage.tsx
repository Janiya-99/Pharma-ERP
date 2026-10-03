import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../auth/AuthContext';
import { financeApi } from '../../../../api/financeApi';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import DataTable from '../../../../components/common/DataTable';
import ReportPageHeader from '../../../../components/finance/reports/ReportPageHeader';
import ReportFilterCard from '../../../../components/finance/reports/ReportFilterCard';
import ReportSummaryCard from '../../../../components/finance/reports/ReportSummaryCard';
import ReportAmountCell from '../../../../components/finance/reports/ReportAmountCell';
import ReportToolbar from '../../../../components/finance/reports/ReportToolbar';
import SourceTypeBadge from '../../../../components/finance/reports/SourceTypeBadge';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { AlertCircle } from 'lucide-react';

const AccountLedgerReportPage = () => {
  const { hasPermission, activeBranch } = useAuth();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filter State
  const [financialYears, setFinancialYears] = useState([]);
  const [accountingPeriods, setAccountingPeriods] = useState([]);
  const [accounts, setAccounts] = useState([]);

  const [filters, setFilters] = useState({
    financial_year_id: "",
    accounting_period_id: "",
    account_id: "",
    date_from: "",
    date_to: "",
    branch_id: activeBranch?.id || ""
  });

  const fetchFiltersData = async () => {
    try {
      const [fyRes, apRes, accRes] = await Promise.all([
        financeApi.getFinancialYears({ limit: 100 }),
        financeApi.getAccountingPeriods({ limit: 100 }),
        financeApi.getChartOfAccounts({ limit: 500, status: 'active' })
      ]);
      if (fyRes.data?.success) setFinancialYears(fyRes.data.data || []);
      if (apRes.data?.success) setAccountingPeriods(apRes.data.data || []);
      if (accRes.data?.success) setAccounts(accRes.data.data || []);
    } catch (error) {
      console.error("Failed to load filters data", error);
    }
  };

  const fetchReport = useCallback(async () => {
    if (!filters.account_id) {
      toast.error("Account is required");
      return;
    }

    setLoading(true);
    try {
      const params = { ...filters };
      Object.keys(params).forEach((key: unknown) => {
        if (params[key] === "") delete params[key];
      });

      const response = await financeApi.getAccountLedgerReport(params);
      if (response.data?.success) {
        setData(response.data.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch account ledger report");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchFiltersData();
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
      account_id: "",
      date_from: "",
      date_to: "",
      branch_id: activeBranch?.id || ""
    });
    setData(null);
  };

  const handleExportJson = () => {
    if (!data) return;
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `account-ledger-${filters.account_id}-${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!hasPermission("finance.report.account_ledger.view")) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800  mb-2">Access Denied</h2>
        <p className="text-gray-500 ">You do not have permission to view the Account Ledger report.</p>
      </div>
    );
  }

  const columns = [
    {
      header: "Date",
      accessor: "transaction_date",
      cell: (row: unknown) => format(new Date(row.transaction_date), 'yyyy-MM-dd')
    },
    {
      header: "Source Type",
      accessor: "source_type",
      cell: (row: unknown) => <SourceTypeBadge type={row.source_type} />
    },
    {
      header: "Source No",
      accessor: "source_number"
    },
    {
      header: "Ref No",
      accessor: "reference_number"
    },
    {
      header: "Description",
      accessor: "description",
      cell: (row: unknown) => <div className="max-w-[200px] truncate" title={row.description}>{row.description || '-'}</div>
    },
    {
      header: <div className="text-right">Debit</div>,
      accessor: "debit",
      cell: (row: unknown) => <ReportAmountCell amount={row.debit} />
    },
    {
      header: <div className="text-right">Credit</div>,
      accessor: "credit",
      cell: (row: unknown) => <ReportAmountCell amount={row.credit} />
    },
    {
      header: <div className="text-right">Balance</div>,
      accessor: "running_balance",
      cell: (row: unknown) => <ReportAmountCell amount={row.running_balance} />
    }
  ];

  return (
    <div className="p-6">
      <ReportPageHeader 
        title="Account Ledger" 
        description="Detailed chronological record of all transactions for a specific account." 
      />

      <ReportFilterCard 
        onApply={handleApplyFilters} 
        onClear={handleClearFilters}
        isLoading={loading}
      >
        <div className="space-y-2">
          <Label>Account <span className="text-red-500">*</span></Label>
          <Select 
            value={filters.account_id} 
            onValueChange={(val: unknown) => handleFilterChange('account_id', val)}
          >
            <SelectTrigger className={!filters.account_id ? "border-red-300" : ""}>
              <SelectValue placeholder="Select Account" />
            </SelectTrigger>
            <SelectContent>
              {(accounts || []).map((acc: unknown) => (
                <SelectItem key={acc.id} value={acc.id.toString()}>{acc.account_code} - {acc.account_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
              {(financialYears || []).map((fy: unknown) => (
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
              {(accountingPeriods || []).map((ap: unknown) => (
                <SelectItem key={ap.id} value={ap.id.toString()}>{ap.period_name}</SelectItem>
              ))}
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
      </ReportFilterCard>

      {data && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-6 bg-white  rounded-lg p-6 shadow-sm border border-gray-200 ">
            <h2 className="text-xl font-bold text-navy-800 ">{data.account_code} - {data.account_name}</h2>
            {data.branch_name && <p className="text-gray-500  mt-1">Branch: {data.branch_name}</p>}
          </div>

          <ReportToolbar onRefresh={fetchReport} onExportJson={handleExportJson} isRefreshing={loading} />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <ReportSummaryCard title="Opening Balance" amount={data.opening_balance} />
            <ReportSummaryCard title="Total Debit" amount={data.total_debit} />
            <ReportSummaryCard title="Total Credit" amount={data.total_credit} />
            <ReportSummaryCard title="Closing Balance" amount={data.closing_balance} className="bg-brand-50  border-brand-200 " />
          </div>

          <div className="bg-white  rounded-lg shadow border border-gray-200 ">
            <DataTable
              columns={columns}
              data={data.ledger_lines || []}
              loading={loading}
              emptyMessage="No transactions found for the selected period."
            />
          </div>
        </div>
      )}
      
      {!data && !loading && (
        <div className="bg-white  rounded-lg shadow p-8 text-center border border-gray-200 ">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 ">Select Filters</h3>
          <p className="mt-2 text-sm text-gray-500 ">
            Select an account and click Apply Filters to view the account ledger.
          </p>
        </div>
      )}
    </div>
  );
};

export default AccountLedgerReportPage;
