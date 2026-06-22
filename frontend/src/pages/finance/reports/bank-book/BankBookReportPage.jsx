import React, { useState, useEffect, useCallback } from 'react';
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

const BankBookReportPage = () => {
  const { hasPermission, activeBranch } = useAuth();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filter State
  const [bankAccounts, setBankAccounts] = useState([]);
  const [chartAccounts, setChartAccounts] = useState([]);

  const [filters, setFilters] = useState({
    bank_account_id: "",
    account_id: "",
    date_from: "",
    date_to: "",
    branch_id: activeBranch?.id || ""
  });

  const fetchFiltersData = async () => {
    try {
      const [bankRes, chartRes] = await Promise.all([
        financeApi.getBankAccounts({ limit: 100 }),
        financeApi.getChartOfAccounts({ limit: 500, status: 'active', is_bank_account: true })
      ]);
      if (bankRes.data?.success) setBankAccounts(bankRes.data.data);
      if (chartRes.data?.success) setChartAccounts(chartRes.data.data);
    } catch (error) {
      console.error("Failed to load filters data", error);
    }
  };

  const fetchReport = useCallback(async () => {
    if (!filters.bank_account_id && !filters.account_id) {
      toast.error("Please select a Bank Account or a Chart Account");
      return;
    }

    setLoading(true);
    try {
      const params = { ...filters };
      Object.keys(params).forEach(key => {
        if (params[key] === "") delete params[key];
      });

      const response = await financeApi.getBankBookReport(params);
      if (response.data?.success) {
        setData(response.data.data);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch bank book report");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchFiltersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBranch]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    fetchReport();
  };

  const handleClearFilters = () => {
    setFilters({
      bank_account_id: "",
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
    a.download = `bank-book-${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!hasPermission("finance.report.bank_book.view")) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Access Denied</h2>
        <p className="text-gray-500 dark:text-gray-400">You do not have permission to view the Bank Book report.</p>
      </div>
    );
  }

  const columns = [
    {
      header: "Date",
      accessor: "transaction_date",
      cell: (row) => format(new Date(row.transaction_date), 'yyyy-MM-dd')
    },
    {
      header: "Source Type",
      accessor: "source_type",
      cell: (row) => <SourceTypeBadge type={row.source_type} />
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
      cell: (row) => <div className="max-w-[200px] truncate" title={row.description}>{row.description || '-'}</div>
    },
    {
      header: <div className="text-right">Deposit</div>,
      accessor: "debit",
      cell: (row) => <ReportAmountCell amount={row.debit} />
    },
    {
      header: <div className="text-right">Withdrawal</div>,
      accessor: "credit",
      cell: (row) => <ReportAmountCell amount={row.credit} />
    },
    {
      header: <div className="text-right">Balance</div>,
      accessor: "running_balance",
      cell: (row) => <ReportAmountCell amount={row.running_balance} />
    }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <ReportPageHeader 
        title="Bank Book" 
        description="Record of all transactions for specific bank accounts." 
      />

      <ReportFilterCard 
        onApply={handleApplyFilters} 
        onClear={handleClearFilters}
        isLoading={loading}
      >
        <div className="space-y-2">
          <Label>System Bank Account</Label>
          <Select 
            value={filters.bank_account_id} 
            onValueChange={(val) => {
              handleFilterChange('bank_account_id', val);
              handleFilterChange('account_id', ""); // Clear chart account if bank account is selected
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Bank Account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Select Bank Account</SelectItem>
              {bankAccounts.map(acc => (
                <SelectItem key={acc.id} value={acc.id.toString()}>{acc.bank_name} - {acc.account_number}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Chart Account</Label>
          <Select 
            value={filters.account_id} 
            onValueChange={(val) => {
              handleFilterChange('account_id', val);
              handleFilterChange('bank_account_id', ""); // Clear bank account if chart account is selected
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Chart Account" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Select Chart Account</SelectItem>
              {chartAccounts.map(acc => (
                <SelectItem key={acc.id} value={acc.id.toString()}>{acc.account_code} - {acc.account_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Date From</Label>
          <Input 
            type="date" 
            value={filters.date_from}
            onChange={(e) => handleFilterChange('date_from', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Date To</Label>
          <Input 
            type="date" 
            value={filters.date_to}
            onChange={(e) => handleFilterChange('date_to', e.target.value)}
          />
        </div>
      </ReportFilterCard>

      {data && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-6 bg-white dark:bg-navy-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-navy-700">
            <h2 className="text-xl font-bold text-navy-800 dark:text-white">{data.account_code} - {data.account_name}</h2>
            {data.bank_details && <p className="text-gray-500 dark:text-gray-400 mt-1">{data.bank_details}</p>}
          </div>

          <ReportToolbar onRefresh={fetchReport} onExportJson={handleExportJson} isRefreshing={loading} />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <ReportSummaryCard title="Opening Balance" amount={data.opening_balance} />
            <ReportSummaryCard title="Total Deposits" amount={data.total_deposits} className="bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30" />
            <ReportSummaryCard title="Total Withdrawals" amount={data.total_withdrawals} className="bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30" />
            <ReportSummaryCard title="Closing Balance" amount={data.closing_balance} className="bg-brand-50 dark:bg-navy-900 border-brand-200 dark:border-navy-700" />
          </div>

          <div className="bg-white dark:bg-navy-800 rounded-lg shadow border border-gray-200 dark:border-navy-700">
            <DataTable
              columns={columns}
              data={data.lines || []}
              loading={loading}
              emptyMessage="No bank transactions found for the selected period."
            />
          </div>
        </div>
      )}
      
      {!data && !loading && (
        <div className="bg-white dark:bg-navy-800 rounded-lg shadow p-8 text-center border border-gray-200 dark:border-navy-700">
          <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Select Filters</h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Select a bank account and click Apply Filters to view the bank book.
          </p>
        </div>
      )}
    </div>
  );
};

export default BankBookReportPage;
