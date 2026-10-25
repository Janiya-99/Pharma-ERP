import { useState, useEffect } from "react";
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
    { header: "Batch", accessorKey: "batch.batch_number", cell: ({ row }: { row?: any }) => row.original.batch?.batch_number || "-" },
    { header: "Expiry", accessorKey: "batch.expiry_date", cell: ({ row }: { row?: any }) => {
        if (!row.original.batch?.expiry_date) return "-";
        const isExpired = new Date(row.original.batch.expiry_date) < new Date();
        return <span className={isExpired ? "text-red-600 font-medium" : ""}>{new Date(row.original.batch.expiry_date).toLocaleDateString()}</span>;
    } },
    { header: "Warehouse", accessorKey: "warehouse.warehouse_name" },
    { header: "Holding Status", id: "stock_status", cell: ({ row }: { row?: any }) => {
        const batch = row.original.batch;
        const wh = row.original.warehouse;
        const isQuarantined = batch?.is_blocked || batch?.batch_status === "quarantined" || wh?.warehouse_type === "quarantine";
        const isExpired = batch?.expiry_date && new Date(batch.expiry_date) < new Date();
        if (isQuarantined) {
          return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
              Quarantine / On Hold
            </span>
          );
        }
        if (isExpired) {
          return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
              Expired
            </span>
          );
        }
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            Saleable
          </span>
        );
    } },
    { header: "Qty On Hand (Physical)", accessorKey: "quantity_on_hand", cell: ({ row }: { row?: any }) => <StockQuantityDisplay quantity={row.original.quantity_on_hand} /> },
    { header: "Qty Allocated", accessorKey: "quantity_allocated", cell: ({ row }: { row?: any }) => <StockQuantityDisplay quantity={row.original.quantity_allocated} /> },
    { header: "Qty Available (Saleable)", accessorKey: "quantity_available", cell: ({ row }: { row?: any }) => {
        const batch = row.original.batch;
        const wh = row.original.warehouse;
        const isQuarantined = batch?.is_blocked || batch?.batch_status === "quarantined" || wh?.warehouse_type === "quarantine";
        const saleableQty = isQuarantined ? 0 : Number(row.original.quantity_available || 0);
        return (
          <div className="flex flex-col items-end">
            <StockQuantityDisplay quantity={saleableQty} />
            {isQuarantined && (
              <span className="text-[10px] text-amber-700 font-semibold">(Non-Saleable Hold)</span>
            )}
          </div>
        );
    } },
    { header: "Avg Cost", accessorKey: "average_cost", cell: ({ row }: { row?: any }) => <StockValueDisplay value={row.original.average_cost} /> },
    { header: "Stock Value", accessorKey: "stock_value", cell: ({ row }: { row?: any }) => <StockValueDisplay value={row.original.stock_value} /> },
  ];

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-700 ">Stock Balances</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time inventory visibility across warehouses</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search..." value={search} onChange={(e: any) => setSearch(e.target.value)} className="pl-9 pr-4 py-2 border border-gray-200  rounded-xl text-sm focus:ring-2 focus:ring-brand-500 bg-white  text-gray-700 " />
          </div>
        </div>
      </div>
      <div className="bg-white  rounded-2xl shadow-sm border border-gray-100  overflow-hidden">
        <DataTable columns={columns} data={data} loading={loading} pagination={pagination} onPaginationChange={setPagination} pageCount={Math.ceil(totalRecords / pagination.pageSize)} />
      </div>
    </div>
  );
};
export default StockBalancesPage;
