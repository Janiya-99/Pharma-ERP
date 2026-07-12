
const ProfitLossBadge = ({ amount }: { amount?: unknown }) => {
  if (amount > 0) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800  ">
        Net Profit
      </span>
    );
  }
  if (amount < 0) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800  ">
        Net Loss
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800  ">
      Break-even
    </span>
  );
};
export default ProfitLossBadge;
