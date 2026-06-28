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

interface AccountingPeriodSelectProps {
  value?: string;
  onChange: (val: string) => void;
  financialYearId?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const AccountingPeriodSelect: React.FC<AccountingPeriodSelectProps> = ({
  value,
  onChange,
  financialYearId,
  placeholder = "Select Period",
  className,
  disabled,
}: {
  value?: unknown;
  onChange?: unknown;
  financialYearId?: string | number;
  placeholder?: unknown;
  className?: unknown;
  disabled?: unknown;
}) => {
  const [periods, setPeriods] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!financialYearId) {
      setPeriods([]);
      return;
    }

    const fetchPeriods = async () => {
      setLoading(true);
      try {
        const response = await financeApi.getAccountingPeriods({
          financial_year_id: financialYearId,
          limit: 100,
        });
        if (response.data.success) {
          setPeriods(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch accounting periods:", error);
        toast.error("Failed to load accounting periods");
      } finally {
        setLoading(false);
      }
    };
    fetchPeriods();
  }, [financialYearId]);

  return (
    <Select
      value={value}
      onValueChange={onChange}
      disabled={disabled || loading || !financialYearId}
    >
      <SelectTrigger
        className={
          className ||
          "w-full border-gray-300 bg-white dark:border-navy-700 dark:bg-navy-900"
        }
      >
        <SelectValue
          placeholder={
            !financialYearId
              ? "Select FY first"
              : loading
              ? "Loading..."
              : placeholder
          }
        />
      </SelectTrigger>
      <SelectContent className="bg-white dark:bg-navy-800">
        {periods.map((item: unknown) => (
          <SelectItem key={item.id} value={item.id.toString()}>
            {item.period_name} ({item.start_date} to {item.end_date})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default AccountingPeriodSelect;
