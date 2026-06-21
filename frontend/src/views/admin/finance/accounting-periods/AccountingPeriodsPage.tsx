import React, { useEffect, useState } from "react";
import { financeApi } from "api/financeApi";
import DataTable from "components/erp/DataTable";
import PermissionGuard from "components/erp/PermissionGuard";
import FinancePageHeader from "components/finance/FinancePageHeader";
import FinancialYearSelect from "components/finance/FinancialYearSelect";
import { Button } from "components/ui/button";
import { Plus } from "lucide-react";
import AccountingPeriodFormModal from "./AccountingPeriodFormModal";
import { toast } from "react-hot-toast";

export default function AccountingPeriodsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [financialYearId, setFinancialYearId] = useState("");
  
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fetchPeriods = async () => {
    setLoading(true);
    try {
      const res = await financeApi.getAccountingPeriods({
        page,
        limit,
        search,
        financial_year_id: financialYearId,
      });
      if (res.data.success) {
        setData(res.data.data);
        setTotal(res.data.pagination.total);
      }
    } catch (err) {
      console.error("Failed to fetch accounting periods", err);
      toast.error("Failed to load accounting periods");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriods();
  }, [page, limit, search, financialYearId]);

  const handleCreate = () => {
    setSelectedRecord(null);
    setModalOpen(true);
  };

  const handleEdit = (record: any) => {
    if (record.is_closed) return;
    setSelectedRecord(record);
    setModalOpen(true);
  };

  const handleClosePeriod = async (record: any) => {
    if (record.is_closed) return;
    if (window.confirm(`Are you sure you want to close period ${record.period_name}? This action cannot be undone.`)) {
      try {
        const res = await financeApi.closeAccountingPeriod(record.id);
        if (res.data.success) {
          toast.success(`Accounting period ${record.period_name} closed successfully`);
          fetchPeriods();
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to close accounting period");
      }
    }
  };

  const columns = [
    { 
      header: "Financial Year", 
      accessor: "financial_year",
      render: (val: any) => val?.year_name || "N/A"
    },
    { header: "Period Name", accessor: "period_name" },
    { header: "Start Date", accessor: "start_date" },
    { header: "End Date", accessor: "end_date" },
    { 
      header: "Status", 
      accessor: "status",
      render: (val: string) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          val === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
        }`}>
          {val}
        </span>
      )
    },
    { 
      header: "Closed", 
      accessor: "is_closed",
      render: (val: boolean) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          val ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
        }`}>
          {val ? "Closed" : "Open"}
        </span>
      )
    },
  ];

  return (
    <div className="py-5">
      <FinancePageHeader 
        title="Accounting Periods" 
        description="Manage accounting periods for financial years"
        action={
          <PermissionGuard permission="finance.accounting_period.create">
            <Button onClick={handleCreate} className="bg-brand-500 hover:bg-brand-600 text-white">
              <Plus className="mr-2 h-4 w-4" /> New Period
            </Button>
          </PermissionGuard>
        }
      />

      <div className="mb-4 w-64">
        <FinancialYearSelect
          value={financialYearId}
          onChange={setFinancialYearId}
          placeholder="Filter by Financial Year"
        />
      </div>

      <div className="bg-white dark:bg-navy-800 rounded-xl shadow-sm border border-gray-100 dark:border-navy-700">
        <DataTable
          columns={columns}
          data={data}
          loading={loading}
          total={total}
          page={page}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={setLimit}
          onSearch={setSearch}
          searchPlaceholder="Search periods..."
          actions={(record) => (
            <div className="flex space-x-2 justify-end">
              {!record.is_closed && (
                <PermissionGuard permission="finance.accounting_period.update">
                  <button 
                    onClick={() => handleEdit(record)}
                    className="text-brand-500 hover:text-brand-600 font-medium text-sm transition-colors"
                  >
                    Edit
                  </button>
                </PermissionGuard>
              )}
              {!record.is_closed && (
                <PermissionGuard permission="finance.accounting_period.close">
                  <button 
                    onClick={() => handleClosePeriod(record)}
                    className="text-red-500 hover:text-red-600 font-medium text-sm transition-colors"
                  >
                    Close Period
                  </button>
                </PermissionGuard>
              )}
            </div>
          )}
        />
      </div>

      <AccountingPeriodFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        record={selectedRecord}
        onSuccess={fetchPeriods}
      />
    </div>
  );
}
