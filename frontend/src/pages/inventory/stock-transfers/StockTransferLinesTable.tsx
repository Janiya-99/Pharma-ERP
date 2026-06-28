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

const StockTransferLinesTable = ({
  lines,
  setLines,
  sourceWarehouseId,
  destinationWarehouseId,
  errors = {},
}: StockTransferLinesTableProps) => {
  const [sourceLocations, setSourceLocations] = useState<WarehouseLocation[]>(
    []
  );
  const [destinationLocations, setDestinationLocations] = useState<
    WarehouseLocation[]
  >([]);

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
      const res = await inventoryApi.getWarehouseLocations({
        warehouse_id: wId,
        limit: 1000,
        status: "active",
      });
      if (res.success !== false) {
        setSourceLocations(
          Array.isArray(res.data?.data)
            ? res.data.data
            : Array.isArray(res.data)
            ? res.data
            : []
        );
      }
    } catch (err) {}
  };

  const fetchDestinationLocations = async (wId: string | number) => {
    try {
      const res = await inventoryApi.getWarehouseLocations({
        warehouse_id: wId,
        limit: 1000,
        status: "active",
      });
      if (res.success !== false) {
        setDestinationLocations(
          Array.isArray(res.data?.data)
            ? res.data.data
            : Array.isArray(res.data)
            ? res.data
            : []
        );
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

  const fetchAvailableStock = async (
    index: number,
    productId: string | number | null,
    batchId: string | number | null,
    locationId: string | number
  ) => {
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
        limit: 1,
      };
      const res = await inventoryApi.getStockBalances(params);
      if (res.success !== false && res.data?.data?.length > 0) {
        const stock = res.data.data[0];
        handleLineChange(index, "available_quantity", stock.quantity_available);
        handleLineChange(index, "stock_balance_data", stock);
      } else {
        handleLineChange(index, "available_quantity", 0);
        handleLineChange(index, "stock_balance_data", {
          quantity_on_hand: 0,
          quantity_available: 0,
          average_cost: 0,
        });
      }
    } catch (err) {
      console.error("Failed to fetch stock", err);
      handleLineChange(index, "available_quantity", 0);
    } finally {
      handleLineChange(index, "stock_balance_loading", false);
    }
  };

  const handleLineChange = (
    index: number,
    field: keyof StockTransferLine,
    value: any,
    extraData: any = {}
  ) => {
    const newLines = [...lines];
    newLines[index][field] = value;

    if (field === "product_id") {
      newLines[index].product = extraData.product;
      newLines[index].product_batch_id = null;
      newLines[index].batch = null;

      // refetch stock if location is set
      fetchAvailableStock(
        index,
        value as number,
        null,
        newLines[index].source_location_id
      );
    }

    if (field === "product_batch_id") {
      newLines[index].batch = extraData.batch;
      // refetch stock
      fetchAvailableStock(
        index,
        newLines[index].product_id,
        value as number,
        newLines[index].source_location_id
      );
    }

    if (field === "source_location_id") {
      // refetch stock
      fetchAvailableStock(
        index,
        newLines[index].product_id,
        newLines[index].product_batch_id,
        value
      );
    }

    setLines(newLines);
  };

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Transfer Line Items
        </h3>
        <button
          type="button"
          onClick={handleAddLine}
          className="flex items-center gap-2 rounded-lg bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-600 transition-colors hover:bg-brand-100 dark:bg-brand-900/30 dark:text-brand-400 dark:hover:bg-brand-900/50"
        >
          <Plus className="h-4 w-4" />
          Add Line
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 pb-12 dark:border-navy-700">
        <table className="w-full min-w-[1400px] whitespace-nowrap text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 font-medium text-gray-600 dark:border-navy-700 dark:bg-navy-800/50 dark:text-gray-300">
            <tr>
              <th className="min-w-[250px] px-4 py-3">Product & Batch *</th>
              <th className="min-w-[200px] px-4 py-3">Source Location *</th>
              <th className="min-w-[200px] px-4 py-3">Dest. Location *</th>
              <th className="min-w-[280px] px-4 py-3">Available Stock</th>
              <th className="min-w-[150px] px-4 py-3">Transfer Qty *</th>
              <th className="min-w-[80px] px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-navy-700">
            {lines.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  No lines added. Click "Add Line" to begin.
                </td>
              </tr>
            ) : (
              lines.map((line, index) => {
                const lineErrors: any = errors[`lines.${index}`] || {};

                return (
                  <tr
                    key={line.id || index}
                    className="hover:bg-gray-50 dark:hover:bg-navy-800/50"
                  >
                    <td className="space-y-3 px-4 py-3 align-top">
                      <StockTransferLineProductSelect
                        value={line.product_id}
                        onChange={(val: any, product: any) =>
                          handleLineChange(index, "product_id", val, {
                            product,
                          })
                        }
                        error={lineErrors.product_id}
                      />
                      <StockTransferLineBatchSelect
                        productId={line.product_id}
                        value={line.product_batch_id}
                        onChange={(val: any, batch: any) =>
                          handleLineChange(index, "product_batch_id", val, {
                            batch,
                          })
                        }
                        error={lineErrors.product_batch_id}
                        isDisabled={
                          !line.product || !line.product.requires_batch_tracking
                        }
                      />
                    </td>

                    <td className="px-4 py-3 align-top">
                      <select
                        value={line.source_location_id || ""}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                          handleLineChange(
                            index,
                            "source_location_id",
                            e.target.value ? parseInt(e.target.value) : ""
                          )
                        }
                        className={`w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-brand-500 dark:bg-navy-900 dark:text-white ${
                          lineErrors.source_location_id
                            ? "border-red-500"
                            : "border-gray-200 dark:border-navy-600"
                        }`}
                      >
                        <option value="">-- Select Source Location --</option>
                        {sourceLocations.map((loc) => (
                          <option key={loc.id} value={loc.id}>
                            {loc.location_name}
                          </option>
                        ))}
                      </select>
                      {lineErrors.source_location_id && (
                        <p className="mt-1 text-[10px] text-red-500">
                          {lineErrors.source_location_id}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-3 align-top">
                      <select
                        value={line.destination_location_id || ""}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                          handleLineChange(
                            index,
                            "destination_location_id",
                            e.target.value ? parseInt(e.target.value) : ""
                          )
                        }
                        className={`w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-brand-500 dark:bg-navy-900 dark:text-white ${
                          lineErrors.destination_location_id
                            ? "border-red-500"
                            : "border-gray-200 dark:border-navy-600"
                        }`}
                      >
                        <option value="">-- Select Dest. Location --</option>
                        {destinationLocations.map((loc) => (
                          <option key={loc.id} value={loc.id}>
                            {loc.location_name}
                          </option>
                        ))}
                      </select>
                      {lineErrors.destination_location_id && (
                        <p className="mt-1 text-[10px] text-red-500">
                          {lineErrors.destination_location_id}
                        </p>
                      )}
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
                        onChange={(val: any) =>
                          handleLineChange(index, "transfer_quantity", val)
                        }
                        availableQuantity={line.available_quantity}
                        error={lineErrors.transfer_quantity}
                      />
                    </td>

                    <td className="px-4 py-3 align-top">
                      <div className="mt-2 flex flex-col items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(index)}
                          className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20"
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
      {errors.lines && (
        <p className="mt-2 text-sm font-medium text-red-500">{errors.lines}</p>
      )}
    </div>
  );
};

export default StockTransferLinesTable;
