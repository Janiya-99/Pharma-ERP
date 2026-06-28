import React, { useState, useEffect } from "react";
import { invoiceCenterApi } from "../../api/invoiceCenterApi";

interface Category {
  id: number;
  category_code: string;
  category_name: string;
  credit_limit?: number;
}

interface CustomerCategorySelectProps {
  value?: number | string;
  onChange: (val: number | "") => void;
  disabled?: boolean;
  error?: string;
}

const CustomerCategorySelect: React.FC<CustomerCategorySelectProps> = ({
  value,
  onChange,
  disabled = false,
  error,
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await invoiceCenterApi.getCustomerCategories({
          limit: 200,
          status: "active",
        });
        if (response.data?.success) {
          setCategories(response.data.data || []);
        }
      } catch (err) {
        console.error("Failed to load customer categories:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div>
      <select
        value={value || ""}
        onChange={(e) => onChange(Number(e.target.value) || "")}
        disabled={disabled || loading}
        className={`w-full rounded-xl border bg-white px-3 py-2 text-sm transition-all focus:outline-none focus:ring-2 focus:ring-navy-500 dark:bg-navy-800 ${
          error
            ? "border-rose-500 focus:ring-rose-500"
            : "border-gray-200 dark:border-navy-600"
        } ${disabled ? "cursor-not-allowed bg-gray-50 opacity-70" : ""}`}
      >
        <option value="">
          {loading ? "Loading categories..." : "Select Customer Category"}
        </option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.category_code} - {cat.category_name} (Limit: LKR{" "}
            {Number(cat.credit_limit || 0).toLocaleString()})
          </option>
        ))}
      </select>
      {error && <p className="text-rose-500 mt-1 text-xs">{error}</p>}
    </div>
  );
};

export default CustomerCategorySelect;
