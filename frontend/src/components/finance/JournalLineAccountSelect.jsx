import React, { useState, useEffect } from "react";
import { financeApi } from "../../../api/financeApi";

export default function JournalLineAccountSelect({ value, onChange, error, disabled }) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      setLoading(true);
      try {
        const response = await financeApi.getChartOfAccounts({ limit: 1000, status: 'active' });
        if (response.data?.success) {
          setAccounts(response.data.data);
        }
      } catch (error) {
        console.error("Failed to load chart of accounts", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []);

  return (
    <div className="w-full">
      <select
        value={value || ""}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled || loading}
        className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-navy-500 focus:border-navy-500 sm:text-sm rounded-md ${
          error ? "border-red-300 text-red-900 focus:ring-red-500 focus:border-red-500" : ""
        }`}
      >
        <option value="" disabled>Select Account</option>
        {accounts.map((account) => (
          <option key={account.id} value={account.id}>
            {account.account_code} - {account.account_name}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
