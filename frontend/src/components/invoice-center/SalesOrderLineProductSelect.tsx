import React from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

type SalesOrderLineProductSelectProps = {
  value: number | null;
  onChange: (value: number | null) => void;
  disabled?: boolean;
};

const SalesOrderLineProductSelect: React.FC<SalesOrderLineProductSelectProps> = ({ value, onChange, disabled }) => {
  return (
    <div className="space-y-1">
      <Label>Product ID</Label>
      <Input
        type="number"
        min={1}
        value={value ?? ""}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value ? Number(event.target.value) : null)}
        placeholder="Enter product ID"
      />
    </div>
  );
};

export default SalesOrderLineProductSelect;
