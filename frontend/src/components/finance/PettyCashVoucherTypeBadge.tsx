
const PettyCashVoucherTypeBadge = ({ type }: { type?: unknown }) => {
  let badgeStyle = "";
  let label = type;

  switch (type) {
    case "expense":
      badgeStyle = "bg-orange-100 text-orange-700   border-orange-200 ";
      label = "Expense";
      break;
    case "advance":
      badgeStyle = "bg-indigo-100 text-indigo-700   border-indigo-200 ";
      label = "Advance";
      break;
    case "refund":
      badgeStyle = "bg-green-100 text-green-700   border-green-200 ";
      label = "Refund";
      break;
    case "adjustment":
      badgeStyle = "bg-gray-100 text-gray-700   border-gray-200 ";
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
