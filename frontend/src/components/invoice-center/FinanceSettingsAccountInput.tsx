import React from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';

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
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </Label>
        {!required && (
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-gray-300 text-gray-500">
            Optional
          </Badge>
        )}
      </div>
      <p className="text-xs text-gray-500">{description}</p>
      <Input
        type="number"
        min={1}
        placeholder="Enter Account ID"
        value={value ?? ''}
        onChange={(e) => {
          const val = e.target.value;
          onChange(val ? parseInt(val, 10) : null);
        }}
        className={`max-w-xs ${error ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default FinanceSettingsAccountInput;
