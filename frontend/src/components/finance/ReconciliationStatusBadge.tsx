
const ReconciliationStatusBadge = ({ status }: { status?: unknown }) => {
  const getBadgeClass = (status: unknown) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800  ";
      case "completed":
        return "bg-green-100 text-green-800  ";
      case "cancelled":
        return "bg-red-100 text-red-800  ";
      default:
        return "bg-gray-100 text-gray-800  ";
    }
  };

  const formattedStatus = status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown";

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getBadgeClass(status)}`}>
      {formattedStatus}
    </span>
  );
};

export default ReconciliationStatusBadge;
