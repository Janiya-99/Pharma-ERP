
const formatSourceType = (type: unknown) => {
  if (!type) return '';
  return type.split('_').map((word: unknown) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const SourceTypeBadge = ({ type }: { type?: unknown }) => {
  const colors = {
    opening_balance: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    journal_entry: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400",
    payment_voucher: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    receipt_voucher: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    petty_cash_voucher: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
    fixed_asset_depreciation: "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300",
  };
  
  const colorClass = colors[type] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${colorClass}`}>
      {formatSourceType(type)}
    </span>
  );
};
export default SourceTypeBadge;
