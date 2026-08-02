import Badge from "../common/Badge";

const BatchStatusBadge = ({ status }: { status?: unknown }) => {
  const statusMap = {
    active: { label: "Active", variant: "success" },
    near_expiry: { label: "Near Expiry", variant: "warning" },
    expired: { label: "Expired", variant: "danger" },
    blocked: { label: "Blocked", variant: "danger" },
    recalled: { label: "Recalled", variant: "purple" },
    disposed: { label: "Disposed", variant: "gray" },
    inactive: { label: "Inactive", variant: "gray" },
  };

  const config = statusMap[status] || { label: status || "Unknown", variant: "gray" };

  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export default BatchStatusBadge;
