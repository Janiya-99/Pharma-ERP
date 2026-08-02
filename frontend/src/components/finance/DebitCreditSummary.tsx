
export default function DebitCreditSummary({ totalDebit, totalCredit }: { totalDebit?: unknown; totalCredit?: unknown }) {
  const difference = Math.abs(totalDebit - totalCredit);
  const isBalanced = totalDebit > 0 && totalDebit === totalCredit;

  const formatCurrency = (amount: unknown) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
    }).format(amount || 0);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
      <h3 className="text-lg font-medium text-navy-800 mb-4">Summary</h3>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total Debit:</span>
          <span className="font-semibold text-gray-900">{formatCurrency(totalDebit)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Total Credit:</span>
          <span className="font-semibold text-gray-900">{formatCurrency(totalCredit)}</span>
        </div>
        <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
          <span className="text-gray-800 font-medium">Status:</span>
          {isBalanced ? (
            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
              Balanced
            </span>
          ) : (
            <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
              Difference: {formatCurrency(difference)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
