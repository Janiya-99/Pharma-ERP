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

interface AccountClassificationSelectProps {
  value?: string;
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const AccountClassificationSelect: React.FC<AccountClassificationSelectProps> = ({
  value,
  onChange,
  placeholder = "Select Classification",
  className,
  disabled,
}: { value?: unknown; onChange?: unknown; placeholder?: unknown; className?: unknown; disabled?: unknown }) => {
  const [classifications, setClassifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClassifications = async () => {
      setLoading(true);
      try {
        const response = await financeApi.getAccountClassifications({});
        if (response.data.success) {
          setClassifications(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch classifications:", error);
        toast.error("Failed to load account classifications");
      } finally {
        setLoading(false);
      }
    };
    fetchClassifications();
  }, []);

  return (
    <Select value={value} onValueChange={onChange} disabled={disabled || loading}>
      <SelectTrigger className={className || "w-full bg-white dark:bg-navy-900 border-gray-300 dark:border-navy-700"}>
        <SelectValue placeholder={loading ? "Loading..." : placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-white dark:bg-navy-800">
        {classifications.map((item: unknown) => (
          <SelectItem key={item.id} value={item.id.toString()}>
            {item.name} (Level {item.level})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default AccountClassificationSelect;
