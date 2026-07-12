
const PettyCashPostedStatusBadge = ({ status }: { status?: unknown }) => {
  let badgeStyle = "";
  let label = status;

  switch (status) {
    case "unposted":
      badgeStyle = "bg-gray-100 text-gray-700   border-gray-200 ";
      label = "Unposted";
      break;
    case "posted":
      badgeStyle = "bg-green-100 text-green-700   border-green-200 ";
      label = "Posted";
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

export default PettyCashPostedStatusBadge;
