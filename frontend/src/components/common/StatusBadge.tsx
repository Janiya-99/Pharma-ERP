
type StatusVariant = "active" | "inactive" | "suspended" | "locked" | "approved" | "rejected" | "pending" | "posted" | "draft" | string;

const StatusBadge = ({ status }: { status?: StatusVariant }) => {
  const getConfig = (s: string) => {
    switch (s?.toLowerCase()) {
      case "active":
      case "approved":
      case "posted":
        return {
          container: "bg-emerald-50 text-emerald-700 border border-emerald-100",
          dot: "bg-emerald-500",
        };
      case "inactive":
      case "draft":
        return {
          container: "bg-slate-100 text-slate-600 border border-slate-200",
          dot: "bg-slate-400",
        };
      case "suspended":
      case "pending":
        return {
          container: "bg-amber-50 text-amber-700 border border-amber-100",
          dot: "bg-amber-500",
        };
      case "locked":
      case "rejected":
        return {
          container: "bg-rose-50 text-rose-700 border border-rose-100",
          dot: "bg-rose-500",
        };
      default:
        return {
          container: "bg-slate-100 text-slate-600 border border-slate-200",
          dot: "bg-slate-400",
        };
    }
  };

  const label = status
    ? String(status).charAt(0).toUpperCase() + String(status).slice(1).toLowerCase()
    : "Unknown";

  const config = getConfig(String(status));

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide ${config.container}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
      {label}
    </span>
  );
};

export default StatusBadge;
