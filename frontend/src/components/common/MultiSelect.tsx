import React, { useState, useEffect, useRef } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";

const MultiSelect = ({
  options = [],
  selectedValues = [],
  onChange,
  placeholder = "Select options...",
  displayKey = "name",
  valueKey = "id",
}: {
  options?: any[];
  selectedValues?: any[];
  onChange?: (values: any[]) => void;
  placeholder?: string;
  displayKey?: string;
  valueKey?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: any) => {
    const isSelected = selectedValues.some(
      (v: any) => v[valueKey] === option[valueKey]
    );
    if (isSelected) {
      onChange?.(
        selectedValues.filter((v: any) => v[valueKey] !== option[valueKey])
      );
    } else {
      onChange?.([...selectedValues, option]);
    }
  };

  const handleRemove = (e: any, option: any) => {
    e.stopPropagation();
    onChange?.(
      selectedValues.filter((v: any) => v[valueKey] !== option[valueKey])
    );
  };

  const filteredOptions = options.filter((option: any) =>
    option[displayKey]?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div
        className="flex min-h-[42px] w-full cursor-text flex-wrap items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 transition-shadow focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500"
        onClick={() => setIsOpen(true)}
      >
        {selectedValues.length === 0 && !searchTerm && (
          <span className="select-none text-sm text-gray-500">
            {placeholder}
          </span>
        )}

        {selectedValues.map((selected: any) => (
          <span
            key={selected[valueKey]}
            className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800"
          >
            {selected[displayKey]}
            <button
              type="button"
              className="rounded-full p-0.5 hover:bg-blue-200 focus:outline-none"
              onClick={(e: any) => handleRemove(e, selected)}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        <input
          type="text"
          className="min-w-[60px] flex-1 border-none bg-transparent p-0 text-sm outline-none focus:ring-0"
          value={searchTerm}
          onChange={(e: any) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onClick={() => setIsOpen(true)}
        />

        <div className="ml-auto flex items-center">
          <ChevronsUpDown
            className="h-4 w-4 cursor-pointer text-gray-400"
            onClick={() => setIsOpen(!isOpen)}
          />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
          {filteredOptions.length === 0 ? (
            <div className="px-4 py-2 text-sm text-gray-500">
              No options found.
            </div>
          ) : (
            filteredOptions.map((option: any) => {
              const isSelected = selectedValues.some(
                (v: any) => v[valueKey] === option[valueKey]
              );
              return (
                <div
                  key={option[valueKey]}
                  className={`relative cursor-pointer select-none py-2 pl-10 pr-4 hover:bg-blue-50 ${
                    isSelected ? "bg-blue-50/50" : ""
                  }`}
                  onClick={() => handleSelect(option)}
                >
                  <span
                    className={`block truncate ${
                      isSelected ? "font-medium text-blue-900" : "font-normal"
                    }`}
                  >
                    {option[displayKey]}
                  </span>
                  {isSelected && (
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                      <Check className="h-4 w-4" />
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
