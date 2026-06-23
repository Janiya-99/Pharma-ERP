import React, { useState, useEffect, useRef } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";

const MultiSelect = ({ 
  options = [], 
  selectedValues = [], 
  onChange, 
  placeholder = "Select options...",
  displayKey = "name",
  valueKey = "id"
}: { options?: unknown; selectedValues?: unknown; onChange?: unknown; placeholder?: unknown; displayKey?: unknown; valueKey?: unknown }) => {
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

  const handleSelect = (option: unknown) => {
    const isSelected = selectedValues.some((v: unknown) => v[valueKey] === option[valueKey]);
    if (isSelected) {
      onChange(selectedValues.filter((v: unknown) => v[valueKey] !== option[valueKey]));
    } else {
      onChange([...selectedValues, option]);
    }
  };

  const handleRemove = (e: any, option: unknown) => {
    e.stopPropagation();
    onChange(selectedValues.filter((v: unknown) => v[valueKey] !== option[valueKey]));
  };

  const filteredOptions = options.filter((option: unknown) => 
    option[displayKey]?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div 
        className="min-h-[42px] w-full flex flex-wrap items-center gap-2 px-3 py-2 border border-gray-300 rounded-md bg-white cursor-text focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 transition-shadow"
        onClick={() => setIsOpen(true)}
      >
        {selectedValues.length === 0 && !searchTerm && (
          <span className="text-gray-500 text-sm select-none">{placeholder}</span>
        )}
        
        {selectedValues.map((selected: unknown) => (
          <span 
            key={selected[valueKey]} 
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
          >
            {selected[displayKey]}
            <button
              type="button"
              className="hover:bg-blue-200 rounded-full p-0.5 focus:outline-none"
              onClick={(e: any) => handleRemove(e, selected)}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        <input
          type="text"
          className="flex-1 min-w-[60px] bg-transparent outline-none border-none p-0 text-sm focus:ring-0"
          value={searchTerm}
          onChange={(e: any) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onClick={() => setIsOpen(true)}
        />
        
        <div className="ml-auto flex items-center">
          <ChevronsUpDown className="h-4 w-4 text-gray-400 cursor-pointer" onClick={() => setIsOpen(!isOpen)} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {filteredOptions.length === 0 ? (
            <div className="px-4 py-2 text-sm text-gray-500">No options found.</div>
          ) : (
            filteredOptions.map((option: unknown) => {
              const isSelected = selectedValues.some((v: unknown) => v[valueKey] === option[valueKey]);
              return (
                <div
                  key={option[valueKey]}
                  className={`cursor-pointer select-none relative py-2 pl-10 pr-4 hover:bg-blue-50 ${isSelected ? 'bg-blue-50/50' : ''}`}
                  onClick={() => handleSelect(option)}
                >
                  <span className={`block truncate ${isSelected ? 'font-medium text-blue-900' : 'font-normal'}`}>
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
