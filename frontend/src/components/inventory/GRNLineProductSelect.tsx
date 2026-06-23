import React, { useState, useEffect } from "react";
import Select from "react-select";
import { inventoryApi } from "../../api/inventoryApi";

const GRNLineProductSelect = ({ value, onChange, error, isDisabled }: { value?: unknown; onChange?: unknown; error?: unknown; isDisabled?: boolean }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await inventoryApi.getProducts({ limit: 1000, status: "active" });
      if (res.success !== false) {
        setProducts(res.data?.data || res.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch products", err);
    } finally {
      setLoading(false);
    }
  };

  const options = products.map((p: unknown) => ({
    value: p.id,
    label: `${p.product_code} - ${p.product_name}`,
    product: p,
  }));

  const selectedOption = options.find((opt: unknown) => opt.value === value) || null;

  return (
    <div className="w-full min-w-[200px]">
      <Select
        value={selectedOption}
        onChange={(selected: unknown) => onChange(selected ? selected.value : null, selected ? selected.product : null)}
        options={options}
        isLoading={loading}
        isDisabled={isDisabled}
        isClearable
        placeholder="Select Product"
        classNamePrefix="react-select"
        className={`text-sm ${error ? "border-red-500 rounded" : ""}`}
        styles={{
          control: (base: unknown) => ({
            ...base,
            borderColor: error ? "#ef4444" : base.borderColor,
            "&:hover": {
              borderColor: error ? "#ef4444" : base.borderColor,
            },
          }),
        }}
      />
      {error && <p className="text-[10px] text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export default GRNLineProductSelect;
