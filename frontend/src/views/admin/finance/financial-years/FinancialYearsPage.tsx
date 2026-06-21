import React, { useEffect, useState } from "react";
import { financeApi } from "api/financeApi";
import DataTable from "components/erp/DataTable";
import PermissionGuard from "components/erp/PermissionGuard";
import FinancePageHeader from "components/finance/FinancePageHeader";
import { Button } from "components/ui/button";
import { Plus } from "lucide-react";
import FinancialYearFormModal from "./FinancialYearFormModal";
import { toast } from "react-hot-toast";

export default function FinancialYearsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const fetchFinancialYears = async () => {
    setLoading(true);
    try {
      const res = await financeApi.getFinancialYears({
        page,
        limit,
        search,
      });
      if (res.data.success) {
        setData(res.data.data);
        setTotal(res.data.pagination.total);
      }
    } catch (err) {
      console.error("Failed to fetch financial years", err);
      toast.error("Failed to load financial years");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancialYears();
  }, [page, limit, search]);

  const handleCreate = () => {
    setSelectedRecord(null);
    setModalOpen(true);
  };

  const handleEdit = (record: any) => {
    if (record.is_closed) return;
    setSelectedRecord(record);
    setModalOpen(true);
  };

  const handleCloseYear = async (record: any) => {
    if (record.is_closed) return;
    if (window.confirm(`Are you sure you want to close financial year ${record.year_name}? This action cannot be undone.`)) {
      try {
        const res = await financeApi.closeFinancialYear(record.id);
        if (res.data.success) {
          toast.success(`Financial year ${record.year_name} closed successfully`);
          fetchFinancialYears();
        }
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Failed to close financial year");
      }
    }
  };

  const columns = [
    { header: "Year Name", accessor: "year_name" },
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
      header: "Active", 
      accessor: "is_active",
      render: (val: boolean) => (
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          val ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
        }`}>
          {val ? "Yes" : "No"}
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
        title="Financial Years" 
        description="Manage financial years and accounting periods"
        action={
          <PermissionGuard permission="finance.financial_year.create">
            <Button onClick={handleCreate} className="bg-brand-500 hover:bg-brand-600 text-white">
              <Plus className="mr-2 h-4 w-4" /> New Financial Year
            </Button>
          </PermissionGuard>
        }
      />

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
          searchPlaceholder="Search financial years..."
          actions={(record) => (
            <div className="flex space-x-2 justify-end">
              {!record.is_closed && (
                <PermissionGuard permission="finance.financial_year.update">
                  <button 
                    onClick={() => handleEdit(record)}
                    className="text-brand-500 hover:text-brand-600 font-medium text-sm transition-colors"
                  >
                    Edit
                  </button>
                </PermissionGuard>
              )}
              {!record.is_closed && (
                <PermissionGuard permission="finance.financial_year.close">
                  <button 
                    onClick={() => handleCloseYear(record)}
                    className="text-red-500 hover:text-red-600 font-medium text-sm transition-colors"
                  >
                    Close Year
                  </button>
                </PermissionGuard>
              )}
            </div>
          )}
        />
      </div>

      <FinancialYearFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        record={selectedRecord}
        onSuccess={fetchFinancialYears}
      />
    </div>
  );
}
