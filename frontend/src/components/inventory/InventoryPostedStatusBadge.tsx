
const InventoryPostedStatusBadge = ({ status }: { status?: unknown }) => {
  const isPosted = status?.toLowerCase() === "posted";

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
        isPosted
          ? "bg-emerald-100 text-emerald-800  "
          : "bg-gray-100 text-gray-800  "
      }`}
    >
      {isPosted ? "Posted" : "Unposted"}
    </span>
  );
};

export default InventoryPostedStatusBadge;
