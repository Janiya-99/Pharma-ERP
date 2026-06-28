import React, { useEffect, useState } from "react";
import { financeApi } from "api/financeApi";
import DataTable from "components/erp/DataTable";
import PermissionGuard from "components/erp/PermissionGuard";
import FinancePageHeader from "components/finance/FinancePageHeader";
import { Button } from "components/ui/button";
import { Plus } from "lucide-react";
import ChartOfAccountFormModal from "./ChartOfAccountFormModal";
import { toast } from "react-hot-toast";

export default function ChartOfAccountsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const res = await financeApi.getChartOfAccounts({
        page,
        limit,
        search,
      });
      if (res.data.success) {
        setData(res.data.data);
        setTotal(res.data.pagination.total);
      }
    } catch (err) {
      console.error("Failed to fetch accounts", err);
      toast.error("Failed to load chart of accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [page, limit, search]);

  const handleCreate = () => {
    setSelectedRecord(null);
    setModalOpen(true);
  };

  const handleEdit = (record: any) => {
    setSelectedRecord(record);
    setModalOpen(true);
  };

  const handleDelete = async (record: any) => {
    if (
      window.confirm(`Are you sure you want to delete ${record.account_name}?`)
    ) {
      try {
        const res = await financeApi.deleteChartOfAccount(record.id);
        if (res.data.success) {
          toast.success(`${record.account_name} deleted successfully`);
          fetchAccounts();
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to delete account");
      }
    }
  };

  const columns = [
    { header: "Account Code", accessor: "account_code" },
    { header: "Account Name", accessor: "account_name" },
    {
      header: "Classification",
      accessor: "classification",
      render: (val: any) => val?.name || "N/A",
    },
    {
      header: "Currency",
      accessor: "currency",
      render: (val: string) => <span className="font-mono text-sm">{val}</span>,
    },
    {
      header: "Status",
      accessor: "status",
      render: (val: string) => (
        <span
          className={`rounded-full px-2 py-1 text-xs font-semibold ${
            val === "active"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-800"
          }`}
        >
          {val}
        </span>
      ),
    },
  ];

  return (
    <div className="py-5">
      <FinancePageHeader
        title="Chart of Accounts"
        description="Manage your chart of accounts for financial tracking"
        action={
          <PermissionGuard permission="finance.chart_of_account.create">
            <Button
              onClick={handleCreate}
              className="bg-brand-500 text-white hover:bg-brand-600"
            >
              <Plus className="mr-2 h-4 w-4" /> New Account
            </Button>
          </PermissionGuard>
        }
      />

      <div className="rounded-xl border border-gray-100 bg-white shadow-sm dark:border-navy-700 dark:bg-navy-800">
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
          searchPlaceholder="Search accounts by code or name..."
          actions={(record: unknown) => (
            <div className="flex justify-end space-x-2">
              <PermissionGuard permission="finance.chart_of_account.update">
                <button
                  onClick={() => handleEdit(record)}
                  className="text-sm font-medium text-brand-500 transition-colors hover:text-brand-600"
                >
                  Edit
                </button>
              </PermissionGuard>
              <PermissionGuard permission="finance.chart_of_account.delete">
                <button
                  onClick={() => handleDelete(record)}
                  className="text-sm font-medium text-red-500 transition-colors hover:text-red-600"
                >
                  Delete
                </button>
              </PermissionGuard>
            </div>
          )}
        />
      </div>

      <ChartOfAccountFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        record={selectedRecord}
        onSuccess={fetchAccounts}
      />
    </div>
  );
}
