import { MdAdd, MdDelete, MdClear } from "react-icons/md";
import JournalLineAccountSelect from "../../../../components/finance/JournalLineAccountSelect";

export default function VoucherLinesTable({ lines, setLines, disabled }: { lines?: unknown; setLines?: unknown; disabled?: unknown }) {
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

  const totalAmount = lines.reduce((sum: unknown, line: unknown) => sum + (Number(line.amount) || 0), 0);

  return (
    <div className="space-y-4">
      <div className="bg-white  rounded-xl shadow-sm border border-gray-100  overflow-hidden">
        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 ">
          <h3 className="text-lg font-medium text-navy-800 ">Line Items</h3>
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
            <thead className="bg-gray-50  text-gray-500  font-semibold border-b border-gray-200 ">
              <tr>
                <th className="px-4 py-3 w-1/3">Account</th>
                <th className="px-4 py-3">Line Description</th>
                <th className="px-4 py-3 w-40 text-right">Amount</th>
                <th className="px-4 py-3 w-24 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 ">
              {lines.map((line: unknown, index: unknown) => (
                <tr key={index} className="hover:bg-gray-50 ">
                  <td className="px-4 py-2">
                    <JournalLineAccountSelect
                      value={line.account_id}
                      onChange={(val: unknown) => updateLine(index, "account_id", val)}
                      disabled={disabled}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      value={line.line_description}
                      onChange={(e: any) => updateLine(index, "line_description", e.target.value)}
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
                      value={line.amount || ""}
                      onChange={(e: any) => updateLine(index, "amount", parseFloat(e.target.value) || 0)}
                      disabled={disabled}
                      placeholder="0.00"
                      className="w-full px-3 py-2 text-right border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-navy-500"
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
          <div className="bg-gray-50 border rounded-md p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 font-medium text-lg">Total Amount</span>
              <span className="text-xl font-bold text-gray-900">
                {new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(totalAmount || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
