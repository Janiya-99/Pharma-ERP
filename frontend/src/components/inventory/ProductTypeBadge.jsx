import React from "react";
import Badge from "../common/Badge";

const ProductTypeBadge = ({ type }) => {
  const typeMap = {
    medicine: { label: "Medicine", variant: "primary" },
    medical_device: { label: "Medical Device", variant: "info" },
    consumable: { label: "Consumable", variant: "warning" },
    supplement: { label: "Supplement", variant: "success" },
    other: { label: "Other", variant: "gray" },
  };

  const config = typeMap[type] || { label: type || "Unknown", variant: "gray" };

  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export default ProductTypeBadge;
