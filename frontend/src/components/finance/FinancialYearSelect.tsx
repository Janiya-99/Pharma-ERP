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

interface FinancialYearSelectProps {
  value?: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const FinancialYearSelect: React.FC<FinancialYearSelectProps> = ({
  value,
  onChange,
  placeholder = "Select Financial Year",
  className,
  disabled,
}: { value?: unknown; onChange?: unknown; placeholder?: unknown; className?: unknown; disabled?: unknown }) => {
  const [years, setYears] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchYears = async () => {
      setLoading(true);
      try {
        const response = await financeApi.getFinancialYears({ limit: 100 });
        if (response.data.success) {
          setYears(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch financial years:", error);
        toast.error("Failed to load financial years");
      } finally {
        setLoading(false);
      }
    };
    fetchYears();
  }, []);

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled || loading}>
      <SelectTrigger className={className || "w-full bg-white dark:bg-navy-900 border-gray-300 dark:border-navy-700"}>
        <SelectValue placeholder={loading ? "Loading..." : placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-white dark:bg-navy-800">
        {years.map((item: unknown) => (
          <SelectItem key={item.id} value={item.id.toString()}>
            {item.year_name} ({item.start_date} to {item.end_date})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default FinancialYearSelect;
