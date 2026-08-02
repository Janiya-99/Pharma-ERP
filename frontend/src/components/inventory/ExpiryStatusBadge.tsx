import Badge from "../common/Badge";

const ExpiryStatusBadge = ({ status }: { status?: unknown }) => {
  const statusMap = {
    valid: { label: "Valid", variant: "success" },
    near_expiry: { label: "Near Expiry", variant: "warning" },
    expired: { label: "Expired", variant: "danger" },
  };

  const config = statusMap[status] || { label: status || "Unknown", variant: "gray" };

  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export default ExpiryStatusBadge;
