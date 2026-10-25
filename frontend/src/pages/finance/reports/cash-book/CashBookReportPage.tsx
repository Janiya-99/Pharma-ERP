import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../../auth/AuthContext';
import { financeApi } from '../../../../api/financeApi';
import { useDebounce } from '../../../../hooks/useDebounce';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import DataTable from '../../../../components/common/DataTable';
import ReportPageHeader from '../../../../components/finance/reports/ReportPageHeader';
import ReportFilterCard from '../../../../components/finance/reports/ReportFilterCard';
import ReportSummaryCard from '../../../../components/finance/reports/ReportSummaryCard';
import ReportAmountCell from '../../../../components/finance/reports/ReportAmountCell';
import ReportActions from '../../../../components/finance/reports/ReportActions';
import SourceTypeBadge from '../../../../components/finance/reports/SourceTypeBadge';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { AlertCircle } from 'lucide-react';
import { FinanceAiPromptBar } from '../../shared/FinanceAiPromptBar';
import { exportToPdf } from '@/utils/reportExportUtils';

const CashBookReportPage = () => {
  const { hasPermission, activeBranch } = useAuth();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Filter State
  const [cashAccounts, setCashAccounts] = useState<any[]>([]);

  const [filters, setFilters] = useState<any>({
    account_id: "",
    date_from: "",
    date_to: "",
    branch_id: activeBranch?.id ? String(activeBranch.id) : ""
  });

  const debouncedFilters = useDebounce(filters, 300);

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

      const response = await financeApi.getCashBookReport(params);
      if (response.data?.success) {
        setData(response.data.data);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch cash book report");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFiltersData = async () => {
    try {
      const accRes = await financeApi.getChartOfAccounts({ limit: 500, status: 'active', is_cash_account: true });
      const cList = Array.isArray(accRes.data?.data) ? accRes.data.data : Array.isArray(accRes.data) ? accRes.data : [];
      setCashAccounts(cList);

      const defaultCashAcc = cList[0]?.id ? String(cList[0].id) : "";
      if (defaultCashAcc) {
        const initial = {
          account_id: defaultCashAcc,
          date_from: "",
          date_to: "",
          branch_id: activeBranch?.id ? String(activeBranch.id) : ""
        };
        setFilters(initial);
        // Directly load report (bypasses 300ms debounce)
        fetchReportWithFilters(initial);
      }
    } catch (error) {
      console.error("Failed to load filters data", error);
    }
  };

  const fetchReport = useCallback(async () => {
    fetchReportWithFilters(filters);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchReportWithFilters]);

  useEffect(() => {
    fetchFiltersData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBranch]);

  useEffect(() => {
    if (debouncedFilters.account_id) {
      fetchReportWithFilters(debouncedFilters);
    }
  }, [debouncedFilters, fetchReportWithFilters]);

  const handleFilterChange = (key: unknown, value: unknown) => {
    setFilters((prev: any) => ({ ...prev, [key as string]: value }));
  };

  const handleApplyFilters = () => {
    fetchReport();
  };

  const handleClearFilters = () => {
    const defaultCashAcc = cashAccounts[0]?.id ? String(cashAccounts[0].id) : "";
    const cleared = {
      account_id: defaultCashAcc,
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
    a.download = `cash-book-${filters.account_id}-${new Date().getTime()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    if (!data) return;
    const transactions = data.transactions || data.ledger_lines || [];
    const headers = ['Date', 'Source Type', 'Source No', 'Ref No', 'Description', 'Receipts (Debit)', 'Payments (Credit)', 'Running Balance'];
    const rows = transactions.map((t: any) => [
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
    a.download = `cash-book-${filters.account_id}-${new Date().getTime()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPdf = () => {
    if (!data) return;
    const transactions = data.transactions || data.ledger_lines || [];
    const headers = ['Date', 'Source Type', 'Source No', 'Ref No', 'Description', 'Receipts', 'Payments', 'Balance'];
    const rows = transactions.map((t: any) => [
      t.transaction_date ? format(new Date(t.transaction_date), 'yyyy-MM-dd') : '',
      t.source_type || '',
      t.source_number || '',
      t.reference_number || '',
      t.description || '',
      Number(t.debit_amount ?? t.debit ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 }),
      Number(t.credit_amount ?? t.credit ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 }),
      Number(t.running_balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 }),
    ]);

    exportToPdf({
      title: `Cash Book - ${data.account_code || data.account_details?.account_code || ''} ${data.account_name || data.account_details?.account_name || ''}`,
      filename: `cash-book-${filters.account_id}-${new Date().getTime()}`,
      subtitle: data.branch_name ? `Branch: ${data.branch_name}` : undefined,
      headers,
      rows,
      alignments: ['left', 'center', 'left', 'left', 'left', 'right', 'right', 'right'],
      summary: [
        { title: 'Opening Balance', value: Number(data.opening_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }) },
        { title: 'Total Receipts', value: Number(data.total_receipts || data.total_debit || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }) },
        { title: 'Total Payments', value: Number(data.total_payments || data.total_credit || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }) },
        { title: 'Closing Balance', value: Number(data.closing_balance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }) },
      ],
    });
  };

  const canView =
    hasPermission("finance.report.cash_book.view") ||
    hasPermission("finance.report.view") ||
    hasPermission("finance.reports.view");

  if (!canView) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
        <p className="text-gray-500">You do not have permission to view the Cash Book report.</p>
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
      header: <div className="text-right">Receipts (Dr)</div>,
      accessor: "debit",
      cell: (row: any) => <ReportAmountCell amount={row.debit_amount ?? row.debit} />
    },
    {
      header: <div className="text-right">Payments (Cr)</div>,
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
        title="Cash Book" 
        description="Daily record of all physical cash receipts, cash deposits, and petty cash disbursements." 
        actions={
          <ReportActions
            onRefresh={fetchReport}
            onExportCsv={handleExportCsv}
            onExportPdf={handleExportPdf}
            onExportJson={handleExportJson}
            onPrint={() => window.print()}
            loading={loading}
            disabled={!data}
          />
        }
      />

      {/* AI Copilot Prompting Bar */}
      <FinanceAiPromptBar
        contextType="banking"
        pageTitle="Cash Book"
        dataSnapshot={data}
      />

      <ReportFilterCard 
        onApply={handleApplyFilters} 
        onClear={handleClearFilters}
        isLoading={loading}
      >
        <div className="space-y-2">
          <Label>Cash Account <span className="text-red-500">*</span></Label>
          <Select 
            value={filters.account_id} 
            onValueChange={(val: string) => handleFilterChange('account_id', val)}
          >
            <SelectTrigger className={!filters.account_id ? "border-red-300" : ""}>
              <SelectValue placeholder="Select Cash Account" />
            </SelectTrigger>
            <SelectContent>
              {(cashAccounts || []).map((acc: any) => (
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
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
          <div className="bg-white rounded-xl p-5 shadow-xs border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800">{data.account_code || (data.account_details?.account_code)} - {data.account_name || (data.account_details?.account_name)}</h2>
            {data.branch_name && <p className="text-slate-500 text-xs mt-1">Branch: {data.branch_name}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <ReportSummaryCard title="Opening Balance" amount={data.opening_balance} />
            <ReportSummaryCard title="Total Receipts" amount={data.total_receipts || data.total_debit} />
            <ReportSummaryCard title="Total Payments" amount={data.total_payments || data.total_credit} />
            <ReportSummaryCard title="Closing Balance" amount={data.closing_balance} className="bg-emerald-50/60 border-emerald-200" />
          </div>

          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            <DataTable
              columns={columns}
              data={data.transactions || data.ledger_lines || []}
              loading={loading}
              emptyMessage="No cash transactions found for the selected period."
            />
          </div>
        </div>
      )}
      
      {!data && !loading && (
        <div className="bg-white rounded-xl shadow-xs p-8 text-center border border-slate-200">
          <AlertCircle className="mx-auto h-12 w-12 text-slate-400" />
          <h3 className="mt-4 text-lg font-medium text-slate-900">Select Cash Account</h3>
          <p className="mt-2 text-sm text-slate-500">
            Select a cash account from the filters above to inspect transactions.
          </p>
        </div>
      )}
    </div>
  );
};

export default CashBookReportPage;
