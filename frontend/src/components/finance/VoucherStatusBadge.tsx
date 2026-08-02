
const getStatusConfig = (status: unknown) => {
  switch (status?.toLowerCase()) {
    case "draft":
      return { label: "Draft", className: "bg-gray-100 text-gray-800" };
    case "pending":
      return { label: "Pending", className: "bg-yellow-100 text-yellow-800" };
    case "approved":
      return { label: "Approved", className: "bg-green-100 text-green-800" };
    case "rejected":
      return { label: "Rejected", className: "bg-red-100 text-red-800" };
    case "cancelled":
      return { label: "Cancelled", className: "bg-gray-200 text-gray-900" };
    default:
      return { label: status || "Unknown", className: "bg-gray-100 text-gray-600" };
  }
};

export default function VoucherStatusBadge({ status }: { status?: unknown }) {
  const config = getStatusConfig(status);

  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${config.className}`}>
      {config.label}
    </span>
  );
}
