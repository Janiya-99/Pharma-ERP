import React, { useState, useEffect } from "react";
import { Input } from "components/ui/input";

interface Props {
  value: number | string;
  onChange: (value: number | string) => void;
  availableQuantity?: number | null;
  disabled?: boolean;
}

export const ReturnQuantityInput: React.FC<Props> = ({
  value,
  onChange,
  availableQuantity,
  disabled,
}) => {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (
      value &&
      availableQuantity !== undefined &&
      availableQuantity !== null
    ) {
      const numValue = Number(value);
      if (numValue > availableQuantity) {
        setError(`Exceeds available stock (${availableQuantity.toFixed(3)})`);
      } else {
        setError(null);
      }
    } else {
      setError(null);
    }
  }, [value, availableQuantity]);

  return (
    <div className="relative flex flex-col">
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        min="0"
        step="0.001"
        className={`w-full text-right ${
          error ? "border-red-500 focus-visible:ring-red-500" : ""
        }`}
       placeholder="Enter value" />
      {error && (
        <span className="absolute -bottom-5 right-0 z-10 whitespace-nowrap rounded border border-red-100 bg-white px-1 text-[10px] text-red-600 shadow-sm">
          {error}
        </span>
      )}
    </div>
  );
};
