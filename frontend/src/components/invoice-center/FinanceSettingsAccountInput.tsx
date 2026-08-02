import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { financeApi } from "../../api/financeApi";
import invoiceCenterApi from "../../api/invoiceCenterApi";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type AccountOption = {
  id: number;
  account_code: string;
  account_name: string;
  account_type?: string;
  status?: string;
};

const lookupCache = new Map<string, Promise<AccountOption[]>>();

const loadAccountOptions = (search: string) => {
  const key = search.trim().toLowerCase();
  const cached = lookupCache.get(key);
  if (cached) return cached;

  const request = invoiceCenterApi
    .getInvoiceCenterChartOfAccounts({
      limit: 300,
      search,
    })
    .then((response) => response.data?.data || [])
    .catch(async () => {
      const response = await financeApi.getChartOfAccounts({
        limit: 300,
        status: "active",
        search,
      });
      return response.data?.data || [];
    });

  lookupCache.set(key, request);
  return request;
};

interface Props {
  label: string;
  description: string;
  value: number | null | undefined;
  onChange: (value: number | null) => void;
  required?: boolean;
  error?: string;
}

export const FinanceSettingsAccountInput = ({
  label,
  description,
  value,
  onChange,
  required = false,
  error,
}: Props) => {
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadAccounts = async () => {
      setLoading(true);
      try {
        setAccounts(await loadAccountOptions(search));
      } catch {
        setAccounts([]);
      } finally {
        setLoading(false);
      }
    };
    const timer = window.setTimeout(loadAccounts, 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  const selectedAccount = useMemo(
    () => accounts.find((account) => account.id === value),
    [accounts, value]
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white/75 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <Label className="text-sm font-medium text-[#1F2937]">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </Label>
        {!required && (
          <Badge variant="outline" className="border-slate-200 text-slate-500">
            Optional
          </Badge>
        )}
      </div>
      <p className="mt-1 text-xs text-[#6B7280]">{description}</p>

      <div className="mt-3 space-y-2">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search account code or name"
            className="h-9 border-slate-200 bg-white pl-9"
          />
        </div>
        <Select
          value={value ? String(value) : "none"}
          onValueChange={(nextValue) =>
            onChange(nextValue === "none" ? null : Number(nextValue))
          }
          disabled={loading}
        >
          <SelectTrigger
            className={`h-10 border-slate-200 bg-white ${
              error ? "border-red-400 focus-visible:ring-red-400" : ""
            }`}
          >
            <SelectValue
              placeholder={loading ? "Loading accounts..." : "Select account"}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Not configured</SelectItem>
            {accounts.map((account) => (
              <SelectItem key={account.id} value={String(account.id)}>
                {account.account_code} - {account.account_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedAccount && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#6B7280]">
          <Badge variant="secondary">{selectedAccount.account_code}</Badge>
          <span>{selectedAccount.account_type || "Posting account"}</span>
          <span className="text-green-700">
            {selectedAccount.status || "active"}
          </span>
        </div>
      )}
      {error && (
        <p className="mt-2 text-xs font-medium text-red-500">{error}</p>
      )}
    </div>
  );
};

export default FinanceSettingsAccountInput;
