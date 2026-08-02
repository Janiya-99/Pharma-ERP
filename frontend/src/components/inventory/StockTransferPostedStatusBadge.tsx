
const StockTransferPostedStatusBadge = ({ status }: { status?: unknown }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case "unposted":
        return "bg-gray-100 text-gray-800  ";
      case "posted":
        return "bg-green-100 text-green-800  ";
      default:
        return "bg-gray-100 text-gray-800  ";
    }
  };

  const getLabel = () => {
    if (!status) return "Unknown";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${getBadgeStyle()}`}>
      {getLabel()}
    </span>
  );
};

export default StockTransferPostedStatusBadge;
