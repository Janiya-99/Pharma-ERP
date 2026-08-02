
const GRNStatusBadge = ({ status }: { status?: unknown }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800  ";
      case "pending":
        return "bg-yellow-100 text-yellow-800  ";
      case "approved":
        return "bg-green-100 text-green-800  ";
      case "rejected":
        return "bg-red-100 text-red-800  ";
      case "cancelled":
        return "bg-slate-100 text-slate-800  ";
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

export default GRNStatusBadge;
