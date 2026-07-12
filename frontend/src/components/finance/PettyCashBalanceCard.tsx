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
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 ">
          <span className="text-xl text-indigo-500 ">OB</span>
        </div>
        <div className="ml-4">
          <p className="font-medium text-gray-500 ">Opening Balance</p>
          <h4 className="text-xl font-bold text-navy-700 ">
            {formatCurrency(openingBalance)}
          </h4>
        </div>
      </Card>

      <Card extra={`!flex-row flex-grow items-center rounded-xl p-4 ${isLowBalance ? 'border-2 border-red-500' : ''}`}>
        <div className={`flex h-14 w-14 items-center justify-center rounded-full ${isLowBalance ? 'bg-red-50 ' : 'bg-green-50 '}`}>
          <span className={`text-xl ${isLowBalance ? 'text-red-500' : 'text-green-500 '}`}>CB</span>
        </div>
        <div className="ml-4">
          <p className="font-medium text-gray-500 ">Current Balance</p>
          <h4 className={`text-xl font-bold ${isLowBalance ? 'text-red-600 ' : 'text-navy-700 '}`}>
            {formatCurrency(currentBalance)}
          </h4>
        </div>
      </Card>

      <Card extra="!flex-row flex-grow items-center rounded-xl p-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-50 ">
          <span className="text-xl text-orange-500 ">FL</span>
        </div>
        <div className="ml-4">
          <p className="font-medium text-gray-500 ">Fund Limit</p>
          <h4 className="text-xl font-bold text-navy-700 ">
            {formatCurrency(fundLimit)}
          </h4>
        </div>
      </Card>

      <Card extra="!flex-row flex-grow items-center rounded-xl p-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-50 ">
          <span className="text-xl text-purple-500 ">AL</span>
        </div>
        <div className="ml-4">
          <p className="font-medium text-gray-500 ">Available Limit</p>
          <h4 className="text-xl font-bold text-navy-700 ">
            {formatCurrency(availableLimit)}
          </h4>
        </div>
      </Card>
    </div>
  );
};

export default PettyCashBalanceCard;
