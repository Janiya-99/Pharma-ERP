import Card from "../../components/card";

const PettyCashBalanceCard = ({ fund }: { fund?: unknown }) => {
  if (!fund) return null;

  const openingBalance = parseFloat(fund.opening_balance) || 0;
  const currentBalance = parseFloat(fund.current_balance) || 0;
  const fundLimit = parseFloat(fund.fund_limit) || 0;
  const availableLimit = fundLimit - currentBalance;

  const formatCurrency = (amount: unknown) => {
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const isLowBalance = currentBalance < (fundLimit * 0.2);

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-4 lg:grid-cols-4 2xl:grid-cols-4 mb-6">
      <Card extra="!flex-row flex-grow items-center rounded-xl p-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 dark:bg-navy-700">
          <span className="text-xl text-blue-500 dark:text-white">OB</span>
        </div>
        <div className="ml-4">
          <p className="font-medium text-gray-500 dark:text-gray-400">Opening Balance</p>
          <h4 className="text-xl font-bold text-navy-700 dark:text-white">
            {formatCurrency(openingBalance)}
          </h4>
        </div>
      </Card>

      <Card extra={`!flex-row flex-grow items-center rounded-xl p-4 ${isLowBalance ? 'border-2 border-red-500' : ''}`}>
        <div className={`flex h-14 w-14 items-center justify-center rounded-full ${isLowBalance ? 'bg-red-50 dark:bg-red-900/30' : 'bg-green-50 dark:bg-navy-700'}`}>
          <span className={`text-xl ${isLowBalance ? 'text-red-500' : 'text-green-500 dark:text-white'}`}>CB</span>
        </div>
        <div className="ml-4">
          <p className="font-medium text-gray-500 dark:text-gray-400">Current Balance</p>
          <h4 className={`text-xl font-bold ${isLowBalance ? 'text-red-600 dark:text-red-400' : 'text-navy-700 dark:text-white'}`}>
            {formatCurrency(currentBalance)}
          </h4>
        </div>
      </Card>

      <Card extra="!flex-row flex-grow items-center rounded-xl p-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 dark:bg-navy-700">
          <span className="text-xl text-orange-500 dark:text-white">FL</span>
        </div>
        <div className="ml-4">
          <p className="font-medium text-gray-500 dark:text-gray-400">Fund Limit</p>
          <h4 className="text-xl font-bold text-navy-700 dark:text-white">
            {formatCurrency(fundLimit)}
          </h4>
        </div>
      </Card>

      <Card extra="!flex-row flex-grow items-center rounded-xl p-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-50 dark:bg-navy-700">
          <span className="text-xl text-purple-500 dark:text-white">AL</span>
        </div>
        <div className="ml-4">
          <p className="font-medium text-gray-500 dark:text-gray-400">Available Limit</p>
          <h4 className="text-xl font-bold text-navy-700 dark:text-white">
            {formatCurrency(availableLimit)}
          </h4>
        </div>
      </Card>
    </div>
  );
};

export default PettyCashBalanceCard;
