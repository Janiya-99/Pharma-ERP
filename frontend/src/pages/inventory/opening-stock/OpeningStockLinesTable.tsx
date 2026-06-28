import React, { useEffect, useState } from "react";
import { Plus, Trash2, Copy, AlertCircle } from "lucide-react";
import OpeningStockLineProductSelect from "../../../components/inventory/OpeningStockLineProductSelect";
import OpeningStockLineBatchSelect from "../../../components/inventory/OpeningStockLineBatchSelect";
import { inventoryApi } from "api/inventoryApi";

const OpeningStockLinesTable = ({
  lines,
  setLines,
  warehouseId,
  errors = {},
}: {
  lines?: any;
  setLines?: any;
  warehouseId?: string | number;
  errors?: any;
}) => {
  const [locations, setLocations] = useState<any[]>([]);

  useEffect(() => {
    if (warehouseId) {
      fetchWarehouseLocations(warehouseId);
    } else {
      setLocations([]);
      // Clear locations from all lines if warehouse changes to empty
      setLines(
        lines.map((line: any) => ({ ...line, warehouse_location_id: "" }))
      );
    }
  }, [warehouseId]);

  const fetchWarehouseLocations = async (wId: string | number) => {
    try {
      const res = await inventoryApi.getWarehouseLocations({
        warehouse_id: wId,
        limit: 1000,
        status: "active",
      });
      if ((res as any).success !== false) {
        setLocations((res as any).data?.data || (res as any).data || []);
      }
    } catch (err) {
      console.error("Failed to fetch locations", err);
    }
  };

  const handleAddLine = () => {
    setLines([
      ...lines,
      {
        id: `temp-${Date.now()}`,
        warehouse_location_id: "",
        product_id: null,
        product: null,
        product_batch_id: null,
        batch: null,
        quantity: 0,
        unit_cost: 0,
        total_cost: 0,
        line_remarks: "",
      },
    ]);
  };

  const handleRemoveLine = (index: number) => {
    setLines(lines.filter((_: any, i: number) => i !== index));
  };

  const handleDuplicateLine = (index: number) => {
    const lineToCopy = lines[index];
    setLines([
      ...lines.slice(0, index + 1),
      {
        ...lineToCopy,
        id: `temp-${Date.now()}`,
      },
      ...lines.slice(index + 1),
    ]);
  };

  const handleLineChange = (
    index: number,
    field: string,
    value: any,
    extraData: any = {}
  ) => {
    const newLines = [...lines];
    newLines[index][field] = value;

    if (field === "product_id") {
      newLines[index].product = extraData.product;
      // Reset batch if product changes
      newLines[index].product_batch_id = null;
      newLines[index].batch = null;
    }

    if (field === "product_batch_id") {
      newLines[index].batch = extraData.batch;
      // Auto fill unit cost from batch purchase rate if available
      if (extraData.batch && extraData.batch.purchase_rate) {
        newLines[index].unit_cost = parseFloat(extraData.batch.purchase_rate);
      }
    }

    // Calculate total cost
    if (
      field === "quantity" ||
      field === "unit_cost" ||
      field === "product_batch_id"
    ) {
      const qty = parseFloat(newLines[index].quantity) || 0;
      const cost = parseFloat(newLines[index].unit_cost) || 0;
      newLines[index].total_cost = qty * cost;
    }

    setLines(newLines);
  };

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Line Items
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

      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-navy-700">
        <table className="w-full whitespace-nowrap text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 font-medium text-gray-600 dark:border-navy-700 dark:bg-navy-800/50 dark:text-gray-300">
            <tr>
              <th className="min-w-[200px] px-4 py-3">Product *</th>
              <th className="min-w-[200px] px-4 py-3">Batch *</th>
              <th className="min-w-[150px] px-4 py-3">Location</th>
              <th className="min-w-[120px] px-4 py-3 text-right">Qty *</th>
              <th className="min-w-[120px] px-4 py-3 text-right">
                Unit Cost *
              </th>
              <th className="min-w-[120px] px-4 py-3 text-right">Total Cost</th>
              <th className="min-w-[150px] px-4 py-3">Remarks</th>
              <th className="min-w-[80px] px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-navy-700">
            {lines.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  No lines added. Click "Add Line" to begin.
                </td>
              </tr>
            ) : (
              lines.map((line: any, index: number) => {
                const lineErrors = errors[`lines.${index}`] || {};

                return (
                  <tr
                    key={line.id || index}
                    className="hover:bg-gray-50 dark:hover:bg-navy-800/50"
                  >
                    <td className="px-4 py-3 align-top">
                      <OpeningStockLineProductSelect
                        value={line.product_id}
                        onChange={(val: any, product: any) =>
                          handleLineChange(index, "product_id", val, {
                            product,
                          })
                        }
                        error={lineErrors.product_id}
                      />
                      {line.product && (
                        <div className="mt-1 flex flex-col gap-0.5 text-xs text-gray-500 dark:text-gray-400">
                          {line.product.requires_batch_tracking ? (
                            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                              <AlertCircle className="h-3 w-3" /> Batch Req
                            </span>
                          ) : (
                            <span>No Batch Req</span>
                          )}
                          <span>
                            Base Unit:{" "}
                            {line.product.base_unit?.unit_name || "N/A"}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <OpeningStockLineBatchSelect
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
                        value={line.warehouse_location_id || ""}
                        onChange={(e: any) =>
                          handleLineChange(
                            index,
                            "warehouse_location_id",
                            e.target.value ? parseInt(e.target.value) : null
                          )
                        }
                        className={`w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-brand-500 dark:bg-navy-900 dark:text-white ${
                          lineErrors.warehouse_location_id
                            ? "border-red-500"
                            : "border-gray-200 dark:border-navy-600"
                        }`}
                      >
                        <option value="">-- Optional --</option>
                        {locations.map((loc: any) => (
                          <option key={loc.id} value={loc.id}>
                            {loc.location_name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <input
                        type="number"
                        min="0.001"
                        step="0.001"
                        value={line.quantity === 0 ? "" : line.quantity}
                        onChange={(e: any) =>
                          handleLineChange(index, "quantity", e.target.value)
                        }
                        className={`w-full rounded-md border bg-white px-3 py-2 text-right text-sm text-gray-900 focus:ring-2 focus:ring-brand-500 dark:bg-navy-900 dark:text-white ${
                          lineErrors.quantity
                            ? "border-red-500"
                            : "border-gray-200 dark:border-navy-600"
                        }`}
                      />
                      {lineErrors.quantity && (
                        <p className="mt-1 text-xs text-red-500">
                          {lineErrors.quantity}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.unit_cost === 0 ? "" : line.unit_cost}
                        onChange={(e: any) =>
                          handleLineChange(index, "unit_cost", e.target.value)
                        }
                        className={`w-full rounded-md border bg-white px-3 py-2 text-right text-sm text-gray-900 focus:ring-2 focus:ring-brand-500 dark:bg-navy-900 dark:text-white ${
                          lineErrors.unit_cost
                            ? "border-red-500"
                            : "border-gray-200 dark:border-navy-600"
                        }`}
                      />
                      {lineErrors.unit_cost && (
                        <p className="mt-1 text-xs text-red-500">
                          {lineErrors.unit_cost}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <input
                        type="text"
                        disabled
                        value={line.total_cost?.toFixed(2) || "0.00"}
                        className="w-full rounded-md border border-gray-100 bg-gray-50 px-3 py-2 text-right text-sm font-medium text-gray-600 dark:border-navy-700 dark:bg-navy-800 dark:text-gray-400"
                      />
                    </td>
                    <td className="px-4 py-3 align-top">
                      <input
                        type="text"
                        value={line.line_remarks || ""}
                        onChange={(e: any) =>
                          handleLineChange(
                            index,
                            "line_remarks",
                            e.target.value
                          )
                        }
                        className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-900 dark:text-white"
                        placeholder="Remarks..."
                      />
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleDuplicateLine(index)}
                          className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-brand-500 dark:hover:bg-navy-700"
                          title="Duplicate Line"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
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
        <p className="mt-2 text-sm text-red-500">{errors.lines}</p>
      )}
    </div>
  );
};

export default OpeningStockLinesTable;
