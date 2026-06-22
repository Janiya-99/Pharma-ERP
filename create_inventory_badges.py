import os

os.makedirs("frontend/src/components/inventory", exist_ok=True)

badges = {
    "WarehouseTypeBadge.jsx": """import React from "react";
import Badge from "../common/Badge";

const WarehouseTypeBadge = ({ type }) => {
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
""",
    "StorageConditionBadge.jsx": """import React from "react";
import Badge from "../common/Badge";

const StorageConditionBadge = ({ condition }) => {
  const conditionMap = {
    normal: { label: "Normal", variant: "success" },
    cool: { label: "Cool", variant: "info" },
    cold_chain: { label: "Cold Chain", variant: "primary" },
    controlled_drug: { label: "Controlled Drug", variant: "warning" },
    hazardous: { label: "Hazardous", variant: "danger" },
    quarantine: { label: "Quarantine", variant: "danger" },
  };

  const config = conditionMap[condition] || { label: condition || "Unknown", variant: "gray" };

  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export default StorageConditionBadge;
""",
    "ProductTypeBadge.jsx": """import React from "react";
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
""",
    "BatchStatusBadge.jsx": """import React from "react";
import Badge from "../common/Badge";

const BatchStatusBadge = ({ status }) => {
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
""",
    "ExpiryStatusBadge.jsx": """import React from "react";
import Badge from "../common/Badge";

const ExpiryStatusBadge = ({ status }) => {
  const statusMap = {
    valid: { label: "Valid", variant: "success" },
    near_expiry: { label: "Near Expiry", variant: "warning" },
    expired: { label: "Expired", variant: "danger" },
  };

  const config = statusMap[status] || { label: status || "Unknown", variant: "gray" };

  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export default ExpiryStatusBadge;
""",
    "StockQuantityDisplay.jsx": """import React from "react";

const StockQuantityDisplay = ({ quantity, unit = "" }) => {
  if (quantity === undefined || quantity === null) return <span className="text-gray-400">-</span>;
  
  const formattedQuantity = Number(quantity).toLocaleString("en-US", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });

  return (
    <div className="text-right tabular-nums whitespace-nowrap">
      <span className="font-medium text-navy-700 dark:text-white">{formattedQuantity}</span>
      {unit && <span className="text-xs text-gray-500 ml-1">{unit}</span>}
    </div>
  );
};

export default StockQuantityDisplay;
""",
    "StockValueDisplay.jsx": """import React from "react";

const StockValueDisplay = ({ value }) => {
  if (value === undefined || value === null) return <span className="text-gray-400">-</span>;
  
  const formattedValue = Number(value).toLocaleString("en-US", {
    style: "currency",
    currency: "LKR",
  });

  return (
    <div className="text-right tabular-nums whitespace-nowrap font-medium text-navy-700 dark:text-white">
      {formattedValue}
    </div>
  );
};

export default StockValueDisplay;
"""
}

for filename, content in badges.items():
    with open(os.path.join("frontend/src/components/inventory", filename), "w") as f:
        f.write(content)

