import React from "react";
import Badge from "../common/Badge";

const StorageConditionBadge = ({ condition }: { condition?: unknown }) => {
  const conditionMap = {
    normal: { label: "Normal", variant: "success" },
    cool: { label: "Cool", variant: "info" },
    cold_chain: { label: "Cold Chain", variant: "primary" },
    controlled_drug: { label: "Controlled Drug", variant: "warning" },
    hazardous: { label: "Hazardous", variant: "danger" },
    quarantine: { label: "Quarantine", variant: "danger" },
  };

  const config = conditionMap[condition] || {
    label: condition || "Unknown",
    variant: "gray",
  };

  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export default StorageConditionBadge;
