import React, { useState } from "react";
import {
  Select as ShadcnSelect,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Search, ChevronDown, Check } from "lucide-react";

const Select = ({
  label,
  value,
  onChange,
  name,
  options = [],
  placeholder = "Select option",
  searchable = false,
  disabled = false,
  required = false,
  className = "",
  error,
}: {
  label?: any;
  value?: any;
  onChange?: (e: any) => void;
  name?: any;
  options?: any[];
  placeholder?: string;
  searchable?: boolean;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  error?: any;
}) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSelectChange = (val: any) => {
    if (onChange) {
      onChange({
        target: {
          name: name,
          value: val,
        },
      });
    }
  };

  const selectedOption = options.find(
    (opt: any) => String(opt.value) === String(value)
  );
  const filteredOptions = searchable
    ? options.filter((opt: any) =>
        String(opt.label).toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  if (searchable) {
    return (
      <div className={`flex w-full flex-col gap-1 ${className}`}>
        {label && (
          <label className="text-slate-950 mb-1.5 block text-xs font-semibold">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild disabled={disabled}>
            <button
              type="button"
              className="border-slate-200 hover:bg-slate-50 focus:ring-slate-100/50 flex h-10 w-full items-center justify-between gap-1.5 rounded-xl border bg-white px-3.5 py-2.5 text-left text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500"
            >
              <span
                className={
                  selectedOption
                    ? "text-slate-900 truncate"
                    : "text-slate-400 truncate"
                }
              >
                {selectedOption ? selectedOption.label : placeholder}
              </span>
              <ChevronDown className="text-slate-400 h-4 w-4 shrink-0" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="z-50 w-[var(--radix-popover-trigger-width)] rounded-md border border-gray-200 bg-white p-0 shadow-lg">
            <div className="flex items-center border-b border-gray-100 bg-gray-50/50 px-3 py-2">
              <Search className="mr-2 h-4 w-4 shrink-0 text-gray-400" />
              <input
                className="flex w-full bg-transparent text-sm outline-none placeholder:text-gray-400 disabled:cursor-not-allowed"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e: any) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="max-h-60 overflow-y-auto p-1">
              {filteredOptions.length === 0 ? (
                <div className="py-6 text-center text-sm text-gray-500">
                  No option found.
                </div>
              ) : (
                filteredOptions.map((opt: any) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      handleSelectChange(opt.value);
                      setOpen(false);
                      setSearchTerm("");
                    }}
                    className="flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                  >
                    <span className="truncate">{opt.label}</span>
                    {String(value) === String(opt.value) && (
                      <Check className="h-4 w-4 shrink-0 text-blue-600" />
                    )}
                  </button>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>
        {error && <p className="mt-0.5 text-xs text-red-500">{error}</p>}
      </div>
    );
  }

  return (
    <div className={`flex w-full flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-slate-950 mb-1.5 block text-xs font-semibold">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <ShadcnSelect
        value={value ? String(value) : undefined}
        onValueChange={handleSelectChange}
        disabled={disabled}
      >
        <SelectTrigger className="border-slate-200 focus:ring-slate-100/50 text-slate-900 flex h-10 w-full items-center justify-between rounded-xl border bg-white px-3.5 py-2.5 text-left text-sm shadow-sm transition-colors focus:ring-2 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="z-50 max-h-60 overflow-y-auto rounded-md border border-gray-200 bg-white shadow-md">
          {options.map((opt: any) => (
            <SelectItem
              key={opt.value}
              value={String(opt.value)}
              className="cursor-pointer text-gray-900 hover:bg-blue-50 focus:bg-blue-50"
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </ShadcnSelect>
      {error && <p className="mt-0.5 text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default Select;
