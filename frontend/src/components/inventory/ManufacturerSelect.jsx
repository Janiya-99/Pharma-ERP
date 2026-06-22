import React, { useState, useEffect } from "react";
import Select from "react-select";
import { inventoryApi } from "../../api/inventoryApi";

const ManufacturerSelect = ({ value, onChange, placeholder = "Select...", disabled = false, error = false, isMulti = false, isClearable = true, extraParams = {} }) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOptions();
  }, [JSON.stringify(extraParams)]);

  const fetchOptions = async () => {
    setLoading(true);
    try {
      const response = await inventoryApi.getManufacturers({ limit: 1000, status: "active", ...extraParams });
      if (response.data?.success) {
        const data = response.data.data;
        const mappedOptions = data.map((item) => ({
          value: item.id,
          label: `${item.manufacturer_code} - ${item.manufacturer_name}`,
          original: item,
        }));
        setOptions(mappedOptions);
      }
    } catch (error) {
      console.error("Failed to load ManufacturerSelect options:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectedValue = isMulti
    ? options.filter((opt) => (Array.isArray(value) ? value.includes(opt.value) : false))
    : options.find((opt) => opt.value === value) || null;

  const handleChange = (selected) => {
    if (isMulti) {
      onChange(selected ? selected.map((s) => s.value) : []);
    } else {
      onChange(selected ? selected.value : "");
    }
  };

  const customStyles = {
    control: (base, state) => ({
      ...base,
      minHeight: "42px",
      borderRadius: "0.5rem",
      borderColor: error ? "#ef4444" : state.isFocused ? "#3b82f6" : "#e5e7eb",
      boxShadow: state.isFocused ? (error ? "0 0 0 1px #ef4444" : "0 0 0 1px #3b82f6") : "none",
      "&:hover": {
        borderColor: error ? "#ef4444" : state.isFocused ? "#3b82f6" : "#d1d5db",
      },
    }),
    menu: (base) => ({
      ...base,
      zIndex: 50,
      borderRadius: "0.5rem",
      boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected ? "#eff6ff" : state.isFocused ? "#f9fafb" : "white",
      color: state.isSelected ? "#1e40af" : "#374151",
      "&:active": {
        backgroundColor: "#eff6ff",
      },
    }),
  };

  return (
    <div className="relative">
      <Select
        value={selectedValue}
        onChange={handleChange}
        options={options}
        isLoading={loading}
        isDisabled={disabled}
        placeholder={placeholder}
        isClearable={isClearable}
        isMulti={isMulti}
        styles={customStyles}
        classNamePrefix="react-select"
        noOptionsMessage={() => (loading ? "Loading..." : "No options found")}
      />
    </div>
  );
};

export default ManufacturerSelect;
