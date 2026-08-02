
const StockAdjustmentStatusBadge = ({ status }: { status?: unknown }) => {
  let bgColor = "bg-gray-100 text-gray-800  ";

  switch (status) {
    case "draft":
      bgColor = "bg-gray-100 text-gray-800  ";
      break;
    case "pending":
      bgColor = "bg-yellow-100 text-yellow-800  ";
      break;
    case "approved":
      bgColor = "bg-green-100 text-green-800  ";
      break;
    case "rejected":
      bgColor = "bg-red-100 text-red-800  ";
      break;
    case "cancelled":
      bgColor = "bg-slate-100 text-slate-800  ";
      break;
    default:
      break;
  }

  return (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${bgColor}`}>
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown"}
    </span>
  );
};

export default StockAdjustmentStatusBadge;
