import React, { useState, useEffect, useRef } from "react";
import { Search, Package, AlertCircle } from "lucide-react";

const StockAdjustmentLineProductSelect = ({
  value,
  onChange,
  products = [],
  error,
  disabled = false,
}: {
  value?: unknown;
  onChange?: unknown;
  products?: unknown;
  error?: unknown;
  disabled?: unknown;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  const selectedProduct = products.find((p: unknown) => p.id === value);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredProducts = products.filter(
    (p: unknown) =>
      p.product_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.product_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (product: unknown) => {
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
        className={`flex w-full items-center justify-between rounded-lg border bg-white px-3 py-2 text-left transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/50 dark:bg-navy-900 ${
          error
            ? "border-red-300 dark:border-red-500/50"
            : "border-gray-200 dark:border-navy-600"
        } ${
          disabled
            ? "cursor-not-allowed bg-gray-50 opacity-60 dark:bg-navy-800"
            : "hover:border-brand-300 dark:hover:border-navy-500"
        }`}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {selectedProduct ? (
            <>
              <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded border border-brand-100 bg-brand-50 dark:border-navy-700 dark:bg-navy-800">
                <Package className="h-3.5 w-3.5 text-brand-600 dark:text-brand-400" />
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
        <div className="absolute z-50 mt-1 w-[300px] overflow-hidden rounded-xl border border-gray-100 bg-white shadow-lg shadow-brand-500/5 dark:border-navy-700 dark:bg-navy-800">
          <div className="border-b border-gray-100 bg-gray-50/50 p-2 dark:border-navy-700 dark:bg-navy-800/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search product code or name..."
                value={searchTerm}
                onChange={(e: any) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white py-1.5 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 dark:border-navy-600 dark:bg-navy-900 dark:text-white"
                autoFocus
              />
            </div>
          </div>
          <div className="scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-navy-600 max-h-60 overflow-y-auto p-1">
            {filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center gap-2 p-4 text-center text-sm text-gray-500">
                <AlertCircle className="h-5 w-5 text-gray-400" />
                <p>No products found</p>
              </div>
            ) : (
              filteredProducts.map((p: unknown) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelect(p)}
                  className={`flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                    value === p.id
                      ? "border border-brand-100 bg-brand-50 dark:border-navy-600 dark:bg-navy-700"
                      : "border border-transparent hover:bg-gray-50 dark:hover:bg-navy-700/50"
                  }`}
                >
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-100 dark:border-navy-600 dark:bg-navy-900">
                    <Package className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-gray-900 dark:text-white">
                      {p.product_name}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[10px] dark:bg-navy-900">
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
