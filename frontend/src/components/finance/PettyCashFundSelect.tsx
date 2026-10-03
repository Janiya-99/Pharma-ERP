import { useEffect, useState } from "react";
import { financeApi } from "../../api/financeApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../ui/select";
import { toast } from "react-hot-toast";

const PettyCashFundSelect = ({
  value,
  onChange,
  placeholder = "Select Petty Cash Fund",
  className,
  disabled,
}: { value?: unknown; onChange?: unknown; placeholder?: unknown; className?: unknown; disabled?: unknown }) => {
  const [funds, setFunds] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFunds = async () => {
      setLoading(true);
      try {
        const response = await financeApi.getPettyCashFunds({ limit: 1000, status: "active" });
        if (response.data.success) {
          setFunds(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch petty cash funds:", error);
        toast.error("Failed to load petty cash funds");
      } finally {
        setLoading(false);
      }
    };
    fetchFunds();
  }, []);

  return (
    <Select value={value?.toString() || ""} onValueChange={(val: unknown) => onChange(parseInt(val, 10))} disabled={disabled || loading}>
      <SelectTrigger className={className || "w-full bg-white  border-gray-300 "}>
        <SelectValue placeholder={loading ? "Loading..." : placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-white ">
        {funds.map((item: unknown) => (
          <SelectItem key={item.id} value={item.id.toString()}>
            {item.fund_code} - {item.fund_name} (Balance: LKR {item.current_balance?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default PettyCashFundSelect;
