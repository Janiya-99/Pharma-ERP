import React, { useEffect, useState } from "react";
import { Plus, Trash2, Copy, AlertCircle } from "lucide-react";
import StockTransferLineProductSelect from "../../../components/inventory/StockTransferLineProductSelect";
import StockTransferLineBatchSelect from "../../../components/inventory/StockTransferLineBatchSelect";
import TransferQuantityInput from "../../../components/inventory/TransferQuantityInput";
import AvailableStockCard from "../../../components/inventory/AvailableStockCard";
import { inventoryApi } from "../../../api/inventoryApi";
import { StockTransferLine, WarehouseLocation } from "../../../types/inventory";

interface StockTransferLinesTableProps {
  lines: StockTransferLine[];
  setLines: (lines: StockTransferLine[]) => void;
  sourceWarehouseId: string | number | null;
  destinationWarehouseId: string | number | null;
  errors?: Record<string, string>;
}

const StockTransferLinesTable = ({ lines, setLines, sourceWarehouseId, destinationWarehouseId, errors = {} }: StockTransferLinesTableProps) => {
  const [sourceLocations, setSourceLocations] = useState<WarehouseLocation[]>([]);
  const [destinationLocations, setDestinationLocations] = useState<WarehouseLocation[]>([]);

  useEffect(() => {
    if (sourceWarehouseId) {
      fetchSourceLocations(sourceWarehouseId);
    } else {
      setSourceLocations([]);
      setLines(lines.map((line) => ({ ...line, source_location_id: "" })));
    }
  }, [sourceWarehouseId]);

  useEffect(() => {
    if (destinationWarehouseId) {
      fetchDestinationLocations(destinationWarehouseId);
    } else {
      setDestinationLocations([]);
      setLines(lines.map((line) => ({ ...line, destination_location_id: "" })));
    }
  }, [destinationWarehouseId]);

  const fetchSourceLocations = async (wId: string | number) => {
    try {
      const res = await inventoryApi.getWarehouseLocations({ warehouse_id: wId, limit: 1000, status: "active" });
      if (res.success !== false) {
        setSourceLocations(res.data?.data || res.data || []);
      }
    } catch (err) {}
  };

  const fetchDestinationLocations = async (wId: string | number) => {
    try {
      const res = await inventoryApi.getWarehouseLocations({ warehouse_id: wId, limit: 1000, status: "active" });
      if (res.success !== false) {
        setDestinationLocations(res.data?.data || res.data || []);
      }
    } catch (err) {}
  };

  const handleAddLine = () => {
    setLines([
      ...lines,
      {
        id: `temp-${Date.now()}`,
        product_id: null,
        product: null,
        product_batch_id: null,
        batch: null,
        source_location_id: "",
        destination_location_id: "",
        transfer_quantity: 0,
        available_quantity: null,
        stock_balance_loading: false,
        stock_balance_data: null,
      },
    ]);
  };

  const handleRemoveLine = (index: number) => {
    setLines(lines.filter((_, i) => i !== index));
  };

  const fetchAvailableStock = async (index: number, productId: string | number | null, batchId: string | number | null, locationId: string | number) => {
    if (!productId || !locationId) {
      handleLineChange(index, "available_quantity", null);
      handleLineChange(index, "stock_balance_data", null);
      return;
    }

    try {
      handleLineChange(index, "stock_balance_loading", true);
      const params = {
        warehouse_id: sourceWarehouseId,
        warehouse_location_id: locationId,
        product_id: productId,
        product_batch_id: batchId || "",
        limit: 1
      };
      const res = await inventoryApi.getStockBalances(params);
      if (res.success !== false && res.data?.data?.length > 0) {
        const stock = res.data.data[0];
        handleLineChange(index, "available_quantity", stock.quantity_available);
        handleLineChange(index, "stock_balance_data", stock);
      } else {
        handleLineChange(index, "available_quantity", 0);
        handleLineChange(index, "stock_balance_data", { quantity_on_hand: 0, quantity_available: 0, average_cost: 0 });
      }
    } catch (err) {
      console.error("Failed to fetch stock", err);
      handleLineChange(index, "available_quantity", 0);
    } finally {
      handleLineChange(index, "stock_balance_loading", false);
    }
  };

  const handleLineChange = (index: number, field: keyof StockTransferLine, value: any, extraData: any = {}) => {
    const newLines = [...lines];
    newLines[index][field] = value;

    if (field === "product_id") {
      newLines[index].product = extraData.product;
      newLines[index].product_batch_id = null;
      newLines[index].batch = null;
      
      // refetch stock if location is set
      fetchAvailableStock(index, value as number, null, newLines[index].source_location_id);
    }

    if (field === "product_batch_id") {
      newLines[index].batch = extraData.batch;
      // refetch stock
      fetchAvailableStock(index, newLines[index].product_id, value as number, newLines[index].source_location_id);
    }

    if (field === "source_location_id") {
      // refetch stock
      fetchAvailableStock(index, newLines[index].product_id, newLines[index].product_batch_id, value);
    }

    setLines(newLines);
  };

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Transfer Line Items</h3>
        <button
          type="button"
          onClick={handleAddLine}
          className="flex items-center gap-2 px-3 py-1.5 bg-brand-50 text-brand-600 rounded-lg hover:bg-brand-100 dark:bg-brand-900/30 dark:text-brand-400 dark:hover:bg-brand-900/50 transition-colors text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          Add Line
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-navy-700 pb-12">
        <table className="w-full text-sm text-left whitespace-nowrap min-w-[1400px]">
          <thead className="bg-gray-50 dark:bg-navy-800/50 text-gray-600 dark:text-gray-300 font-medium border-b border-gray-200 dark:border-navy-700">
            <tr>
              <th className="px-4 py-3 min-w-[250px]">Product & Batch *</th>
              <th className="px-4 py-3 min-w-[200px]">Source Location *</th>
              <th className="px-4 py-3 min-w-[200px]">Dest. Location *</th>
              <th className="px-4 py-3 min-w-[280px]">Available Stock</th>
              <th className="px-4 py-3 min-w-[150px]">Transfer Qty *</th>
              <th className="px-4 py-3 min-w-[80px] text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-navy-700">
            {lines.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  No lines added. Click "Add Line" to begin.
                </td>
              </tr>
            ) : (
              lines.map((line, index) => {
                const lineErrors: any = errors[`lines.${index}`] || {};
                
                return (
                  <tr key={line.id || index} className="hover:bg-gray-50 dark:hover:bg-navy-800/50">
                    <td className="px-4 py-3 align-top space-y-3">
                      <StockTransferLineProductSelect
                        value={line.product_id}
                        onChange={(val: any, product: any) => handleLineChange(index, "product_id", val, { product })}
                        error={lineErrors.product_id}
                      />
                      <StockTransferLineBatchSelect
                        productId={line.product_id}
                        value={line.product_batch_id}
                        onChange={(val: any, batch: any) => handleLineChange(index, "product_batch_id", val, { batch })}
                        error={lineErrors.product_batch_id}
                        isDisabled={!line.product || !line.product.requires_batch_tracking}
                      />
                    </td>

                    <td className="px-4 py-3 align-top">
                      <select
                        value={line.source_location_id || ""}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleLineChange(index, "source_location_id", e.target.value ? parseInt(e.target.value) : "")}
                        className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-900 text-gray-900 dark:text-white ${lineErrors.source_location_id ? "border-red-500" : "border-gray-200 dark:border-navy-600"}`}
                      >
                        <option value="">-- Select Source Location --</option>
                        {sourceLocations.map((loc) => (
                          <option key={loc.id} value={loc.id}>{loc.location_name}</option>
                        ))}
                      </select>
                      {lineErrors.source_location_id && <p className="text-[10px] text-red-500 mt-1">{lineErrors.source_location_id}</p>}
                    </td>

                    <td className="px-4 py-3 align-top">
                      <select
                        value={line.destination_location_id || ""}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleLineChange(index, "destination_location_id", e.target.value ? parseInt(e.target.value) : "")}
                        className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-900 text-gray-900 dark:text-white ${lineErrors.destination_location_id ? "border-red-500" : "border-gray-200 dark:border-navy-600"}`}
                      >
                        <option value="">-- Select Dest. Location --</option>
                        {destinationLocations.map((loc) => (
                          <option key={loc.id} value={loc.id}>{loc.location_name}</option>
                        ))}
                      </select>
                      {lineErrors.destination_location_id && <p className="text-[10px] text-red-500 mt-1">{lineErrors.destination_location_id}</p>}
                    </td>

                    <td className="px-4 py-3 align-top">
                      <AvailableStockCard 
                        stockBalance={line.stock_balance_data} 
                        loading={line.stock_balance_loading} 
                      />
                    </td>

                    <td className="px-4 py-3 align-top">
                      <TransferQuantityInput
                        value={line.transfer_quantity}
                        onChange={(val: any) => handleLineChange(index, "transfer_quantity", val)}
                        availableQuantity={line.available_quantity}
                        error={lineErrors.transfer_quantity}
                      />
                    </td>

                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-col items-center justify-center gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(index)}
                          className="p-1.5 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Remove Line"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {errors.lines && <p className="text-sm text-red-500 mt-2 font-medium">{errors.lines}</p>}
    </div>
  );
};

export default StockTransferLinesTable;
