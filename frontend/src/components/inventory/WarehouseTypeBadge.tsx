import Badge from "../common/Badge";

const WarehouseTypeBadge = ({ type }: { type?: unknown }) => {
  const typeMap = {
    main: { label: "Main", variant: "primary" },
    secondary: { label: "Secondary", variant: "info" },
    cold_storage: { label: "Cold Storage", variant: "warning" },
    quarantine: { label: "Quarantine", variant: "danger" },
    damaged: { label: "Damaged", variant: "danger" },
    expired: { label: "Expired", variant: "danger" },
    return: { label: "Return", variant: "warning" },
  };

  const config = typeMap[type] || { label: type || "Unknown", variant: "gray" };

  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export default WarehouseTypeBadge;
