import React from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

type SalesOrderLineBatchSelectProps = {
  value: number | null;
  onChange: (value: number | null) => void;
  disabled?: boolean;
};

const SalesOrderLineBatchSelect: React.FC<SalesOrderLineBatchSelectProps> = ({
  value,
  onChange,
  disabled,
}) => {
  return (
    <div className="space-y-1">
      <Label>Batch ID</Label>
      <Input
        type="number"
        min={1}
        value={value ?? ""}
        disabled={disabled}
        onChange={(event) =>
          onChange(event.target.value ? Number(event.target.value) : null)
        }
        placeholder="Optional batch ID"
      />
    </div>
  );
};

export default SalesOrderLineBatchSelect;
