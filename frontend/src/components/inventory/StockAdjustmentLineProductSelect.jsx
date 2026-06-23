import React, { useState, useEffect, useRef } from "react";
import { Search, Package, AlertCircle } from "lucide-react";

const StockAdjustmentLineProductSelect = ({
  value,
  onChange,
  products = [],
  error,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  const selectedProduct = products.find((p) => p.id === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredProducts = products.filter(
    (p) =>
      p.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.product_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (product) => {
    onChange(product);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3 py-2 text-left bg-white dark:bg-navy-900 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition-colors ${
          error
            ? "border-red-300 dark:border-red-500/50"
            : "border-gray-200 dark:border-navy-600"
        } ${disabled ? "opacity-60 cursor-not-allowed bg-gray-50 dark:bg-navy-800" : "hover:border-brand-300 dark:hover:border-navy-500"}`}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {selectedProduct ? (
            <>
              <div className="flex-shrink-0 w-6 h-6 rounded bg-brand-50 dark:bg-navy-800 flex items-center justify-center border border-brand-100 dark:border-navy-700">
                <Package className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
              </div>
              <div className="truncate">
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {selectedProduct.product_name}
                </span>
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                  {selectedProduct.product_code}
                </span>
              </div>
            </>
          ) : (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Select Product...
            </span>
          )}
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-[300px] mt-1 bg-white dark:bg-navy-800 border border-gray-100 dark:border-navy-700 rounded-xl shadow-lg shadow-brand-500/5 overflow-hidden">
          <div className="p-2 border-b border-gray-100 dark:border-navy-700 bg-gray-50/50 dark:bg-navy-800/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search product code or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-sm bg-white dark:bg-navy-900 border border-gray-200 dark:border-navy-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/50 dark:text-white"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-navy-600 p-1">
            {filteredProducts.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500 flex flex-col items-center gap-2">
                <AlertCircle className="w-5 h-5 text-gray-400" />
                <p>No products found</p>
              </div>
            ) : (
              filteredProducts.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelect(p)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors flex items-start gap-3 ${
                    value === p.id
                      ? "bg-brand-50 dark:bg-navy-700 border border-brand-100 dark:border-navy-600"
                      : "hover:bg-gray-50 dark:hover:bg-navy-700/50 border border-transparent"
                  }`}
                >
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 dark:bg-navy-900 flex items-center justify-center border border-gray-200 dark:border-navy-600">
                    <Package className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 dark:text-white truncate">
                      {p.product_name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                      <span className="font-mono bg-gray-100 dark:bg-navy-900 px-1.5 py-0.5 rounded text-[10px]">
                        {p.product_code}
                      </span>
                      <span className="truncate">{p.base_unit}</span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StockAdjustmentLineProductSelect;
