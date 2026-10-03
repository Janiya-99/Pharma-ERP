import React, { useMemo, useCallback } from "react";
import { MdAdd, MdDelete, MdClear } from "react-icons/md";
import JournalLineAccountSelect from "../../../components/finance/JournalLineAccountSelect";
import DebitCreditSummary from "../../../components/finance/DebitCreditSummary";

function JournalEntryLinesTable({
  lines,
  setLines,
  disabled,
}: {
  lines?: any;
  setLines?: any;
  disabled?: any;
}) {
  const addLine = useCallback(() => {
    setLines([
      ...lines,
      {
        account_id: "",
        line_description: "",
        debit_amount: 0,
        credit_amount: 0,
      },
    ]);
  }, [lines, setLines]);

  const removeLine = useCallback(
    (index: any) => {
      if (lines.length <= 2) {
        alert("A journal entry must have at least 2 lines.");
        return;
      }
      const newLines = [...lines];
      newLines.splice(index, 1);
      setLines(newLines);
    },
    [lines, setLines]
  );

  const clearLine = useCallback(
    (index: any) => {
      const newLines = [...lines];
      newLines[index] = {
        account_id: "",
        line_description: "",
        debit_amount: 0,
        credit_amount: 0,
      };
      setLines(newLines);
    },
    [lines, setLines]
  );

  const updateLine = useCallback(
    (index: any, field: any, value: any) => {
      const newLines = [...lines];

      if (field === "debit_amount" && value > 0) {
        newLines[index].credit_amount = 0; // Clear credit if debit is set
      } else if (field === "credit_amount" && value > 0) {
        newLines[index].debit_amount = 0; // Clear debit if credit is set
      }

      newLines[index][field] = value;
      setLines(newLines);
    },
    [lines, setLines]
  );

  const totalDebit = useMemo(() => {
    return lines.reduce(
      (sum: any, line: any) => sum + (Number(line.debit_amount) || 0),
      0
    );
  }, [lines]);

  const totalCredit = useMemo(() => {
    return lines.reduce(
      (sum: any, line: any) => sum + (Number(line.credit_amount) || 0),
      0
    );
  }, [lines]);

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm  ">
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 ">
          <h3 className="text-lg font-medium text-navy-800 ">
            Journal Lines
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
            <thead className="border-b border-gray-200 bg-gray-50 font-semibold text-gray-500   ">
              <tr>
                <th className="w-1/3 px-4 py-3">Account</th>
                <th className="px-4 py-3">Line Description</th>
                <th className="w-40 px-4 py-3 text-right">Debit</th>
                <th className="w-40 px-4 py-3 text-right">Credit</th>
                <th className="w-24 px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 ">
              {lines.map((line: any, index: any) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 "
                >
                  <td className="px-4 py-2">
                    <JournalLineAccountSelect
                      value={line.account_id}
                      onChange={(val: any) =>
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
                      value={line.debit_amount || ""}
                      onChange={(e: any) =>
                        updateLine(
                          index,
                          "debit_amount",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      disabled={disabled || line.credit_amount > 0}
                      placeholder="0.00"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-right focus:outline-none focus:ring-1 focus:ring-navy-500 disabled:bg-gray-100"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={line.credit_amount || ""}
                      onChange={(e: any) =>
                        updateLine(
                          index,
                          "credit_amount",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      disabled={disabled || line.debit_amount > 0}
                      placeholder="0.00"
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-right focus:outline-none focus:ring-1 focus:ring-navy-500 disabled:bg-gray-100"
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
          <DebitCreditSummary
            totalDebit={totalDebit}
            totalCredit={totalCredit}
          />
        </div>
      </div>
    </div>
  );
}

export default React.memo(JournalEntryLinesTable);
