import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../auth/AuthContext';
import { financeApi } from '../../../api/financeApi';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import DataTable from '../../../components/common/DataTable';
import ReportPageHeader from '../../../components/finance/reports/ReportPageHeader';
import ReportFilterCard from '../../../components/finance/reports/ReportFilterCard';
import ReportAmountCell from '../../../components/finance/reports/ReportAmountCell';
import SourceTypeBadge from '../../../components/finance/reports/SourceTypeBadge';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Button } from '../../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { AlertCircle, RefreshCw } from 'lucide-react';
import RebuildLedgerModal from './RebuildLedgerModal';

const SOURCE_TYPES = [
  'opening_balance',
  'journal_entry',
  'journal_reversal',
  'payment_voucher',
  'receipt_voucher',
  'petty_cash_voucher',
  'petty_cash_replenishment',
  'fixed_asset_depreciation',
  'fixed_asset_disposal',
  'manual_adjustment'
];

const GeneralLedgerPage = () => {
  const { hasPermission, activeBranch } = useAuth();
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [isRebuildModalOpen, setIsRebuildModalOpen] = useState(false);

  // Filter State
  const [financialYears, setFinancialYears] = useState([]);
  const [accountingPeriods, setAccountingPeriods] = useState([]);
  const [accounts, setAccounts] = useState([]);

  const [filters, setFilters] = useState({
    financial_year_id: "",
    accounting_period_id: "",
    account_id: "",
    source_type: "",
    transaction_date_from: "",
    transaction_date_to: "",
    search: "",
    branch_id: activeBranch?.id || ""
  });

  const fetchFiltersData = async () => {
    try {
      const [fyRes, apRes, accRes] = await Promise.all([
        financeApi.getFinancialYears({ limit: 100 }),
        financeApi.getAccountingPeriods({ limit: 100 }),
        financeApi.getChartOfAccounts({ limit: 500, status: 'active' })
      ]);
      if (fyRes.data?.success) setFinancialYears(fyRes.data.data);
      if (apRes.data?.success) setAccountingPeriods(apRes.data.data);
      if (accRes.data?.success) setAccounts(accRes.data.data);
    } catch (error) {
      console.error("Failed to load filters data", error);
    }
  };

  const fetchLedgerEntries = useCallback(async (page: unknown = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: pagination.limit,
        ...filters
      };
      
      // Clean empty string params
      Object.keys(params).forEach((key: unknown) => {
        if (params[key] === "") delete params[key];
      });

      const response = await financeApi.getGeneralLedgerEntries(params);
      if (response.data?.success) {
        setData(response.data.data);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to fetch general ledger entries");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.limit]);

  useEffect(() => {
    fetchFiltersData();
    fetchLedgerEntries(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBranch]);

  const handleFilterChange = (key: unknown, value: unknown) => {
    setFilters((prev: unknown) => ({ ...prev, [key]: value }));
  };

  const handleApplyFilters = () => {
    fetchLedgerEntries(1);
  };

  const handleClearFilters = () => {
    setFilters({
      financial_year_id: "",
      accounting_period_id: "",
      account_id: "",
      source_type: "",
      transaction_date_from: "",
      transaction_date_to: "",
      search: "",
      branch_id: activeBranch?.id || ""
    });
    setTimeout(() => {
      fetchLedgerEntries(1);
    }, 0);
  };

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
      header: "Account",
      accessor: "account_code",
      cell: (row: unknown) => (
        <div>
          <div className="font-medium text-navy-800 ">{row.account_code}</div>
          <div className="text-xs text-gray-500">{row.account_name}</div>
        </div>
      )
    },
    {
      header: "Description",
      accessor: "description",
      cell: (row: unknown) => <div className="max-w-[200px] truncate" title={row.description}>{row.description || '-'}</div>
    },
    {
      header: <div className="text-right">Debit</div>,
      accessor: "debit_amount",
      cell: (row: unknown) => <ReportAmountCell amount={row.debit_amount} />
    },
    {
      header: <div className="text-right">Credit</div>,
      accessor: "credit_amount",
      cell: (row: unknown) => <ReportAmountCell amount={row.credit_amount} />
    },
    {
      header: <div className="text-right">Balance</div>,
      accessor: "running_balance",
      cell: (row: unknown) => <ReportAmountCell amount={row.running_balance} />
    }
  ];

  if (!hasPermission("finance.general_ledger.view")) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800  mb-2">Access Denied</h2>
        <p className="text-gray-500 ">You do not have permission to view the General Ledger.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-start mb-6">
        <ReportPageHeader 
          title="General Ledger" 
          description="View all posted financial transactions across all modules." 
          backTo={null}
        />
        
        {hasPermission("finance.ledger.rebuild") && (
          <Button 
            onClick={() => setIsRebuildModalOpen(true)}
            variant="destructive"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Rebuild Ledger
          </Button>
        )}
      </div>

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
          <Label>Account</Label>
          <Select 
            value={filters.account_id} 
            onValueChange={(val: unknown) => handleFilterChange('account_id', val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Accounts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Accounts</SelectItem>
              {accounts.map((acc: unknown) => (
                <SelectItem key={acc.id} value={acc.id.toString()}>{acc.account_code} - {acc.account_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Source Type</Label>
          <Select 
            value={filters.source_type} 
            onValueChange={(val: unknown) => handleFilterChange('source_type', val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              {SOURCE_TYPES.map((type: unknown) => (
                <SelectItem key={type} value={type}>{type.split('_').map((w: unknown) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Date From</Label>
          <Input 
            type="date" 
            value={filters.transaction_date_from}
            onChange={(e: any) => handleFilterChange('transaction_date_from', e.target.value)}
           placeholder="Enter value" />
        </div>

        <div className="space-y-2">
          <Label>Date To</Label>
          <Input 
            type="date" 
            value={filters.transaction_date_to}
            onChange={(e: any) => handleFilterChange('transaction_date_to', e.target.value)}
           placeholder="Enter value" />
        </div>

        <div className="space-y-2 lg:col-span-2">
          <Label>Search</Label>
          <Input 
            type="text" 
            placeholder="Search by source number, ref, account code..." 
            value={filters.search}
            onChange={(e: any) => handleFilterChange('search', e.target.value)}
            onKeyDown={(e: any) => { if (e.key === 'Enter') handleApplyFilters(); }}
          />
        </div>
      </ReportFilterCard>

      <div className="bg-white  rounded-lg shadow border border-gray-200 ">
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          pagination={pagination}
          onPageChange={(page: unknown) => fetchLedgerEntries(page)}
          emptyMessage="No ledger entries found."
        />
      </div>

      <RebuildLedgerModal 
        isOpen={isRebuildModalOpen}
        onClose={() => setIsRebuildModalOpen(false)}
        onSuccess={() => {
          setIsRebuildModalOpen(false);
          fetchLedgerEntries(1);
        }}
        financialYears={financialYears}
      />
    </div>
  );
};

export default GeneralLedgerPage;
