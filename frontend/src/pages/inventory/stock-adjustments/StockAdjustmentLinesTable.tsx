import React, { useEffect } from "react";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import StockAdjustmentLineProductSelect from "../../../components/inventory/StockAdjustmentLineProductSelect";
import StockAdjustmentLineBatchSelect from "../../../components/inventory/StockAdjustmentLineBatchSelect";
import WarehouseLocationSelect from "../../../components/inventory/WarehouseLocationSelect";
import { inventoryApi } from "../../../api/inventoryApi";

const StockAdjustmentLinesTable = ({
  lines,
  setLines,
  warehouseId,
  adjustmentType,
  errors,
}: { lines?: unknown; setLines?: unknown; warehouseId?: string | number; adjustmentType?: unknown; errors?: unknown }) => {
  const [products, setProducts] = React.useState([]);
  const [loadingProducts, setLoadingProducts] = React.useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true);
      const res = await inventoryApi.getProducts({ limit: 500, status: "active", with_batches: true });
      if (res.success !== false) {
        setProducts(res.data?.data || res.data || []);
      }
    } catch (error) {
      console.error("Failed to load products", error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const addLine = () => {
    setLines([
      ...lines,
      {
        id: `temp-${Date.now()}`,
        product_id: null,
        product: null,
        product_batch_id: null,
        batch: null,
        warehouse_location_id: "",
        adjustment_direction: adjustmentType === "positive" ? "in" : adjustmentType === "negative" ? "out" : "in",
        system_quantity: 0,
        physical_quantity: "",
        variance_quantity: 0,
        unit_cost: 0,
        stock_balance_loading: false,
        stock_balance_data: null,
        reason: "",
      },
    ]);
  };

  const removeLine = (idToRemove: unknown) => {
    setLines(lines.filter((line: unknown) => line.id !== idToRemove));
  };

  const updateLine = (id: string | number, field: unknown, value: unknown) => {
    setLines((prevLines: unknown) =>
      prevLines.map((line: unknown) => {
        if (line.id !== id) return line;

        const updatedLine = { ...line, [field]: value };

        // Handle physical count variance calculation
        if (adjustmentType === "physical_count" && (field === "physical_quantity" || field === "system_quantity")) {
          const sysQty = parseFloat(updatedLine.system_quantity || 0);
          const physQtyStr = String(updatedLine.physical_quantity || "");
          
          if (physQtyStr.trim() !== "") {
            const physQty = parseFloat(physQtyStr);
            updatedLine.variance_quantity = Number((physQty - sysQty).toFixed(3));
            updatedLine.adjustment_direction = updatedLine.variance_quantity >= 0 ? "in" : "out";
          } else {
            updatedLine.variance_quantity = 0;
            updatedLine.adjustment_direction = "in";
          }
        }

        // If product changes, reset dependent fields
        if (field === "product_id") {
          const prod = products.find((p: unknown) => p.id === value);
          updatedLine.product = prod;
          updatedLine.product_batch_id = null;
          updatedLine.batch = null;
          updatedLine.unit_cost = 0; // Might be updated by batch or stock balance
          updatedLine.system_quantity = 0;
          updatedLine.physical_quantity = "";
          updatedLine.variance_quantity = 0;
          updatedLine.stock_balance_data = null;
        }

        // If batch changes, set batch obj
        if (field === "product_batch_id") {
          if (updatedLine.product?.batches) {
            const batch = updatedLine.product.batches.find((b: unknown) => b.id === value);
            updatedLine.batch = batch;
          } else {
            updatedLine.batch = null;
          }
        }

        return updatedLine;
      })
    );
  };

  // Trigger stock balance fetch when product, batch, or location changes
  useEffect(() => {
    lines.forEach((line: unknown) => {
      const needsFetch =
        line.product_id &&
        line.warehouse_location_id &&
        (!line.product?.requires_batch_tracking || line.product_batch_id);

      // Simple heuristic: if we have the identifiers but no stock data yet (and not loading), fetch it.
      // This is a simplified approach. In a real app, you might want a more robust way to debounce and track fetch requests.
      if (needsFetch && !line.stock_balance_data && !line.stock_balance_loading) {
        fetchStockBalanceForLine(line.id, line.product_id, line.product_batch_id, line.warehouse_location_id);
      }
    });
  }, [lines, warehouseId]);

  const fetchStockBalanceForLine = async (lineId: string | number, productId: string | number, batchId: string | number, locationId: string | number) => {
    if (!warehouseId || !productId || !locationId) return;

    setLines((prev: unknown) => prev.map((l: unknown) => (l.id === lineId ? { ...l, stock_balance_loading: true } : l)));

    try {
      const params = {
        warehouse_id: warehouseId,
        warehouse_location_id: locationId,
        product_id: productId,
      };
      if (batchId) params.product_batch_id = batchId;

      const res = await inventoryApi.getStockBalances(params);
      const balances = res.data?.data || res.data || [];
      
      // Since we filtered precisely, we should ideally get 0 or 1 result
      let foundBalance = null;
      if (balances.length > 0) {
        foundBalance = balances[0];
      }

      setLines((prev: unknown) =>
        prev.map((l: unknown) => {
          if (l.id !== lineId) return l;
          
          const sysQty = foundBalance ? parseFloat(foundBalance.quantity_on_hand) : 0;
          const avgCost = foundBalance ? parseFloat(foundBalance.average_cost) : 0;
          
          let variance = l.variance_quantity;
          let dir = l.adjustment_direction;
          
          if (adjustmentType === "physical_count" && String(l.physical_quantity || "").trim() !== "") {
            const physQty = parseFloat(l.physical_quantity);
            variance = Number((physQty - sysQty).toFixed(3));
            dir = variance >= 0 ? "in" : "out";
          }

          return {
            ...l,
            stock_balance_loading: false,
            stock_balance_data: foundBalance || { quantity_on_hand: 0, average_cost: 0 },
            system_quantity: sysQty,
            unit_cost: avgCost, // Set cost from system if available
            variance_quantity: variance,
            adjustment_direction: dir,
          };
        })
      );
    } catch (error) {
      console.error("Failed to fetch balance", error);
      setLines((prev: unknown) => prev.map((l: unknown) => (l.id === lineId ? { ...l, stock_balance_loading: false } : l)));
    }
  };


  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">Adjustment Lines</h4>
        <button
          type="button"
          onClick={addLine}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100 dark:bg-navy-700 dark:text-brand-400 dark:hover:bg-navy-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Line
        </button>
      </div>

      {errors.lines && <p className="text-sm text-red-500 flex items-center gap-1"><AlertCircle className="w-4 h-4"/> {errors.lines}</p>}

      <div className="border border-gray-200 dark:border-navy-700 rounded-xl overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1200px]">
          <thead>
            <tr className="bg-gray-50 dark:bg-navy-800 border-b border-gray-200 dark:border-navy-700">
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-8">#</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-64">Product</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-48">Batch</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-48">Location</th>
              
              {adjustmentType === "physical_count" ? (
                <>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">Sys Qty</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">Phys Qty</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">Variance</th>
                </>
              ) : (
                <>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">Available</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">Adj Qty</th>
                  <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-24">Direction</th>
                </>
              )}
              
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-32">Unit Cost</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-40">Reason</th>
              <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider w-12 text-center">Act</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-navy-700">
            {lines.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  No lines added. Click "Add Line" to begin.
                </td>
              </tr>
            ) : (
              lines.map((line: unknown, index: unknown) => {
                const productError = errors[`lines.${index}.product_id`];
                const batchError = errors[`lines.${index}.product_batch_id`];
                const locError = errors[`lines.${index}.warehouse_location_id`];
                const qtyError = errors[`lines.${index}.variance_quantity`] || errors[`lines.${index}.physical_quantity`];

                return (
                  <tr key={line.id} className="bg-white dark:bg-navy-900 group">
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{index + 1}</td>
                    
                    <td className="px-4 py-3 align-top">
                      <StockAdjustmentLineProductSelect
                        value={line.product_id}
                        onChange={(p: unknown) => updateLine(line.id, "product_id", p.id)}
                        products={products}
                        error={productError}
                      />
                      {productError && <span className="text-[10px] text-red-500 mt-1 block">{productError}</span>}
                    </td>

                    <td className="px-4 py-3 align-top">
                      <StockAdjustmentLineBatchSelect
                        value={line.product_batch_id}
                        onChange={(b: unknown) => updateLine(line.id, "product_batch_id", b.id)}
                        batches={line.product?.batches || []}
                        error={batchError}
                        disabled={!line.product || !line.product.requires_batch_tracking}
                      />
                      {batchError && <span className="text-[10px] text-red-500 mt-1 block">{batchError}</span>}
                      {line.product && !line.product.requires_batch_tracking && (
                        <span className="text-[10px] text-gray-400 mt-1 block">Batch tracking disabled</span>
                      )}
                    </td>

                    <td className="px-4 py-3 align-top">
                      <WarehouseLocationSelect
                        warehouseId={warehouseId}
                        value={line.warehouse_location_id}
                        onChange={(e: any) => updateLine(line.id, "warehouse_location_id", e.target.value)}
                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-900 text-gray-900 dark:text-white ${
                          locError ? "border-red-300 dark:border-red-500/50" : "border-gray-200 dark:border-navy-600"
                        }`}
                        disabled={!warehouseId}
                      />
                      {locError && <span className="text-[10px] text-red-500 mt-1 block">{locError}</span>}
                    </td>

                    {adjustmentType === "physical_count" ? (
                      <>
                        <td className="px-4 py-3 align-top">
                           {line.stock_balance_loading ? (
                             <span className="text-sm text-gray-400 animate-pulse">Loading...</span>
                           ) : (
                             <span className="text-sm font-medium text-gray-900 dark:text-white">
                               {line.system_quantity.toFixed(3)}
                             </span>
                           )}
                        </td>
                        <td className="px-4 py-3 align-top">
                          <input
                            type="number"
                            min="0"
                            step="0.001"
                            value={line.physical_quantity}
                            onChange={(e: any) => updateLine(line.id, "physical_quantity", e.target.value)}
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-900 text-gray-900 dark:text-white ${
                              qtyError ? "border-red-300" : "border-gray-200 dark:border-navy-600"
                            }`}
                            placeholder="Count..."
                          />
                          {qtyError && <span className="text-[10px] text-red-500 mt-1 block">{qtyError}</span>}
                        </td>
                        <td className="px-4 py-3 align-top">
                          <span className={`text-sm font-bold ${line.variance_quantity > 0 ? 'text-green-600' : line.variance_quantity < 0 ? 'text-red-600' : 'text-gray-500'}`}>
                            {line.variance_quantity > 0 ? '+' : ''}{line.variance_quantity.toFixed(3)}
                          </span>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 align-top">
                           {line.stock_balance_loading ? (
                             <span className="text-sm text-gray-400 animate-pulse">Loading...</span>
                           ) : (
                             <span className="text-sm font-medium text-gray-900 dark:text-white">
                               {line.system_quantity.toFixed(3)}
                             </span>
                           )}
                        </td>
                        <td className="px-4 py-3 align-top">
                          <input
                            type="number"
                            min="0.001"
                            step="0.001"
                            value={Math.abs(line.variance_quantity) || ""}
                            onChange={(e: any) => {
                               const val = parseFloat(e.target.value || 0);
                               // Store variance with correct sign based on direction
                               updateLine(line.id, "variance_quantity", line.adjustment_direction === "in" ? val : -val);
                            }}
                            className={`w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-900 text-gray-900 dark:text-white ${
                              qtyError ? "border-red-300" : "border-gray-200 dark:border-navy-600"
                            }`}
                            placeholder="Qty..."
                          />
                          {qtyError && <span className="text-[10px] text-red-500 mt-1 block">{qtyError}</span>}
                        </td>
                        <td className="px-4 py-3 align-top">
                          <select
                            value={line.adjustment_direction}
                            onChange={(e: any) => {
                              const dir = e.target.value;
                              updateLine(line.id, "adjustment_direction", dir);
                              const currentVal = Math.abs(line.variance_quantity || 0);
                              updateLine(line.id, "variance_quantity", dir === "in" ? currentVal : -currentVal);
                            }}
                            disabled={adjustmentType === "positive" || adjustmentType === "negative"}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-900 text-gray-900 dark:text-white dark:border-navy-600 disabled:opacity-60"
                          >
                            <option value="in">In (+)</option>
                            <option value="out">Out (-)</option>
                          </select>
                        </td>
                      </>
                    )}

                    <td className="px-4 py-3 align-top">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.unit_cost}
                        onChange={(e: any) => updateLine(line.id, "unit_cost", parseFloat(e.target.value || 0))}
                        disabled={line.adjustment_direction === "out"} // Often cost is fixed for OUT adjustments
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-900 text-gray-900 dark:text-white dark:border-navy-600 disabled:opacity-60 disabled:cursor-not-allowed"
                        placeholder="0.00"
                      />
                    </td>

                    <td className="px-4 py-3 align-top">
                      <input
                        type="text"
                        value={line.reason}
                        onChange={(e: any) => updateLine(line.id, "reason", e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 bg-white dark:bg-navy-900 text-gray-900 dark:text-white dark:border-navy-600"
                        placeholder="Optional reason..."
                      />
                    </td>

                    <td className="px-4 py-3 align-top text-center">
                      <button
                        type="button"
                        onClick={() => removeLine(line.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded dark:hover:bg-red-900/20 transition-colors"
                        title="Remove Line"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockAdjustmentLinesTable;
