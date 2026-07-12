
const PettyCashStatusBadge = ({ status }: { status?: unknown }) => {
  let badgeStyle = "";
  let label = status;

  switch (status) {
    case "draft":
      badgeStyle = "bg-gray-100 text-gray-700   border-gray-200 ";
      label = "Draft";
      break;
    case "pending":
      badgeStyle = "bg-yellow-100 text-yellow-700   border-yellow-200 ";
      label = "Pending";
      break;
    case "approved":
      badgeStyle = "bg-green-100 text-green-700   border-green-200 ";
      label = "Approved";
      break;
    case "rejected":
      badgeStyle = "bg-red-100 text-red-700   border-red-200 ";
      label = "Rejected";
      break;
    case "cancelled":
      badgeStyle = "bg-slate-100 text-slate-700   border-slate-300 ";
      label = "Cancelled";
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

export default PettyCashStatusBadge;
