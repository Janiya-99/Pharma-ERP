import { useState, useEffect } from "react";
import { MdAdd, MdDelete, MdClear } from "react-icons/md";
import { financeApi } from "../../api/financeApi";

const PettyCashLinesTable = ({ lines, onChange, readOnly }: { lines?: unknown; onChange?: unknown; readOnly?: unknown }) => {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await financeApi.getChartOfAccounts({ limit: 1000, status: 'active' });
        if (response.data?.success) {
          setAccounts(response.data.data);
        }
      } catch (error) {
        console.error("Failed to load chart of accounts", error);
      }
    };
    fetchAccounts();
  }, []);

  const handleAddLine = () => {
    onChange([...lines, { account_id: "", line_description: "", amount: "" }]);
  };

  const handleRemoveLine = (index: unknown) => {
    const newLines = lines.filter((_: unknown, i: unknown) => i !== index);
    onChange(newLines);
  };

  const handleClearLine = (index: unknown) => {
    const newLines = [...lines];
    newLines[index] = { account_id: "", line_description: "", amount: "" };
    onChange(newLines);
  };

  const handleChange = (index: unknown, field: unknown, value: unknown) => {
    const newLines = [...lines];
    newLines[index] = { ...newLines[index], [field]: value };
    onChange(newLines);
  };

  const formatCurrency = (amount: unknown) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount || 0);
  };

  return (
    <div className="w-full mt-4">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-lg font-bold text-navy-700 ">Voucher Lines</h4>
        {!readOnly && (
          <button
            type="button"
            onClick={handleAddLine}
            className="flex items-center gap-1 bg-brand-500 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-brand-600 transition-colors"
          >
            <MdAdd className="h-4 w-4" /> Add Line
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200 ">
        <table className="min-w-full divide-y divide-gray-200 ">
          <thead className="bg-gray-50 ">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ">Account</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ">Line Description</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider ">Amount (LKR)</th>
              {!readOnly && <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider ">Actions</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200  ">
            {lines.length === 0 ? (
              <tr>
                <td colSpan={readOnly ? 3 : 4} className="px-6 py-8 text-center text-gray-500 ">
                  No line items found. {!readOnly && "Click 'Add Line' to start."}
                </td>
              </tr>
            ) : (
              lines.map((line: unknown, index: unknown) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {readOnly ? (
                      <span className="text-sm text-gray-900 ">
                        {line.account?.account_code} - {line.account?.account_name}
                      </span>
                    ) : (
                      <select
                        value={line.account_id || ""}
                        onChange={(e: any) => handleChange(index, "account_id", Number(e.target.value))}
                        className="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 focus:outline-none focus:ring-brand-500 focus:border-brand-500 rounded-md   "
                        required
                      >
                        <option value="" disabled>Select Account</option>
                        {accounts.map((account: unknown) => (
                          <option key={account.id} value={account.id}>
                            {account.account_code} - {account.account_name}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {readOnly ? (
                      <span className="text-sm text-gray-900 ">{line.line_description}</span>
                    ) : (
                      <input
                        type="text"
                        value={line.line_description || ""}
                        onChange={(e: any) => handleChange(index, "line_description", e.target.value)}
                        className="block w-full px-3 py-2 text-sm border-gray-300 focus:ring-brand-500 focus:border-brand-500 rounded-md   "
                        placeholder="Description"
                        required
                      />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    {readOnly ? (
                      <span className="text-sm text-gray-900  font-medium">{formatCurrency(line.amount)}</span>
                    ) : (
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={line.amount || ""}
                        onChange={(e: any) => handleChange(index, "amount", parseFloat(e.target.value))}
                        className="block w-full px-3 py-2 text-sm border-gray-300 focus:ring-brand-500 focus:border-brand-500 rounded-md    text-right"
                        placeholder="0.00"
                        required
                      />
                    )}
                  </td>
                  {!readOnly && (
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleClearLine(index)}
                          className="p-1.5 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-md transition-colors "
                          title="Clear Line"
                        >
                          <MdClear className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(index)}
                          className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors "
                          title="Remove Line"
                        >
                          <MdDelete className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PettyCashLinesTable;
