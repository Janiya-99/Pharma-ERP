import React from "react";
import { MdAdd, MdDelete, MdClear } from "react-icons/md";
import JournalLineAccountSelect from "../../../../components/finance/JournalLineAccountSelect";
import DebitCreditSummary from "../../../../components/finance/DebitCreditSummary";

export default function JournalEntryLinesTable({ lines, setLines, disabled }) {
  const addLine = () => {
    setLines([...lines, { account_id: "", line_description: "", debit_amount: 0, credit_amount: 0 }]);
  };

  const removeLine = (index) => {
    if (lines.length <= 2) {
      alert("A journal entry must have at least 2 lines.");
      return;
    }
    const newLines = [...lines];
    newLines.splice(index, 1);
    setLines(newLines);
  };

  const clearLine = (index) => {
    const newLines = [...lines];
    newLines[index] = { account_id: "", line_description: "", debit_amount: 0, credit_amount: 0 };
    setLines(newLines);
  };

  const updateLine = (index, field, value) => {
    const newLines = [...lines];
    
    if (field === "debit_amount" && value > 0) {
      newLines[index].credit_amount = 0; // Clear credit if debit is set
    } else if (field === "credit_amount" && value > 0) {
      newLines[index].debit_amount = 0; // Clear debit if credit is set
    }

    newLines[index][field] = value;
    setLines(newLines);
  };

  const totalDebit = lines.reduce((sum, line) => sum + (Number(line.debit_amount) || 0), 0);
  const totalCredit = lines.reduce((sum, line) => sum + (Number(line.credit_amount) || 0), 0);

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-navy-800 rounded-xl shadow-sm border border-gray-100 dark:border-navy-700 overflow-hidden">
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 dark:border-navy-700">
          <h3 className="text-lg font-medium text-navy-800 dark:text-white">Journal Lines</h3>
          {!disabled && (
            <button
              type="button"
              onClick={addLine}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-50 text-brand-600 text-sm font-semibold hover:bg-brand-100 transition-colors"
            >
              <MdAdd size={16} /> Add Line
            </button>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-navy-700/50 text-gray-500 dark:text-gray-300 font-semibold border-b border-gray-200 dark:border-navy-700">
              <tr>
                <th className="px-4 py-3 w-1/3">Account</th>
                <th className="px-4 py-3">Line Description</th>
                <th className="px-4 py-3 w-40 text-right">Debit</th>
                <th className="px-4 py-3 w-40 text-right">Credit</th>
                <th className="px-4 py-3 w-24 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-navy-700">
              {lines.map((line, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-navy-700/30">
                  <td className="px-4 py-2">
                    <JournalLineAccountSelect
                      value={line.account_id}
                      onChange={(val) => updateLine(index, "account_id", val)}
                      disabled={disabled}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={line.line_description}
                      onChange={(e) => updateLine(index, "line_description", e.target.value)}
                      disabled={disabled}
                      placeholder="Description"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-navy-500"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={line.debit_amount || ""}
                      onChange={(e) => updateLine(index, "debit_amount", parseFloat(e.target.value) || 0)}
                      disabled={disabled || line.credit_amount > 0}
                      placeholder="0.00"
                      className="w-full px-3 py-2 text-right border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-navy-500 disabled:bg-gray-100"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={line.credit_amount || ""}
                      onChange={(e) => updateLine(index, "credit_amount", parseFloat(e.target.value) || 0)}
                      disabled={disabled || line.debit_amount > 0}
                      placeholder="0.00"
                      className="w-full px-3 py-2 text-right border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-navy-500 disabled:bg-gray-100"
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
          <DebitCreditSummary totalDebit={totalDebit} totalCredit={totalCredit} />
        </div>
      </div>
    </div>
  );
}
