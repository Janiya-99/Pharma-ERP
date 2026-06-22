import React, { useEffect, useState } from "react";
import { financeApi } from "api/financeApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/ui/select";
import { toast } from "react-hot-toast";

const BankAccountSelect = ({
  value,
  onChange,
  placeholder = "Select Bank Account",
  className,
  disabled,
}) => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      setLoading(true);
      try {
        const response = await financeApi.getBankAccounts({ limit: 1000, status: "active" });
        if (response.data.success) {
          setAccounts(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch bank accounts:", error);
        toast.error("Failed to load bank accounts");
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, []);

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled || loading}>
      <SelectTrigger className={className || "w-full bg-white dark:bg-navy-900 border-gray-300 dark:border-navy-700"}>
        <SelectValue placeholder={loading ? "Loading..." : placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-white dark:bg-navy-800">
        {accounts.map((item) => (
          <SelectItem key={item.id} value={item.id.toString()}>
            {item.bank_name} - {item.account_number}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default BankAccountSelect;
