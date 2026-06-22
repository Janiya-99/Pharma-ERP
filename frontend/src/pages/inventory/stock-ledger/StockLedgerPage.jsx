import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { toast } from "react-hot-toast";
import DataTable from "../../../components/common/DataTable";
import { inventoryApi } from "../../../api/inventoryApi";
import StockQuantityDisplay from "../../../components/inventory/StockQuantityDisplay";
import StockValueDisplay from "../../../components/inventory/StockValueDisplay";

const StockLedgerPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [totalRecords, setTotalRecords] = useState(0);

  useEffect(() => {
    fetchData();
  }, [pagination.pageIndex, pagination.pageSize, search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await inventoryApi.getStockLedgerEntries({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search,
      });
      if (response.data?.success) {
        setData(response.data.data);
        setTotalRecords(response.data.pagination.total);
      }
    } catch (error) {
      toast.error("Failed to load stock ledger");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: "Date", accessorKey: "transaction_date", cell: ({ row }) => new Date(row.original.transaction_date).toLocaleString() },
    { header: "Source", accessorKey: "source_type", cell: ({ row }) => <span className="uppercase text-xs font-semibold">{row.original.source_type}</span> },
    { header: "Source No", accessorKey: "source_id" },
    { header: "Product", accessorKey: "product.product_name" },
    { header: "Batch", accessorKey: "batch.batch_number", cell: ({ row }) => row.original.batch?.batch_number || "-" },
    { header: "Warehouse", accessorKey: "warehouse.warehouse_name" },
    { header: "Qty In", accessorKey: "quantity_in", cell: ({ row }) => row.original.quantity_in > 0 ? <StockQuantityDisplay quantity={row.original.quantity_in} /> : "-" },
    { header: "Qty Out", accessorKey: "quantity_out", cell: ({ row }) => row.original.quantity_out > 0 ? <StockQuantityDisplay quantity={row.original.quantity_out} /> : "-" },
    { header: "Balance Qty", accessorKey: "balance_quantity", cell: ({ row }) => <StockQuantityDisplay quantity={row.original.balance_quantity} /> },
    { header: "Unit Cost", accessorKey: "unit_cost", cell: ({ row }) => <StockValueDisplay value={row.original.unit_cost} /> },
    { header: "Total Cost", accessorKey: "total_cost", cell: ({ row }) => <StockValueDisplay value={row.original.total_cost} /> },
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-700 dark:text-white">Stock Ledger</h1>
          <p className="text-sm text-gray-500 mt-1">Detailed inventory movement history</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 pr-4 py-2 border border-gray-200 dark:border-navy-600 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-700 text-gray-700 dark:text-white" />
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-100 dark:border-navy-700 overflow-hidden">
        <DataTable columns={columns} data={data} loading={loading} pagination={pagination} onPaginationChange={setPagination} pageCount={Math.ceil(totalRecords / pagination.pageSize)} />
      </div>
    </div>
  );
};
export default StockLedgerPage;
