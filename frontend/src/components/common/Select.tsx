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
}: { label?: unknown; value?: unknown; onChange?: unknown; name?: unknown; options?: unknown; placeholder?: unknown; searchable?: unknown; disabled?: unknown; required?: unknown; className?: unknown; error?: unknown }) => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleSelectChange = (val: unknown) => {
    if (onChange) {
      onChange({
        target: {
          name: name,
          value: val,
        },
      });
    }
  };

  const selectedOption = options.find((opt: unknown) => String(opt.value) === String(value));
  const filteredOptions = searchable
    ? options.filter((opt: unknown) =>
        String(opt.label).toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  if (searchable) {
    return (
      <div className={`flex flex-col gap-1 w-full ${className}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
        )}
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild disabled={disabled}>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-1.5 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-900 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed h-[38px] transition-colors"
            >
              <span className={selectedOption ? "text-gray-900 truncate" : "text-gray-400 truncate"}>
                {selectedOption ? selectedOption.label : placeholder}
              </span>
              <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
            </button>
          </PopoverTrigger>
          <PopoverContent className="p-0 bg-white border border-gray-200 shadow-lg rounded-md z-50 w-[var(--radix-popover-trigger-width)]">
            <div className="flex items-center border-b border-gray-100 px-3 py-2 bg-gray-50/50">
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
                filteredOptions.map((opt: unknown) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      handleSelectChange(opt.value);
                      setOpen(false);
                      setSearchTerm("");
                    }}
                    className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors"
                  >
                    <span className="truncate">{opt.label}</span>
                    {String(value) === String(opt.value) && (
                      <Check className="h-4 w-4 text-blue-600 shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>
        {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
      </div>
    );
  }

  return (
    <div className={`flex flex-col gap-1 w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <ShadcnSelect
        value={value ? String(value) : undefined}
        onValueChange={handleSelectChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-full bg-white border border-gray-300 focus:ring-2 focus:ring-blue-900 rounded-md text-sm text-left py-2 px-3 flex justify-between items-center text-gray-900 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed h-[38px] transition-colors">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="bg-white border border-gray-200 shadow-md rounded-md z-50 max-h-60 overflow-y-auto">
          {options.map((opt: unknown) => (
            <SelectItem
              key={opt.value}
              value={String(opt.value)}
              className="hover:bg-blue-50 focus:bg-blue-50 cursor-pointer text-gray-900"
            >
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </ShadcnSelect>
      {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
  );
};

export default Select;
