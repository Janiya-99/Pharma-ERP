import React, { useState, useEffect } from "react";
import { invoiceCenterApi } from "../../api/invoiceCenterApi";

interface Customer {
  id: number;
  customer_code: string;
  customer_name: string;
  status: string;
}

interface CustomerSelectProps {
  value?: number | string;
  onChange: (val: number | "") => void;
  disabled?: boolean;
  filterActiveOnly?: boolean;
  error?: string;
}

const CustomerSelect: React.FC<CustomerSelectProps> = ({
  value,
  onChange,
  disabled = false,
  filterActiveOnly = false,
  error,
}) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await invoiceCenterApi.getCustomers({ limit: 500 });
        if (response.data?.success) {
          let list: Customer[] = response.data.data || [];
          if (filterActiveOnly) {
            list = list.filter((c) => c.status === "active");
          }
          setCustomers(list);
        }
      } catch (err) {
        console.error("Failed to load customers:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, [filterActiveOnly]);

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
          {loading ? "Loading customers..." : "Select Customer"}
        </option>
        {customers.map((cust) => {
          const isSelectable = cust.status === "active";
          const statusText =
            cust.status !== "active" ? ` [${cust.status.toUpperCase()}]` : "";
          return (
            <option
              key={cust.id}
              value={cust.id}
              disabled={!isSelectable && filterActiveOnly}
            >
              {cust.customer_code} - {cust.customer_name}
              {statusText}
            </option>
          );
        })}
      </select>
      {error && <p className="text-rose-500 mt-1 text-xs">{error}</p>}
    </div>
  );
};

export default CustomerSelect;
