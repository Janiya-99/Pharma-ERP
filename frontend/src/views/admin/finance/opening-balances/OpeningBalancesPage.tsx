import React, { useEffect, useState } from "react";
import { financeApi } from "api/financeApi";
import DataTable from "components/erp/DataTable";
import PermissionGuard from "components/erp/PermissionGuard";
import FinancePageHeader from "components/finance/FinancePageHeader";
import FinancialYearSelect from "components/finance/FinancialYearSelect";
import MoneyDisplay from "components/finance/MoneyDisplay";
import { Button } from "components/ui/button";
import { Plus } from "lucide-react";
import OpeningBalanceFormModal from "./OpeningBalanceFormModal";
import { toast } from "react-hot-toast";

export default function OpeningBalancesPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [financialYearId, setFinancialYearId] = useState("");
  
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fetchBalances = async () => {
    setLoading(true);
    try {
      const res = await financeApi.getOpeningBalances({
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
      console.error("Failed to fetch opening balances", err);
      toast.error("Failed to load opening balances");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, [page, limit, search, financialYearId]);

  const handleCreate = () => {
    setSelectedRecord(null);
    setModalOpen(true);
  };

  const handleEdit = (record: any) => {
    setSelectedRecord(record);
    setModalOpen(true);
  };

  const handleDelete = async (record: any) => {
    if (window.confirm(`Are you sure you want to delete this opening balance?`)) {
      try {
        const res = await financeApi.deleteOpeningBalance(record.id);
        if (res.data.success) {
          toast.success(`Opening balance deleted successfully`);
          fetchBalances();
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to delete opening balance");
      }
    }
  };

  const columns = [
    { 
      header: "Financial Year", 
      accessor: "financial_year",
      render: (val: any) => val?.year_name || "N/A"
    },
    { 
      header: "Account", 
      accessor: "account",
      render: (val: any) => val ? `${val.account_code} - ${val.account_name}` : "N/A"
    },
    { 
      header: "Debit Balance", 
      accessor: "debit_balance",
      render: (val: string, row: any) => (
        <MoneyDisplay amount={val} currency={row.base_currency} className={parseFloat(val) > 0 ? "text-red-500" : ""} />
      )
    },
    { 
      header: "Credit Balance", 
      accessor: "credit_balance",
      render: (val: string, row: any) => (
        <MoneyDisplay amount={val} currency={row.base_currency} className={parseFloat(val) > 0 ? "text-green-500" : ""} />
      )
    },
    { header: "Currency", accessor: "base_currency" },
  ];

  return (
    <div className="py-5">
      <FinancePageHeader 
        title="Opening Balances" 
        description="Manage initial account balances for financial years"
        action={
          <PermissionGuard permission="finance.opening_balance.create">
            <Button onClick={handleCreate} className="bg-brand-500 hover:bg-brand-600 text-white">
              <Plus className="mr-2 h-4 w-4" /> Add Balance
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
          searchPlaceholder="Search balances..."
          actions={(record) => (
            <div className="flex space-x-2 justify-end">
              <PermissionGuard permission="finance.opening_balance.update">
                <button 
                  onClick={() => handleEdit(record)}
                  className="text-brand-500 hover:text-brand-600 font-medium text-sm transition-colors"
                >
                  Edit
                </button>
              </PermissionGuard>
              <PermissionGuard permission="finance.opening_balance.delete">
                <button 
                  onClick={() => handleDelete(record)}
                  className="text-red-500 hover:text-red-600 font-medium text-sm transition-colors"
                >
                  Delete
                </button>
              </PermissionGuard>
            </div>
          )}
        />
      </div>

      <OpeningBalanceFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        record={selectedRecord}
        onSuccess={fetchBalances}
      />
    </div>
  );
}
