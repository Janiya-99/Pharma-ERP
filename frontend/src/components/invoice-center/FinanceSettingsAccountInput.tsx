import React from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";

interface Props {
  label: string;
  description: string;
  value: number | null | undefined;
  onChange: (value: number | null) => void;
  required?: boolean;
  error?: string;
}

export const FinanceSettingsAccountInput: React.FC<Props> = ({
  label,
  description,
  value,
  onChange,
  required = false,
  error,
}) => {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </Label>
        {!required && (
          <Badge
            variant="outline"
            className="h-4 border-gray-300 px-1.5 py-0 text-[10px] text-gray-500"
          >
            Optional
          </Badge>
        )}
      </div>
      <p className="text-xs text-gray-500">{description}</p>
      <Input
        type="number"
        min={1}
        placeholder="Enter Account ID"
        value={value ?? ""}
        onChange={(e) => {
          const val = e.target.value;
          onChange(val ? parseInt(val, 10) : null);
        }}
        className={`max-w-xs ${
          error ? "border-red-400 focus-visible:ring-red-400" : ""
        }`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default FinanceSettingsAccountInput;
