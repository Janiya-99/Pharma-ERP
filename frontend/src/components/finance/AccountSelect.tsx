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

interface AccountSelectProps {
  value?: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const AccountSelect: React.FC<AccountSelectProps> = ({
  value,
  onChange,
  placeholder = "Select Account",
  className,
  disabled,
}: {
  value?: unknown;
  onChange?: unknown;
  placeholder?: unknown;
  className?: unknown;
  disabled?: unknown;
}) => {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      setLoading(true);
      try {
        const response = await financeApi.getChartOfAccounts({ limit: 1000 });
        if (response.data.success) {
          setAccounts(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch accounts:", error);
        toast.error("Failed to load accounts");
      } finally {
        setLoading(false);
      }
    };
    fetchAccounts();
  }, []);

  return (
    <Select
      value={value}
      onValueChange={onChange}
      disabled={disabled || loading}
    >
      <SelectTrigger
        className={
          className ||
          "w-full border-gray-300 bg-white  "
        }
      >
        <SelectValue placeholder={loading ? "Loading..." : placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-white ">
        {accounts.map((item: unknown) => (
          <SelectItem key={item.id} value={item.id.toString()}>
            {item.account_code} - {item.account_name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default AccountSelect;
