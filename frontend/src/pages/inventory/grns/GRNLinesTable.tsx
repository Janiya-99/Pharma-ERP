import React, { useEffect, useState } from "react";
import { Plus, Trash2, Copy, AlertCircle } from "lucide-react";
import GRNLineProductSelect from "../../../components/inventory/GRNLineProductSelect";
import GRNLineBatchSelect from "../../../components/inventory/GRNLineBatchSelect";
import GRNLineCostSummary from "../../../components/inventory/GRNLineCostSummary";
import FreeQuantityBadge from "../../../components/inventory/FreeQuantityBadge";
import NewBatchIndicator from "../../../components/inventory/NewBatchIndicator";
import { inventoryApi } from "../../../api/inventoryApi";

const GRNLinesTable = ({
  lines,
  setLines,
  warehouseId,
  errors = {},
}: {
  lines?: unknown;
  setLines?: unknown;
  warehouseId?: string | number;
  errors?: unknown;
}) => {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    if (warehouseId) {
      fetchWarehouseLocations(warehouseId);
    } else {
      setLocations([]);
      setLines(
        lines.map((line: unknown) => ({ ...line, warehouse_location_id: "" }))
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
      if (res.success !== false) {
        setLocations(
          Array.isArray(res.data?.data)
            ? res.data.data
            : Array.isArray(res.data)
            ? res.data
            : []
        );
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
        is_new_batch: false,
        product_batch_id: null,
        batch: null,
        batch_number: "",
        manufacture_date: "",
        expiry_date: "",
        quantity_received: 0,
        free_quantity: 0,
        unit_cost: 0,
        discount_amount: 0,
        tax_amount: 0,
        selling_price: 0,
        mrp: 0,
        line_remarks: "",
      },
    ]);
  };

  const handleRemoveLine = (index: unknown) => {
    setLines(lines.filter((_: unknown, i: unknown) => i !== index));
  };

  const handleDuplicateLine = (index: unknown) => {
    const lineToCopy = lines[index];
    setLines([
      ...lines.slice(0, index + 1),
      {
        ...lineToCopy,
        id: `temp-${Date.now()}`,
        // clear out ids to prevent exact duplication of record associations in case backend gets confused, but keep values
        product_batch_id: lineToCopy.is_new_batch
          ? null
          : lineToCopy.product_batch_id,
      },
      ...lines.slice(index + 1),
    ]);
  };

  const handleLineChange = (
    index: unknown,
    field: unknown,
    value: unknown,
    extraData: unknown = {}
  ) => {
    const newLines = [...lines];
    newLines[index][field] = value;

    if (field === "product_id") {
      newLines[index].product = extraData.product;
      newLines[index].product_batch_id = null;
      newLines[index].batch = null;
      newLines[index].is_new_batch = false;
      newLines[index].batch_number = "";
      newLines[index].manufacture_date = "";
      newLines[index].expiry_date = "";
    }

    if (field === "product_batch_id") {
      newLines[index].batch = extraData.batch;
      if (extraData.batch) {
        newLines[index].batch_number = extraData.batch.batch_number || "";
        newLines[index].manufacture_date = extraData.batch.manufacture_date
          ? extraData.batch.manufacture_date.split("T")[0]
          : "";
        newLines[index].expiry_date = extraData.batch.expiry_date
          ? extraData.batch.expiry_date.split("T")[0]
          : "";
        if (extraData.batch.purchase_rate)
          newLines[index].unit_cost = parseFloat(extraData.batch.purchase_rate);
        if (extraData.batch.selling_price)
          newLines[index].selling_price = parseFloat(
            extraData.batch.selling_price
          );
        if (extraData.batch.mrp)
          newLines[index].mrp = parseFloat(extraData.batch.mrp);
      }
    }

    if (field === "is_new_batch") {
      if (value === true) {
        newLines[index].product_batch_id = null;
        newLines[index].batch = null;
        newLines[index].batch_number = "";
        newLines[index].manufacture_date = "";
        newLines[index].expiry_date = "";
      }
    }

    setLines(newLines);
  };

  return (
    <div className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          GRN Line Items
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
              <th className="min-w-[220px] px-4 py-3">Product *</th>
              <th className="min-w-[250px] px-4 py-3">Batch Details *</th>
              <th className="min-w-[150px] px-4 py-3">Location</th>
              <th className="min-w-[250px] px-4 py-3">Quantity & Cost *</th>
              <th className="min-w-[180px] px-4 py-3">Summary</th>
              <th className="min-w-[150px] px-4 py-3">Remarks</th>
              <th className="min-w-[80px] px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-navy-700">
            {lines.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  No lines added. Click "Add Line" to begin.
                </td>
              </tr>
            ) : (
              lines.map((line: unknown, index: unknown) => {
                const lineErrors = errors[`lines.${index}`] || {};

                return (
                  <tr
                    key={line.id || index}
                    className="hover:bg-gray-50 dark:hover:bg-navy-800/50"
                  >
                    <td className="px-4 py-3 align-top">
                      <GRNLineProductSelect
                        value={line.product_id}
                        onChange={(val: unknown, product: unknown) =>
                          handleLineChange(index, "product_id", val, {
                            product,
                          })
                        }
                        error={lineErrors.product_id}
                      />
                      {line.product && (
                        <div className="mt-2 flex flex-col gap-1 text-xs text-gray-500 dark:text-gray-400">
                          {line.product.requires_batch_tracking ? (
                            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                              <AlertCircle className="h-3 w-3" /> Batch Req
                            </span>
                          ) : (
                            <span>No Batch Req</span>
                          )}
                          {line.product.requires_expiry_tracking ? (
                            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                              <AlertCircle className="h-3 w-3" /> Expiry Req
                            </span>
                          ) : (
                            <span>No Expiry Req</span>
                          )}
                          <span>
                            Base Unit:{" "}
                            {line.product.base_unit?.unit_name || "N/A"}
                          </span>
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-col gap-2">
                        {line.product?.requires_batch_tracking && (
                          <div className="mb-1 flex items-center gap-2">
                            <label className="flex cursor-pointer items-center gap-1 text-xs">
                              <input
                                type="radio"
                                checked={!line.is_new_batch}
                                onChange={() =>
                                  handleLineChange(index, "is_new_batch", false)
                                }
                              />
                              Existing
                            </label>
                            <label className="flex cursor-pointer items-center gap-1 text-xs">
                              <input
                                type="radio"
                                checked={line.is_new_batch}
                                onChange={() =>
                                  handleLineChange(index, "is_new_batch", true)
                                }
                              />
                              New Batch
                            </label>
                            {line.is_new_batch && (
                              <NewBatchIndicator isNew={true} />
                            )}
                          </div>
                        )}

                        {!line.is_new_batch ? (
                          <>
                            <GRNLineBatchSelect
                              productId={line.product_id}
                              value={line.product_batch_id}
                              onChange={(val: unknown, batch: unknown) =>
                                handleLineChange(
                                  index,
                                  "product_batch_id",
                                  val,
                                  { batch }
                                )
                              }
                              error={lineErrors.batch}
                              isDisabled={
                                !line.product ||
                                !line.product.requires_batch_tracking
                              }
                            />
                            {line.batch && (
                              <div className="mt-1 text-[10px] text-gray-500">
                                Exp:{" "}
                                {line.batch.expiry_date
                                  ? new Date(
                                      line.batch.expiry_date
                                    ).toLocaleDateString()
                                  : "N/A"}{" "}
                                <br />
                                Mfd:{" "}
                                {line.batch.manufacture_date
                                  ? new Date(
                                      line.batch.manufacture_date
                                    ).toLocaleDateString()
                                  : "N/A"}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="space-y-2 rounded-lg border border-brand-100 bg-brand-50/30 p-2">
                            <div>
                              <input
                                type="text"
                                placeholder="Batch No *"
                                value={line.batch_number}
                                onChange={(e: any) =>
                                  handleLineChange(
                                    index,
                                    "batch_number",
                                    e.target.value
                                  )
                                }
                                className={`w-full rounded border bg-white px-2 py-1.5 text-xs focus:ring-1 focus:ring-brand-500 ${
                                  lineErrors.batch
                                    ? "border-red-500"
                                    : "border-gray-200"
                                }`}
                              />
                              {lineErrors.batch && (
                                <p className="mt-0.5 text-[10px] text-red-500">
                                  {lineErrors.batch}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <div className="w-1/2">
                                <label className="block text-[10px] text-gray-500">
                                  Mfd Date
                                </label>
                                <input
                                  type="date"
                                  value={line.manufacture_date}
                                  onChange={(e: any) =>
                                    handleLineChange(
                                      index,
                                      "manufacture_date",
                                      e.target.value
                                    )
                                  }
                                  className="w-full rounded border border-gray-200 bg-white px-2 py-1 text-[10px]"
                                />
                              </div>
                              <div className="w-1/2">
                                <label className="block text-[10px] text-gray-500">
                                  Exp Date{" "}
                                  {line.product?.requires_expiry_tracking &&
                                    "*"}
                                </label>
                                <input
                                  type="date"
                                  value={line.expiry_date}
                                  onChange={(e: any) =>
                                    handleLineChange(
                                      index,
                                      "expiry_date",
                                      e.target.value
                                    )
                                  }
                                  className={`w-full rounded border bg-white px-2 py-1 text-[10px] ${
                                    lineErrors.expiry_date
                                      ? "border-red-500"
                                      : "border-gray-200"
                                  }`}
                                />
                                {lineErrors.expiry_date && (
                                  <p className="mt-0.5 text-[10px] text-red-500">
                                    {lineErrors.expiry_date}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
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
                        {locations.map((loc: unknown) => (
                          <option key={loc.id} value={loc.id}>
                            {loc.location_name}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-4 py-3 align-top">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="mb-1 block text-xs text-gray-500">
                            Qty Rec. *
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.001"
                            value={
                              line.quantity_received === 0
                                ? ""
                                : line.quantity_received
                            }
                            onChange={(e: any) =>
                              handleLineChange(
                                index,
                                "quantity_received",
                                e.target.value
                              )
                            }
                            className={`w-full rounded border px-2 py-1.5 text-right text-xs ${
                              lineErrors.quantity_received
                                ? "border-red-500"
                                : "border-gray-200 dark:border-navy-600"
                            } dark:bg-navy-900`}
                          />
                          {lineErrors.quantity_received && (
                            <p className="mt-0.5 text-[10px] text-red-500">
                              {lineErrors.quantity_received}
                            </p>
                          )}
                        </div>
                        <div>
                          <label className="mb-1 block text-xs text-gray-500">
                            Free Qty
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              min="0"
                              step="0.001"
                              value={
                                line.free_quantity === 0
                                  ? ""
                                  : line.free_quantity
                              }
                              onChange={(e: any) =>
                                handleLineChange(
                                  index,
                                  "free_quantity",
                                  e.target.value
                                )
                              }
                              className={`w-full rounded border px-2 py-1.5 text-right text-xs ${
                                lineErrors.free_quantity
                                  ? "border-red-500"
                                  : "border-gray-200 dark:border-navy-600"
                              } dark:bg-navy-900`}
                            />
                            {line.free_quantity > 0 && (
                              <div className="absolute -right-1 -top-1">
                                <FreeQuantityBadge
                                  quantity={line.free_quantity}
                                />
                              </div>
                            )}
                          </div>
                          {lineErrors.free_quantity && (
                            <p className="mt-0.5 text-[10px] text-red-500">
                              {lineErrors.free_quantity}
                            </p>
                          )}
                        </div>

                        <div className="col-span-2">
                          <label className="mb-1 mt-1 block text-xs text-gray-500">
                            Unit Cost (LKR) *
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={line.unit_cost === 0 ? "" : line.unit_cost}
                            onChange={(e: any) =>
                              handleLineChange(
                                index,
                                "unit_cost",
                                e.target.value
                              )
                            }
                            className={`w-full rounded border px-2 py-1.5 text-right text-xs ${
                              lineErrors.unit_cost
                                ? "border-red-500"
                                : "border-gray-200 dark:border-navy-600"
                            } dark:bg-navy-900`}
                          />
                          {lineErrors.unit_cost && (
                            <p className="mt-0.5 text-[10px] text-red-500">
                              {lineErrors.unit_cost}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="mb-1 mt-1 block text-xs text-gray-500">
                            Discount (LKR)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={
                              line.discount_amount === 0
                                ? ""
                                : line.discount_amount
                            }
                            onChange={(e: any) =>
                              handleLineChange(
                                index,
                                "discount_amount",
                                e.target.value
                              )
                            }
                            className={`w-full rounded border px-2 py-1.5 text-right text-xs ${
                              lineErrors.discount_amount
                                ? "border-red-500"
                                : "border-gray-200 dark:border-navy-600"
                            } dark:bg-navy-900`}
                          />
                        </div>
                        <div>
                          <label className="mb-1 mt-1 block text-xs text-gray-500">
                            Tax (LKR)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={line.tax_amount === 0 ? "" : line.tax_amount}
                            onChange={(e: any) =>
                              handleLineChange(
                                index,
                                "tax_amount",
                                e.target.value
                              )
                            }
                            className={`w-full rounded border px-2 py-1.5 text-right text-xs ${
                              lineErrors.tax_amount
                                ? "border-red-500"
                                : "border-gray-200 dark:border-navy-600"
                            } dark:bg-navy-900`}
                          />
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 align-top">
                      <GRNLineCostSummary
                        quantityReceived={line.quantity_received}
                        freeQuantity={line.free_quantity}
                        unitCost={line.unit_cost}
                        discountAmount={line.discount_amount}
                        taxAmount={line.tax_amount}
                      />
                    </td>

                    <td className="px-4 py-3 align-top">
                      <div className="flex flex-col gap-2">
                        <textarea
                          rows={2}
                          value={line.line_remarks || ""}
                          onChange={(e: any) =>
                            handleLineChange(
                              index,
                              "line_remarks",
                              e.target.value
                            )
                          }
                          className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-xs text-gray-900 focus:ring-2 focus:ring-brand-500 dark:border-navy-600 dark:bg-navy-900 dark:text-white"
                          placeholder="Remarks..."
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] text-gray-500">
                              Selling Price
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={
                                line.selling_price === 0
                                  ? ""
                                  : line.selling_price
                              }
                              onChange={(e: any) =>
                                handleLineChange(
                                  index,
                                  "selling_price",
                                  e.target.value
                                )
                              }
                              className="w-full rounded border border-gray-200 px-2 py-1 text-right text-[10px]"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-500">
                              MRP
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={line.mrp === 0 ? "" : line.mrp}
                              onChange={(e: any) =>
                                handleLineChange(index, "mrp", e.target.value)
                              }
                              className="w-full rounded border border-gray-200 px-2 py-1 text-right text-[10px]"
                            />
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 align-top">
                      <div className="mt-2 flex flex-col items-center justify-center gap-2">
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
        <p className="mt-2 text-sm font-medium text-red-500">{errors.lines}</p>
      )}
    </div>
  );
};

export default GRNLinesTable;
