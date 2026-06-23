import React, { useState, useEffect } from "react";
import Select from "react-select";
import { inventoryApi } from "../../api/inventoryApi";

const GRNLineBatchSelect = ({ productId, value, onChange, error, isDisabled }) => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (productId) {
      fetchBatches(productId);
    } else {
      setBatches([]);
      if (value) onChange(null, null);
    }
  }, [productId]);

  const fetchBatches = async (pid) => {
    try {
      setLoading(true);
      const res = await inventoryApi.getProductBatches({ product_id: pid, limit: 100 });
      if (res.success !== false) {
        setBatches(res.data?.data || res.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch batches", err);
    } finally {
      setLoading(false);
    }
  };

  const options = batches.map((b) => ({
    value: b.id,
    label: `${b.batch_number} (Exp: ${b.expiry_date ? new Date(b.expiry_date).toLocaleDateString() : "N/A"})`,
    batch: b,
    isDisabled: b.is_blocked,
  }));

  const selectedOption = options.find((opt) => opt.value === value) || null;

  return (
    <div className="w-full min-w-[180px]">
      <Select
        value={selectedOption}
        onChange={(selected) => onChange(selected ? selected.value : null, selected ? selected.batch : null)}
        options={options}
        isLoading={loading}
        isDisabled={isDisabled || !productId}
        isClearable
        placeholder="Select Batch"
        classNamePrefix="react-select"
        className={`text-sm ${error ? "border-red-500 rounded" : ""}`}
        isOptionDisabled={(option) => option.isDisabled}
        styles={{
          control: (base) => ({
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

export default GRNLineBatchSelect;
