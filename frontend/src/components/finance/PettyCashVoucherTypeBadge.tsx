
const PettyCashVoucherTypeBadge = ({ type }: { type?: unknown }) => {
  let badgeStyle = "";
  let label = type;

  switch (type) {
    case "expense":
      badgeStyle = "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 border-orange-200 dark:border-orange-800";
      label = "Expense";
      break;
    case "advance":
      badgeStyle = "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800";
      label = "Advance";
      break;
    case "refund":
      badgeStyle = "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800";
      label = "Refund";
      break;
    case "adjustment":
      badgeStyle = "bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-300 border-gray-200 dark:border-gray-700";
      label = "Adjustment";
      break;
    default:
      badgeStyle = "bg-gray-100 text-gray-700 border-gray-200";
  }

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${badgeStyle}`}>
      {label}
    </span>
  );
};

export default PettyCashVoucherTypeBadge;
