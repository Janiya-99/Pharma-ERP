import { useState, useEffect } from "react";
import { financeApi } from "../../api/financeApi";
import { Check, ChevronsUpDown } from "lucide-react";

const FixedAssetCategorySelect = ({ value, onChange, error, disabled, className = "" }: { value?: unknown; onChange?: unknown; error?: unknown; disabled?: unknown; className?: unknown }) => {
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
      const res = await financeApi.getFixedAssetCategories({ status: "active", limit: 100 });
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
        className={`flex items-center justify-between w-full p-2.5 bg-white  border rounded-xl cursor-pointer ${
          error ? "border-red-500" : "border-gray-200 "
        } ${disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : "hover:border-brand-500"}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={`truncate text-sm ${!selectedCategory ? "text-gray-400" : "text-gray-800 "}`}>
          {selectedCategory ? `${selectedCategory.category_code} - ${selectedCategory.category_name}` : "Select Category..."}
        </span>
        <ChevronsUpDown className="w-4 h-4 text-gray-400" />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg  ">
          <div className="p-2 border-b border-gray-100 ">
            <input
              type="text"
              placeholder="Search category..."
              className="w-full px-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-brand-500   "
              value={search}
              onChange={(e: any) => setSearch(e.target.value)}
              onClick={(e: any) => e.stopPropagation()}
            />
          </div>
          <div className="max-h-60 overflow-y-auto p-1 scrollbar-thin">
            {loading ? (
              <div className="p-3 text-sm text-center text-gray-500">Loading...</div>
            ) : filteredCategories.length === 0 ? (
              <div className="p-3 text-sm text-center text-gray-500">No categories found.</div>
            ) : (
              filteredCategories.map((category: unknown) => (
                <div
                  key={category.id}
                  className={`flex items-center justify-between p-2 text-sm rounded-lg cursor-pointer hover:bg-gray-50  ${
                    value === category.id ? "bg-brand-50 text-brand-600 font-medium " : "text-gray-700 "
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
                  {value === category.id && <Check className="w-4 h-4 text-brand-600" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {error && <span className="text-xs text-red-500 mt-1 block">{error}</span>}
      
      {/* Invisible overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

export default FixedAssetCategorySelect;
