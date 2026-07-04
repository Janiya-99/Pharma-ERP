
const StockAdjustmentTypeBadge = ({ type }: { type?: unknown }) => {
  let bgColor = "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  let display = type;

  switch (type) {
    case "positive":
      bgColor = "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      display = "Positive";
      break;
    case "negative":
      bgColor = "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      display = "Negative";
      break;
    case "mixed":
      bgColor = "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400";
      display = "Mixed";
      break;
    case "physical_count":
      bgColor = "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      display = "Physical Count";
      break;
    case "damage":
      bgColor = "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400";
      display = "Damage";
      break;
    case "expiry":
      bgColor = "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      display = "Expiry";
      break;
    case "correction":
      bgColor = "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
      display = "Correction";
      break;
    default:
      if (type) {
        display = type.replace(/_/g, " ").replace(/\b\w/g, (l: unknown) => l.toUpperCase());
      }
      break;
  }

  return (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${bgColor}`}>
      {display || "Unknown"}
    </span>
  );
};

export default StockAdjustmentTypeBadge;
