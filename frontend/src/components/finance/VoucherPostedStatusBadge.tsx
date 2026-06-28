
const getStatusConfig = (status: unknown) => {
  switch (status?.toLowerCase()) {
    case "unposted":
      return { label: "Unposted", className: "bg-gray-100 text-gray-800" };
    case "posted":
      return { label: "Posted", className: "bg-green-100 text-green-800" };
    default:
      return { label: status || "Unknown", className: "bg-gray-100 text-gray-600" };
  }
};

export default function VoucherPostedStatusBadge({ status }: { status?: unknown }) {
  const config = getStatusConfig(status);

  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${config.className}`}>
      {config.label}
    </span>
  );
}
