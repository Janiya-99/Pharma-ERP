import React, { useState, useEffect } from "react";
import { financeApi } from "../../api/financeApi";
import { Check, ChevronsUpDown } from "lucide-react";

const FixedAssetCategorySelect = ({
  value,
  onChange,
  error,
  disabled,
  className = "",
}: {
  value?: unknown;
  onChange?: unknown;
  error?: unknown;
  disabled?: unknown;
  className?: unknown;
}) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await financeApi.getFixedAssetCategories({
        status: "active",
        limit: 100,
      });
      setCategories(res.data?.data || []);
    } catch (err) {
      console.error("Failed to load fixed asset categories", err);
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = categories.find((c: unknown) => c.id === value);
  const filteredCategories = categories.filter(
    (c: unknown) =>
      c.category_name.toLowerCase().includes(search.toLowerCase()) ||
      c.category_code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`relative ${className}`}>
      <div
        className={`flex w-full cursor-pointer items-center justify-between rounded-xl border bg-white p-2.5 dark:bg-navy-800 ${
          error ? "border-red-500" : "border-gray-200 dark:border-navy-600"
        } ${
          disabled
            ? "cursor-not-allowed bg-gray-50 opacity-50"
            : "hover:border-brand-500"
        }`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span
          className={`truncate text-sm ${
            !selectedCategory
              ? "text-gray-400"
              : "text-gray-800 dark:text-white"
          }`}
        >
          {selectedCategory
            ? `${selectedCategory.category_code} - ${selectedCategory.category_name}`
            : "Select Category..."}
        </span>
        <ChevronsUpDown className="h-4 w-4 text-gray-400" />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-xl border border-gray-200 bg-white shadow-lg dark:border-navy-600 dark:bg-navy-800">
          <div className="border-b border-gray-100 p-2 dark:border-navy-700">
            <input
              type="text"
              placeholder="Search category..."
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm outline-none focus:border-brand-500 dark:border-navy-600 dark:bg-navy-900 dark:text-white"
              value={search}
              onChange={(e: any) => setSearch(e.target.value)}
              onClick={(e: any) => e.stopPropagation()}
            />
          </div>
          <div className="scrollbar-thin max-h-60 overflow-y-auto p-1">
            {loading ? (
              <div className="p-3 text-center text-sm text-gray-500">
                Loading...
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="p-3 text-center text-sm text-gray-500">
                No categories found.
              </div>
            ) : (
              filteredCategories.map((category: unknown) => (
                <div
                  key={category.id}
                  className={`flex cursor-pointer items-center justify-between rounded-lg p-2 text-sm hover:bg-gray-50 dark:hover:bg-navy-700 ${
                    value === category.id
                      ? "bg-brand-50 font-medium text-brand-600 dark:bg-navy-700"
                      : "text-gray-700 dark:text-gray-200"
                  }`}
                  onClick={() => {
                    onChange(category.id);
                    setIsOpen(false);
                    setSearch("");
                  }}
                >
                  <span className="truncate">
                    {category.category_code} - {category.category_name}
                  </span>
                  {value === category.id && (
                    <Check className="h-4 w-4 text-brand-600" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {error && (
        <span className="mt-1 block text-xs text-red-500">{error}</span>
      )}

      {/* Invisible overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

export default FixedAssetCategorySelect;
