import os

gl_page_path = "frontend/src/pages/finance/general-ledger/GeneralLedgerPage.jsx"
modal_page_path = "frontend/src/pages/finance/general-ledger/RebuildLedgerModal.jsx"

gl_content = """import React, { useState, useEffect, useCallback } from 'react';
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

  const fetchLedgerEntries = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: pagination.limit,
        ...filters
      };
      
      // Clean empty string params
      Object.keys(params).forEach(key => {
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

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
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
      header: "Account",
      accessor: "account_code",
      cell: (row) => (
        <div>
          <div className="font-medium text-navy-800 dark:text-white">{row.account_code}</div>
          <div className="text-xs text-gray-500">{row.account_name}</div>
        </div>
      )
    },
    {
      header: "Description",
      accessor: "description",
      cell: (row) => <div className="max-w-[200px] truncate" title={row.description}>{row.description || '-'}</div>
    },
    {
      header: <div className="text-right">Debit</div>,
      accessor: "debit_amount",
      cell: (row) => <ReportAmountCell amount={row.debit_amount} />
    },
    {
      header: <div className="text-right">Credit</div>,
      accessor: "credit_amount",
      cell: (row) => <ReportAmountCell amount={row.credit_amount} />
    },
    {
      header: <div className="text-right">Balance</div>,
      accessor: "running_balance",
      cell: (row) => <ReportAmountCell amount={row.running_balance} />
    }
  ];

  if (!hasPermission("finance.general_ledger.view")) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Access Denied</h2>
        <p className="text-gray-500 dark:text-gray-400">You do not have permission to view the General Ledger.</p>
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
            onValueChange={(val) => handleFilterChange('financial_year_id', val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Years" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Years</SelectItem>
              {financialYears.map(fy => (
                <SelectItem key={fy.id} value={fy.id.toString()}>{fy.year_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Accounting Period</Label>
          <Select 
            value={filters.accounting_period_id} 
            onValueChange={(val) => handleFilterChange('accounting_period_id', val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Periods" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Periods</SelectItem>
              {accountingPeriods.map(ap => (
                <SelectItem key={ap.id} value={ap.id.toString()}>{ap.period_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Account</Label>
          <Select 
            value={filters.account_id} 
            onValueChange={(val) => handleFilterChange('account_id', val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Accounts" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Accounts</SelectItem>
              {accounts.map(acc => (
                <SelectItem key={acc.id} value={acc.id.toString()}>{acc.account_code} - {acc.account_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Source Type</Label>
          <Select 
            value={filters.source_type} 
            onValueChange={(val) => handleFilterChange('source_type', val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Types</SelectItem>
              {SOURCE_TYPES.map(type => (
                <SelectItem key={type} value={type}>{type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Date From</Label>
          <Input 
            type="date" 
            value={filters.transaction_date_from}
            onChange={(e) => handleFilterChange('transaction_date_from', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Date To</Label>
          <Input 
            type="date" 
            value={filters.transaction_date_to}
            onChange={(e) => handleFilterChange('transaction_date_to', e.target.value)}
          />
        </div>

        <div className="space-y-2 lg:col-span-2">
          <Label>Search</Label>
          <Input 
            type="text" 
            placeholder="Search by source number, ref, account code..." 
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleApplyFilters(); }}
          />
        </div>
      </ReportFilterCard>

      <div className="bg-white dark:bg-navy-800 rounded-lg shadow border border-gray-200 dark:border-navy-700">
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          pagination={pagination}
          onPageChange={(page) => fetchLedgerEntries(page)}
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
"""

modal_content = """import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { financeApi } from '../../../api/financeApi';
import Modal from '../../../components/common/Modal';
import { Label } from '../../../components/ui/label';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { AlertTriangle } from 'lucide-react';

const RebuildLedgerModal = ({ isOpen, onClose, onSuccess, financialYears }) => {
  const [financialYearId, setFinancialYearId] = useState("");
  const [confirmationText, setConfirmationText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!financialYearId) {
      toast.error("Please select a financial year");
      return;
    }
    if (confirmationText !== "REBUILD") {
      toast.error("Please type REBUILD to confirm");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await financeApi.rebuildGeneralLedger({ financial_year_id: parseInt(financialYearId) });
      if (response.data?.success) {
        toast.success("Ledger rebuilt successfully");
        setFinancialYearId("");
        setConfirmationText("");
        onSuccess();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to rebuild ledger");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isConfirmDisabled = !financialYearId || confirmationText !== "REBUILD" || isSubmitting;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rebuild General Ledger"
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-900/30">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-red-800 dark:text-red-400 mb-1">Warning: Destructive Action</h4>
              <p className="text-sm text-red-700 dark:text-red-300">
                This will rebuild ledger entries for the selected financial year from posted transactions. 
                This action should only be used by Finance Managers. Existing entries for the selected year will be deleted and recreated.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-red-600 font-semibold">Select Financial Year to Rebuild <span className="text-red-500">*</span></Label>
          <Select 
            value={financialYearId} 
            onValueChange={setFinancialYearId}
          >
            <SelectTrigger className="border-red-200 focus:ring-red-500">
              <SelectValue placeholder="Select Financial Year" />
            </SelectTrigger>
            <SelectContent>
              {financialYears.map(fy => (
                <SelectItem key={fy.id} value={fy.id.toString()}>{fy.year_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Type <strong className="select-none">REBUILD</strong> to confirm</Label>
          <Input 
            type="text" 
            placeholder="REBUILD" 
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
            autoComplete="off"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-navy-700">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="destructive"
            disabled={isConfirmDisabled}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isSubmitting ? "Rebuilding..." : "Rebuild Ledger"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RebuildLedgerModal;
"""

with open(gl_page_path, 'w') as f:
    f.write(gl_content)

with open(modal_page_path, 'w') as f:
    f.write(modal_content)
    
print("Updated GeneralLedgerPage and RebuildLedgerModal")

