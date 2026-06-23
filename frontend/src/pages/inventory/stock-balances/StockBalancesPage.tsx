import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { toast } from "react-hot-toast";
import DataTable from "../../../components/common/DataTable";
import { inventoryApi } from "../../../api/inventoryApi";
import StockQuantityDisplay from "../../../components/inventory/StockQuantityDisplay";
import StockValueDisplay from "../../../components/inventory/StockValueDisplay";

const StockBalancesPage = () => {
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
      const response = await inventoryApi.getStockBalances({
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
        search,
      });
      if (response.data?.success) {
        setData(response.data.data);
        setTotalRecords(response.data.pagination.total);
      }
    } catch (error) {
      toast.error("Failed to load stock balances");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { header: "Product Code", accessorKey: "product.product_code" },
    { header: "Product Name", accessorKey: "product.product_name" },
    { header: "Batch", accessorKey: "batch.batch_number", cell: ({ row }: { row?: unknown }) => row.original.batch?.batch_number || "-" },
    { header: "Expiry", accessorKey: "batch.expiry_date", cell: ({ row }: { row?: unknown }) => {
        if (!row.original.batch?.expiry_date) return "-";
        const isExpired = new Date(row.original.batch.expiry_date) < new Date();
        return <span className={isExpired ? "text-red-600 font-medium" : ""}>{new Date(row.original.batch.expiry_date).toLocaleDateString()}</span>;
    } },
    { header: "Warehouse", accessorKey: "warehouse.warehouse_name" },
    { header: "Location", accessorKey: "location.location_name", cell: ({ row }: { row?: unknown }) => row.original.location?.location_name || "-" },
    { header: "Qty On Hand", accessorKey: "quantity_on_hand", cell: ({ row }: { row?: unknown }) => <StockQuantityDisplay quantity={row.original.quantity_on_hand} /> },
    { header: "Qty Allocated", accessorKey: "quantity_allocated", cell: ({ row }: { row?: unknown }) => <StockQuantityDisplay quantity={row.original.quantity_allocated} /> },
    { header: "Qty Available", accessorKey: "quantity_available", cell: ({ row }: { row?: unknown }) => <StockQuantityDisplay quantity={row.original.quantity_available} /> },
    { header: "Avg Cost", accessorKey: "average_cost", cell: ({ row }: { row?: unknown }) => <StockValueDisplay value={row.original.average_cost} /> },
    { header: "Stock Value", accessorKey: "stock_value", cell: ({ row }: { row?: unknown }) => <StockValueDisplay value={row.original.stock_value} /> },
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-700 dark:text-white">Stock Balances</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time inventory visibility across warehouses</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search..." value={search} onChange={(e: any) => setSearch(e.target.value)} className="pl-9 pr-4 py-2 border border-gray-200 dark:border-navy-600 rounded-xl text-sm focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-700 text-gray-700 dark:text-white" />
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-navy-800 rounded-2xl shadow-sm border border-gray-100 dark:border-navy-700 overflow-hidden">
        <DataTable columns={columns} data={data} loading={loading} pagination={pagination} onPaginationChange={setPagination} pageCount={Math.ceil(totalRecords / pagination.pageSize)} />
      </div>
    </div>
  );
};
export default StockBalancesPage;
