import { useEffect, useState } from "react";
import { financeApi } from "api/financeApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/ui/select";
import { toast } from "react-hot-toast";

export type BankAccountOption = {
  id: number;
  bank_name: string;
  bank_branch_name?: string;
  account_name: string;
  account_number: string;
  bank_code?: string;
  branch_code?: string;
  swift_code?: string;
  current_balance?: number;
  status?: string;
};

const BankAccountSelect = ({
  value,
  onChange,
  onAccountChange,
  placeholder = "Select Bank Account",
  className,
  disabled,
}: {
  value?: string;
  onChange?: (value: string) => void;
  onAccountChange?: (account: BankAccountOption | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}) => {
  const [accounts, setAccounts] = useState<BankAccountOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAccounts = async () => {
      setLoading(true);
      try {
        const response = await financeApi.getBankAccounts({
          limit: 1000,
          status: "active",
        });
        if (response.data.success) {
          setAccounts(response.data.data || []);
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

  const handleChange = (nextValue: string) => {
    onChange?.(nextValue);
    onAccountChange?.(
      accounts.find((account) => String(account.id) === nextValue) || null
    );
  };

  return (
    <Select
      value={value}
      onValueChange={handleChange}
      disabled={disabled || loading}
    >
      <SelectTrigger
        className={className || "w-full border-slate-200 bg-white"}
      >
        <SelectValue placeholder={loading ? "Loading..." : placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-white">
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
