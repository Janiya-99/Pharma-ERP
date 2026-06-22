import React, { useState, useEffect } from "react";
import Select from "react-select";
import { inventoryApi } from "api/inventoryApi";
import { formatDate } from "lib/utils";

const OpeningStockLineBatchSelect = ({ productId, value, onChange, error, isDisabled }) => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (productId) {
      fetchBatches(productId);
    } else {
      setBatches([]);
    }
  }, [productId]);

  const fetchBatches = async (pid) => {
    try {
      setLoading(true);
      const res = await inventoryApi.getProductBatches({ product_id: pid, limit: 1000 });
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
    label: `${b.batch_number} (Exp: ${b.expiry_date ? formatDate(b.expiry_date) : "N/A"}) - ${b.batch_status}`,
    batch: b,
    isDisabled: b.is_blocked || ["expired", "recalled", "disposed", "inactive"].includes(b.batch_status?.toLowerCase())
  }));

  const selectedOption = options.find((opt) => opt.value === value) || null;

  return (
    <div className="w-full">
      <Select
        value={selectedOption}
        onChange={(selected) => onChange(selected ? selected.value : null, selected ? selected.batch : null)}
        options={options}
        isLoading={loading}
        isDisabled={isDisabled || !productId}
        isClearable
        placeholder={productId ? "Select Batch" : "Select Product First"}
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
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
};

export default OpeningStockLineBatchSelect;
