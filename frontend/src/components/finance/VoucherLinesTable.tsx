import React from "react";
import { MdAdd, MdDelete, MdClear } from "react-icons/md";
import JournalLineAccountSelect from "../../../../components/finance/JournalLineAccountSelect";

export default function VoucherLinesTable({
  lines,
  setLines,
  disabled,
}: {
  lines?: unknown;
  setLines?: unknown;
  disabled?: unknown;
}) {
  const addLine = () => {
    setLines([...lines, { account_id: "", line_description: "", amount: 0 }]);
  };

  const removeLine = (index: unknown) => {
    if (lines.length <= 1) {
      alert("A voucher must have at least 1 line.");
      return;
    }
    const newLines = [...lines];
    newLines.splice(index, 1);
    setLines(newLines);
  };

  const clearLine = (index: unknown) => {
    const newLines = [...lines];
    newLines[index] = { account_id: "", line_description: "", amount: 0 };
    setLines(newLines);
  };

  const updateLine = (index: unknown, field: unknown, value: unknown) => {
    const newLines = [...lines];
    newLines[index][field] = value;
    setLines(newLines);
  };

  const totalAmount = lines.reduce(
    (sum: unknown, line: unknown) => sum + (Number(line.amount) || 0),
    0
  );

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm dark:border-navy-700 dark:bg-navy-800">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-navy-700">
          <h3 className="text-lg font-medium text-navy-800 dark:text-white">
            Line Items
          </h3>
          {!disabled && (
            <button
              type="button"
              onClick={addLine}
              className="flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-1.5 text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-100"
            >
              <MdAdd size={16} /> Add Line
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 font-semibold text-gray-500 dark:border-navy-700 dark:bg-navy-700/50 dark:text-gray-300">
              <tr>
                <th className="w-1/3 px-4 py-3">Account</th>
                <th className="px-4 py-3">Line Description</th>
                <th className="w-40 px-4 py-3 text-right">Amount</th>
                <th className="w-24 px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-navy-700">
              {lines.map((line: unknown, index: unknown) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 dark:hover:bg-navy-700/30"
                >
                  <td className="px-4 py-2">
                    <JournalLineAccountSelect
                      value={line.account_id}
                      onChange={(val: unknown) =>
                        updateLine(index, "account_id", val)
                      }
                      disabled={disabled}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={line.line_description}
                      onChange={(e: any) =>
                        updateLine(index, "line_description", e.target.value)
                      }
                      disabled={disabled}
                      placeholder="Description"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-navy-500"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={line.amount || ""}
                      onChange={(e: any) =>
                        updateLine(
                          index,
                          "amount",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      disabled={disabled}
                      placeholder="0.00"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-right focus:outline-none focus:ring-1 focus:ring-navy-500"
                    />
                  </td>
                  <td className="px-4 py-2 text-center">
                    {!disabled && (
                      <div className="flex justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => clearLine(index)}
                          className="text-gray-400 hover:text-gray-600"
                          title="Clear Line"
                        >
                          <MdClear size={18} />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeLine(index)}
                          className="text-red-400 hover:text-red-600"
                          title="Remove Line"
                        >
                          <MdDelete size={18} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-end">
        <div className="w-80">
          <div className="rounded-md border bg-gray-50 p-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium text-gray-700">
                Total Amount
              </span>
              <span className="text-xl font-bold text-gray-900">
                {new Intl.NumberFormat("en-LK", {
                  style: "currency",
                  currency: "LKR",
                }).format(totalAmount || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
