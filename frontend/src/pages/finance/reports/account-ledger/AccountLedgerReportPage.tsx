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
import { FinanceAiPromptBar } from '../../shared/FinanceAiPromptBar';
import { useDebounce } from '../../../../hooks/useDebounce';

const AccountLedgerReportPage = () => {
  const { hasPermission, activeBranch } = useAuth();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Filter State
  const [financialYears, setFinancialYears] = useState<any[]>([]);
  const [accountingPeriods, setAccountingPeriods] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);

  const [filters, setFilters] = useState<any>({
    financial_year_id: "",
    accounting_period_id: "",
    account_id: "",
    date_from: "",
    date_to: "",
    branch_id: activeBranch?.id ? String(activeBranch.id) : ""
  });

  const fetchReportWithFilters = useCallback(async (activeFilters: any) => {
    if (!activeFilters?.account_id) {
      return;
    }

    setLoading(true);
    try {
      const params = { ...activeFilters };
      Object.keys(params).forEach((key) => {
        if (params[key] === "" || params[key] === undefined || params[key] === null) {
          delete params[key];
        }
      });

      const response = await financeApi.getAccountLedgerReport(params);
      if (response.data?.success) {
        setData(response.data.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch account ledger report");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFiltersData = async () => {
    try {
      const [fyRes, apRes, accRes] = await Promise.all([
        financeApi.getFinancialYears({ limit: 100 }),
        financeApi.getAccountingPeriods({ limit: 100 }),
        financeApi.getChartOfAccounts({ limit: 500, status: 'active' })
      ]);
      const fyList = Array.isArray(fyRes.data?.data) ? fyRes.data.data : Array.isArray(fyRes.data) ? fyRes.data : [];
      const apList = Array.isArray(apRes.data?.data) ? apRes.data.data : Array.isArray(apRes.data) ? apRes.data : [];
      const accList = Array.isArray(accRes.data?.data) ? accRes.data.data : Array.isArray(accRes.data) ? accRes.data : [];

      setFinancialYears(fyList);
      setAccountingPeriods(apList);
      setAccounts(accList);

      const activeFy = fyList.find((f: any) => f.is_active || f.status === 'active') || fyList[0];
      // Auto-default to first bank/cash account or primary operating account
      const defaultAccount = accList.find((a: any) => a.is_bank_account || a.is_cash_account) || accList[0];

      if (defaultAccount && !filters.account_id) {
        setFilters((prev: any) => ({
          ...prev,
          financial_year_id: activeFy ? String(activeFy.id) : prev.financial_year_id,
          account_id: String(defaultAccount.id),
          branch_id: activeBranch?.id ? String(activeBranch.id) : prev.branch_id
        }));
      }
    } catch (error) {
      console.error("Failed to load filters data", error);
    }
  };

  const debouncedFilters = useDebounce(filters, 300);

  const fetchReport = useCallback(async () => {
    fetchReportWithFilters(filters);
  }, [filters, fetchReportWithFilters]);

  useEffect(() => {
    fetchFiltersData();
  }, [activeBranch]);

  useEffect(() => {
    if (debouncedFilters.account_id) {
      fetchReportWithFilters(debouncedFilters);
    }
  }, [debouncedFilters, fetchReportWithFilters]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    fetchReport();
  };

  const handleClearFilters = () => {
    const cleared = {
      financial_year_id: "",
      accounting_period_id: "",
      account_id: accounts.length > 0 ? String(accounts[0].id) : "",
      date_from: "",
      date_to: "",
      branch_id: activeBranch?.id ? String(activeBranch.id) : ""
    };
    setFilters(cleared);
    if (cleared.account_id) {
      fetchReportWithFilters(cleared);
    } else {
      setData(null);
    }
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

  const handleExportCsv = () => {
    if (!data) return;
    const lines = data.ledger_lines || [];
    const headers = ['Date', 'Source Type', 'Source No', 'Ref No', 'Description', 'Debit', 'Credit', 'Running Balance'];
    const rows = lines.map((t: any) => [
      t.transaction_date ? format(new Date(t.transaction_date), 'yyyy-MM-dd') : '',
      `"${t.source_type || ''}"`,
      `"${t.source_number || ''}"`,
      `"${t.reference_number || ''}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      (t.debit_amount ?? t.debit ?? 0),
      (t.credit_amount ?? t.credit ?? 0),
      (t.running_balance ?? 0)
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `account-ledger-${filters.account_id}-${new Date().getTime()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const canView =
    hasPermission("finance.report.account_ledger.view") ||
    hasPermission("finance.report.view") ||
    hasPermission("finance.reports.view");

  if (!canView) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
        <p className="text-gray-500">You do not have permission to view the Account Ledger report.</p>
      </div>
    );
  }

  const columns = [
    {
      header: "Date",
      accessor: "transaction_date",
      cell: (row: any) => format(new Date(row.transaction_date), 'yyyy-MM-dd')
    },
    {
      header: "Source Type",
      accessor: "source_type",
      cell: (row: any) => <SourceTypeBadge type={row.source_type} />
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
      cell: (row: any) => <div className="max-w-[200px] truncate" title={row.description}>{row.description || '-'}</div>
    },
    {
      header: <div className="text-right">Debit</div>,
      accessor: "debit",
      cell: (row: any) => <ReportAmountCell amount={row.debit_amount ?? row.debit} />
    },
    {
      header: <div className="text-right">Credit</div>,
      accessor: "credit",
      cell: (row: any) => <ReportAmountCell amount={row.credit_amount ?? row.credit} />
    },
    {
      header: <div className="text-right">Balance</div>,
      accessor: "running_balance",
      cell: (row: any) => <ReportAmountCell amount={row.running_balance} />
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <ReportPageHeader 
        title="Account Ledger" 
        description="Detailed chronological record of all debit and credit postings for an account." 
      />

      {/* AI Copilot Prompting Bar */}
      <FinanceAiPromptBar
        contextType="account_ledger"
        pageTitle="Account Ledger"
        dataSnapshot={data}
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
            onValueChange={(val: string) => handleFilterChange('account_id', val)}
          >
            <SelectTrigger className={!filters.account_id ? "border-red-300" : ""}>
              <SelectValue placeholder="Select Account" />
            </SelectTrigger>
            <SelectContent>
              {(accounts || []).map((acc: any) => (
                <SelectItem key={acc.id} value={acc.id.toString()}>{acc.account_code} - {acc.account_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Financial Year</Label>
          <Select 
            value={filters.financial_year_id} 
            onValueChange={(val: string) => handleFilterChange('financial_year_id', val)}
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
            onValueChange={(val: string) => handleFilterChange('accounting_period_id', val)}
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

      {data && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="mb-6 bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-slate-900">{data.account_code || (data.account_details?.account_code)} - {data.account_name || (data.account_details?.account_name)}</h2>
            {data.branch_name && <p className="text-slate-500 mt-1 text-xs">Branch: {data.branch_name}</p>}
          </div>

          <ReportToolbar onRefresh={fetchReport} onExportJson={handleExportJson} onExportCsv={handleExportCsv} isRefreshing={loading} />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <ReportSummaryCard title="Opening Balance" amount={data.opening_balance} />
            <ReportSummaryCard title="Total Debit" amount={data.total_debit} />
            <ReportSummaryCard title="Total Credit" amount={data.total_credit} />
            <ReportSummaryCard title="Closing Balance" amount={data.closing_balance} className="bg-indigo-50/50 border-indigo-200" />
          </div>

          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
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
        <div className="bg-white rounded-xl shadow-xs p-8 text-center border border-slate-200">
          <AlertCircle className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-4 text-lg font-medium text-slate-900">Select Account</h3>
          <p className="mt-2 text-sm text-slate-500">
            Select an account from the filters above to inspect its general ledger postings.
          </p>
        </div>
      )}
    </div>
  );
};

export default AccountLedgerReportPage;
