import React from "react";
import { Input } from "../ui/input";

interface Props {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const SalesInvoiceLineProductSelect: React.FC<Props> = ({ value, onChange, disabled }) => {
  // Fallback simple input since Invoice Center-safe product lookup is not confirmed
  return (
    <div>
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="Product ID"
        className="w-full"
      />
    </div>
  );
};
