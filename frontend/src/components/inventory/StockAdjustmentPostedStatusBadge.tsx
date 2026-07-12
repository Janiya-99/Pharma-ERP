
const StockAdjustmentPostedStatusBadge = ({ status }: { status?: unknown }) => {
  let bgColor = "bg-gray-100 text-gray-800  ";

  if (status === "posted") {
    bgColor = "bg-green-100 text-green-800  ";
  }

  return (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${bgColor}`}>
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown"}
    </span>
  );
};

export default StockAdjustmentPostedStatusBadge;
