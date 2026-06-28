import React from "react";
import { Input } from "../ui/input";

interface Props {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const SalesInvoiceLineBatchSelect: React.FC<Props> = ({ value, onChange, disabled }) => {
  // Fallback simple input since Invoice Center-safe batch lookup is not confirmed
  return (
    <div>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Batch ID"
        className="w-full"
      />
    </div>
  );
};
