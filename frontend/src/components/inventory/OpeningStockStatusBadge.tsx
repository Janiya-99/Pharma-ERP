
const OpeningStockStatusBadge = ({ status }: { status?: unknown }) => {
  const statusMap = {
    draft: { label: "Draft", color: "bg-gray-100 text-gray-800  " },
    pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800  " },
    approved: { label: "Approved", color: "bg-green-100 text-green-800  " },
    rejected: { label: "Rejected", color: "bg-red-100 text-red-800  " },
    cancelled: { label: "Cancelled", color: "bg-slate-200 text-slate-800  " },
  };

  const currentStatus = statusMap[status?.toLowerCase()] || { label: status, color: "bg-gray-100 text-gray-800" };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${currentStatus.color}`}
    >
      {currentStatus.label}
    </span>
  );
};

export default OpeningStockStatusBadge;
