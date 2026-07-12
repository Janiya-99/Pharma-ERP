
const ReportAmountCell = ({ amount, className = "" }: { amount?: unknown; className?: unknown }) => {
  if (amount === undefined || amount === null || amount === 0) {
    return <div className={`text-right text-gray-400  ${className}`}>-</div>;
  }
  const formatted = new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(amount);
  return <div className={`text-right font-medium ${className}`}>{formatted}</div>;
};
export default ReportAmountCell;
