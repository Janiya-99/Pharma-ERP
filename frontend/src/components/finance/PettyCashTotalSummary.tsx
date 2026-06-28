
const PettyCashTotalSummary = ({ totalAmount, currentFundBalance, voucherType }: { totalAmount?: unknown; currentFundBalance?: unknown; voucherType?: unknown }) => {
  const formatCurrency = (amount: unknown) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(amount || 0);
  };

  const isDeduction = voucherType === "expense" || voucherType === "advance";
  const projectedBalance = isDeduction 
    ? (currentFundBalance || 0) - (totalAmount || 0) 
    : (currentFundBalance || 0) + (totalAmount || 0);
    
  const isOverdrawn = isDeduction && totalAmount > currentFundBalance;

  return (
    <div className="mt-6 flex flex-col items-end space-y-4">
      <div className="w-full max-w-sm rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-navy-700 dark:bg-navy-800">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 dark:border-navy-600">
          <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Voucher Amount</span>
          <span className="text-lg font-bold text-navy-700 dark:text-white">{formatCurrency(totalAmount)}</span>
        </div>
        
        {currentFundBalance !== undefined && (
          <div className="flex items-center justify-between pt-3 pb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Current Fund Balance</span>
            <span className="text-sm font-medium text-navy-700 dark:text-white">{formatCurrency(currentFundBalance)}</span>
          </div>
        )}

        {currentFundBalance !== undefined && (
          <div className="flex items-center justify-between pt-1">
            <span className="text-sm text-gray-500 dark:text-gray-400">Projected Balance</span>
            <span className={`text-sm font-bold ${isOverdrawn ? 'text-red-500' : 'text-green-500'}`}>
              {formatCurrency(projectedBalance)}
            </span>
          </div>
        )}
      </div>
      
      {isOverdrawn && (
        <div className="w-full max-w-sm rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800/30">
          <strong>Warning:</strong> Total amount exceeds current fund balance.
        </div>
      )}
    </div>
  );
};

export default PettyCashTotalSummary;
