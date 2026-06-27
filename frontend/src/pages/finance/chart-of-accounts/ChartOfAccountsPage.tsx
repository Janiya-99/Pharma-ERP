import React, { useMemo, useState } from "react";
import {
  BookOpen,
  ChevronRight,
  Download,
  Edit,
  Eye,
  FileText,
  FolderTree,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Switch } from "../../../components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Textarea } from "../../../components/ui/textarea";

type AccountType = "Asset" | "Liability" | "Equity" | "Income" | "Expense";
type NormalBalance = "Debit" | "Credit";
type AccountStatus = "Active" | "Inactive";

type Account = {
  code: string;
  name: string;
  type: AccountType;
  group: string;
  parentAccount: string;
  normalBalance: NormalBalance;
  openingBalance: number;
  currentBalance: number;
  status: AccountStatus;
  createdDate: string;
  updatedDate: string;
  hasTransactions: boolean;
  allowManualPosting: boolean;
  isBankAccount: boolean;
  isCashAccount: boolean;
  isControlAccount: boolean;
  description: string;
};

type AccountForm = {
  code: string;
  name: string;
  type: AccountType | "";
  group: string;
  parentAccount: string;
  normalBalance: NormalBalance | "";
  openingBalance: string;
  description: string;
  status: AccountStatus | "";
  allowManualPosting: boolean;
  isBankAccount: boolean;
  isCashAccount: boolean;
  isControlAccount: boolean;
};

type TreeNode = {
  label: string;
  code?: string;
  children?: TreeNode[];
};

const initialAccounts: Account[] = [
  { code: "1000", name: "Assets", type: "Asset", group: "Assets", parentAccount: "-", normalBalance: "Debit", openingBalance: 0, currentBalance: 20180000, status: "Active", createdDate: "2026-01-01", updatedDate: "2026-06-20", hasTransactions: true, allowManualPosting: false, isBankAccount: false, isCashAccount: false, isControlAccount: true, description: "Primary asset control account." },
  { code: "1100", name: "Current Assets", type: "Asset", group: "Current Assets", parentAccount: "Assets", normalBalance: "Debit", openingBalance: 0, currentBalance: 15340000, status: "Active", createdDate: "2026-01-01", updatedDate: "2026-06-20", hasTransactions: true, allowManualPosting: false, isBankAccount: false, isCashAccount: false, isControlAccount: true, description: "Short-term company assets." },
  { code: "1110", name: "Cash in Hand", type: "Asset", group: "Current Assets", parentAccount: "Current Assets", normalBalance: "Debit", openingBalance: 650000, currentBalance: 1865000, status: "Active", createdDate: "2026-01-03", updatedDate: "2026-06-26", hasTransactions: true, allowManualPosting: true, isBankAccount: false, isCashAccount: true, isControlAccount: false, description: "Cash book posting account." },
  { code: "1120", name: "Bank Account", type: "Asset", group: "Current Assets", parentAccount: "Current Assets", normalBalance: "Debit", openingBalance: 5300000, currentBalance: 12845000, status: "Active", createdDate: "2026-01-03", updatedDate: "2026-06-26", hasTransactions: true, allowManualPosting: true, isBankAccount: true, isCashAccount: false, isControlAccount: false, description: "Main company operating bank account." },
  { code: "1130", name: "Accounts Receivable", type: "Asset", group: "Current Assets", parentAccount: "Current Assets", normalBalance: "Debit", openingBalance: 2750000, currentBalance: 5470000, status: "Active", createdDate: "2026-01-03", updatedDate: "2026-06-25", hasTransactions: true, allowManualPosting: false, isBankAccount: false, isCashAccount: false, isControlAccount: true, description: "Customer receivables control account." },
  { code: "1140", name: "Inventory", type: "Asset", group: "Current Assets", parentAccount: "Current Assets", normalBalance: "Debit", openingBalance: 3900000, currentBalance: 7600000, status: "Active", createdDate: "2026-01-03", updatedDate: "2026-06-22", hasTransactions: true, allowManualPosting: false, isBankAccount: false, isCashAccount: false, isControlAccount: true, description: "Inventory valuation control account." },
  { code: "2000", name: "Liabilities", type: "Liability", group: "Liabilities", parentAccount: "-", normalBalance: "Credit", openingBalance: 0, currentBalance: 5825000, status: "Active", createdDate: "2026-01-01", updatedDate: "2026-06-20", hasTransactions: true, allowManualPosting: false, isBankAccount: false, isCashAccount: false, isControlAccount: true, description: "Primary liability control account." },
  { code: "2100", name: "Current Liabilities", type: "Liability", group: "Current Liabilities", parentAccount: "Liabilities", normalBalance: "Credit", openingBalance: 0, currentBalance: 5825000, status: "Active", createdDate: "2026-01-01", updatedDate: "2026-06-20", hasTransactions: true, allowManualPosting: false, isBankAccount: false, isCashAccount: false, isControlAccount: true, description: "Short-term company obligations." },
  { code: "2110", name: "Accounts Payable", type: "Liability", group: "Current Liabilities", parentAccount: "Current Liabilities", normalBalance: "Credit", openingBalance: 1640000, currentBalance: 2915000, status: "Active", createdDate: "2026-01-04", updatedDate: "2026-06-26", hasTransactions: true, allowManualPosting: false, isBankAccount: false, isCashAccount: false, isControlAccount: true, description: "Supplier payable control account." },
  { code: "2120", name: "Tax Payable", type: "Liability", group: "Current Liabilities", parentAccount: "Current Liabilities", normalBalance: "Credit", openingBalance: 510000, currentBalance: 1290000, status: "Active", createdDate: "2026-01-04", updatedDate: "2026-06-18", hasTransactions: true, allowManualPosting: false, isBankAccount: false, isCashAccount: false, isControlAccount: true, description: "Tax obligations payable to authorities." },
  { code: "3000", name: "Equity", type: "Equity", group: "Equity", parentAccount: "-", normalBalance: "Credit", openingBalance: 0, currentBalance: 10875000, status: "Active", createdDate: "2026-01-01", updatedDate: "2026-06-20", hasTransactions: true, allowManualPosting: false, isBankAccount: false, isCashAccount: false, isControlAccount: true, description: "Ownership and retained earnings accounts." },
  { code: "3100", name: "Owner Capital", type: "Equity", group: "Equity", parentAccount: "Equity", normalBalance: "Credit", openingBalance: 10000000, currentBalance: 10000000, status: "Active", createdDate: "2026-01-05", updatedDate: "2026-01-05", hasTransactions: true, allowManualPosting: true, isBankAccount: false, isCashAccount: false, isControlAccount: false, description: "Capital introduced by owners." },
  { code: "3200", name: "Retained Earnings", type: "Equity", group: "Equity", parentAccount: "Equity", normalBalance: "Credit", openingBalance: 875000, currentBalance: 875000, status: "Active", createdDate: "2026-01-05", updatedDate: "2026-06-01", hasTransactions: true, allowManualPosting: false, isBankAccount: false, isCashAccount: false, isControlAccount: true, description: "Accumulated profit retained in the business." },
  { code: "4000", name: "Income", type: "Income", group: "Income", parentAccount: "-", normalBalance: "Credit", openingBalance: 0, currentBalance: 18490000, status: "Active", createdDate: "2026-01-01", updatedDate: "2026-06-26", hasTransactions: true, allowManualPosting: false, isBankAccount: false, isCashAccount: false, isControlAccount: true, description: "Income account category." },
  { code: "4100", name: "Sales Revenue", type: "Income", group: "Operating Income", parentAccount: "Income", normalBalance: "Credit", openingBalance: 0, currentBalance: 17640000, status: "Active", createdDate: "2026-01-06", updatedDate: "2026-06-26", hasTransactions: true, allowManualPosting: true, isBankAccount: false, isCashAccount: false, isControlAccount: false, description: "Revenue from pharmaceutical sales." },
  { code: "4200", name: "Other Income", type: "Income", group: "Other Income", parentAccount: "Income", normalBalance: "Credit", openingBalance: 0, currentBalance: 850000, status: "Active", createdDate: "2026-01-06", updatedDate: "2026-06-21", hasTransactions: true, allowManualPosting: true, isBankAccount: false, isCashAccount: false, isControlAccount: false, description: "Non-operating income." },
  { code: "5000", name: "Expenses", type: "Expense", group: "Expenses", parentAccount: "-", normalBalance: "Debit", openingBalance: 0, currentBalance: 11260000, status: "Active", createdDate: "2026-01-01", updatedDate: "2026-06-26", hasTransactions: true, allowManualPosting: false, isBankAccount: false, isCashAccount: false, isControlAccount: true, description: "Expense account category." },
  { code: "5100", name: "Purchases", type: "Expense", group: "Cost of Goods Sold", parentAccount: "Expenses", normalBalance: "Debit", openingBalance: 0, currentBalance: 6840000, status: "Active", createdDate: "2026-01-07", updatedDate: "2026-06-25", hasTransactions: true, allowManualPosting: true, isBankAccount: false, isCashAccount: false, isControlAccount: false, description: "Medicine and stock purchase costs." },
  { code: "5200", name: "Salaries", type: "Expense", group: "Administrative Expenses", parentAccount: "Expenses", normalBalance: "Debit", openingBalance: 0, currentBalance: 2520000, status: "Active", createdDate: "2026-01-07", updatedDate: "2026-06-25", hasTransactions: true, allowManualPosting: true, isBankAccount: false, isCashAccount: false, isControlAccount: false, description: "Employee salary expense." },
  { code: "5300", name: "Rent Expense", type: "Expense", group: "Administrative Expenses", parentAccount: "Expenses", normalBalance: "Debit", openingBalance: 0, currentBalance: 1110000, status: "Active", createdDate: "2026-01-07", updatedDate: "2026-06-24", hasTransactions: true, allowManualPosting: true, isBankAccount: false, isCashAccount: false, isControlAccount: false, description: "Office and warehouse rent expense." },
  { code: "5400", name: "Utilities Expense", type: "Expense", group: "Administrative Expenses", parentAccount: "Expenses", normalBalance: "Debit", openingBalance: 0, currentBalance: 790000, status: "Active", createdDate: "2026-01-07", updatedDate: "2026-06-24", hasTransactions: true, allowManualPosting: true, isBankAccount: false, isCashAccount: false, isControlAccount: false, description: "Electricity, water, and communication costs." },
];

const tree: TreeNode[] = [
  {
    label: "Assets",
    code: "1000",
    children: [
      { label: "Current Assets", code: "1100", children: [{ label: "Cash", code: "1110" }, { label: "Bank", code: "1120" }, { label: "Accounts Receivable", code: "1130" }, { label: "Inventory", code: "1140" }] },
      { label: "Fixed Assets", children: [{ label: "Vehicles" }, { label: "Equipment" }] },
    ],
  },
  {
    label: "Liabilities",
    code: "2000",
    children: [
      { label: "Current Liabilities", code: "2100", children: [{ label: "Accounts Payable", code: "2110" }, { label: "Tax Payable", code: "2120" }] },
      { label: "Long Term Liabilities" },
    ],
  },
  { label: "Equity", code: "3000", children: [{ label: "Owner Capital", code: "3100" }, { label: "Retained Earnings", code: "3200" }] },
  { label: "Income", code: "4000", children: [{ label: "Sales Revenue", code: "4100" }, { label: "Other Income", code: "4200" }] },
  { label: "Expenses", code: "5000", children: [{ label: "Purchases", code: "5100" }, { label: "Salaries", code: "5200" }, { label: "Rent", code: "5300" }, { label: "Utilities", code: "5400" }] },
];

const blankForm: AccountForm = {
  code: "",
  name: "",
  type: "",
  group: "",
  parentAccount: "none",
  normalBalance: "",
  openingBalance: "0",
  description: "",
  status: "Active",
  allowManualPosting: true,
  isBankAccount: false,
  isCashAccount: false,
  isControlAccount: false,
};

const money = (amount: number) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(amount);

const typeBadgeClass: Record<AccountType, string> = {
  Asset: "bg-blue-50 text-blue-700 border-blue-200",
  Liability: "bg-orange-50 text-orange-700 border-orange-200",
  Equity: "bg-purple-50 text-purple-700 border-purple-200",
  Income: "bg-green-50 text-green-700 border-green-200",
  Expense: "bg-slate-100 text-red-700 border-red-200",
};

const toForm = (account: Account): AccountForm => ({
  code: account.code,
  name: account.name,
  type: account.type,
  group: account.group,
  parentAccount: account.parentAccount === "-" ? "none" : account.parentAccount,
  normalBalance: account.normalBalance,
  openingBalance: String(account.openingBalance),
  description: account.description,
  status: account.status,
  allowManualPosting: account.allowManualPosting,
  isBankAccount: account.isBankAccount,
  isCashAccount: account.isCashAccount,
  isControlAccount: account.isControlAccount,
});

const ChartOfAccountsPage = () => {
  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [selectedCode, setSelectedCode] = useState<string | null>("1110");
  const [mode, setMode] = useState<"details" | "create" | "edit">("details");
  const [form, setForm] = useState<AccountForm>(blankForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const selectedAccount = accounts.find((account) => account.code === selectedCode) || null;

  const filteredAccounts = useMemo(
    () =>
      accounts.filter((account) => {
        const matchesSearch = `${account.code} ${account.name} ${account.group}`
          .toLowerCase()
          .includes(search.toLowerCase());
        const matchesType = typeFilter === "all" || account.type === typeFilter;
        const matchesStatus = statusFilter === "all" || account.status === statusFilter;
        return matchesSearch && matchesType && matchesStatus;
      }),
    [accounts, search, statusFilter, typeFilter]
  );

  const setField = <K extends keyof AccountForm>(key: K, value: AccountForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const startCreate = () => {
    setMode("create");
    setSelectedCode(null);
    setForm(blankForm);
    setErrors({});
  };

  const startEdit = (account: Account) => {
    setMode("edit");
    setSelectedCode(account.code);
    setForm(toForm(account));
    setErrors({});
  };

  const showDetails = (code: string) => {
    setSelectedCode(code);
    setMode("details");
    setErrors({});
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!form.code.trim()) nextErrors.code = "Account Code is required.";
    if (!form.name.trim()) nextErrors.name = "Account Name is required.";
    if (!form.type) nextErrors.type = "Account Type is required.";
    if (!form.normalBalance) nextErrors.normalBalance = "Normal Balance is required.";
    if (!form.status) nextErrors.status = "Status is required.";
    if (Number.isNaN(Number(form.openingBalance))) nextErrors.openingBalance = "Opening Balance must be numeric.";
    const duplicate = accounts.some((account) => account.code === form.code.trim() && account.code !== selectedCode);
    if (duplicate) nextErrors.code = "Account Code must be unique.";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const saveAccount = (createAnother = false) => {
    if (!validate() || !form.type || !form.normalBalance || !form.status) return;

    const nextAccount: Account = {
      code: form.code.trim(),
      name: form.name.trim(),
      type: form.type,
      group: form.group.trim() || form.type,
      parentAccount: form.parentAccount === "none" ? "-" : form.parentAccount,
      normalBalance: form.normalBalance,
      openingBalance: Number(form.openingBalance),
      currentBalance: Number(form.openingBalance),
      status: form.status,
      createdDate: mode === "edit" && selectedAccount ? selectedAccount.createdDate : "2026-06-27",
      updatedDate: "2026-06-27",
      hasTransactions: mode === "edit" && selectedAccount ? selectedAccount.hasTransactions : false,
      allowManualPosting: form.allowManualPosting,
      isBankAccount: form.isBankAccount,
      isCashAccount: form.isCashAccount,
      isControlAccount: form.isControlAccount,
      description: form.description.trim(),
    };

    setAccounts((current) => {
      if (mode === "edit") {
        return current.map((account) => (account.code === selectedCode ? nextAccount : account));
      }
      return [...current, nextAccount].sort((a, b) => a.code.localeCompare(b.code));
    });

    if (createAnother) {
      setForm(blankForm);
      setSelectedCode(null);
      setMode("create");
    } else {
      setSelectedCode(nextAccount.code);
      setMode("details");
    }
  };

  const deleteAccount = (account: Account) => {
    if (account.hasTransactions) return;
    setAccounts((current) => current.filter((item) => item.code !== account.code));
    if (selectedCode === account.code) {
      setSelectedCode(null);
      setMode("details");
    }
  };

  const renderTreeNode = (node: TreeNode, depth = 0) => {
    const account = node.code ? accounts.find((item) => item.code === node.code) : null;
    const isSelected = node.code && selectedCode === node.code;

    return (
      <div key={`${node.label}-${node.code || depth}`} className="space-y-1">
        <button
          type="button"
          onClick={() => node.code && showDetails(node.code)}
          className={`flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm transition-colors ${
            isSelected ? "bg-indigo-50 text-indigo-700" : "text-slate-700 hover:bg-slate-50"
          }`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          {node.children ? <ChevronRight className="h-4 w-4 text-slate-400" /> : <span className="h-4 w-4" />}
          <FolderTree className="h-4 w-4 text-slate-400" />
          <span className="min-w-0 flex-1 truncate">
            {account ? `${account.code} - ${account.name}` : node.label}
          </span>
        </button>
        {node.children?.map((child) => renderTreeNode(child, depth + 1))}
      </div>
    );
  };

  const detailsPanel = () => {
    if (mode === "create" || mode === "edit") {
      return (
        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle>{mode === "create" ? "Create Account" : "Edit Account"}</CardTitle>
            <CardDescription>Define posting rules and balances for the ledger account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 pt-1">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Account Code" error={errors.code}>
                <Input value={form.code} onChange={(event) => setField("code", event.target.value)} placeholder="1150" />
              </Field>
              <Field label="Account Name" error={errors.name}>
                <Input value={form.name} onChange={(event) => setField("name", event.target.value)} placeholder="Deposits" />
              </Field>
              <Field label="Account Type" error={errors.type}>
                <Select value={form.type} onValueChange={(value) => setField("type", value as AccountType)}>
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {(["Asset", "Liability", "Equity", "Income", "Expense"] as AccountType[]).map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Account Group">
                <Input value={form.group} onChange={(event) => setField("group", event.target.value)} placeholder="Current Assets" />
              </Field>
              <Field label="Parent Account">
                <Select value={form.parentAccount} onValueChange={(value) => setField("parentAccount", value)}>
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Select parent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No parent</SelectItem>
                    {accounts.map((account) => (
                      <SelectItem key={account.code} value={account.name}>
                        {account.code} - {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Normal Balance" error={errors.normalBalance}>
                <Select value={form.normalBalance} onValueChange={(value) => setField("normalBalance", value as NormalBalance)}>
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Select balance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Debit">Debit</SelectItem>
                    <SelectItem value="Credit">Credit</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Opening Balance" error={errors.openingBalance}>
                <Input value={form.openingBalance} onChange={(event) => setField("openingBalance", event.target.value)} inputMode="decimal" />
              </Field>
              <Field label="Status" error={errors.status}>
                <Select value={form.status} onValueChange={(value) => setField("status", value as AccountStatus)}>
                  <SelectTrigger className="w-full bg-white">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>

            <Field label="Description">
              <Textarea
                value={form.description}
                onChange={(event) => setField("description", event.target.value)}
                placeholder="How this account is used in finance transactions and reports."
                className="min-h-24 bg-white"
              />
            </Field>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <SwitchRow label="Allow Manual Posting" checked={form.allowManualPosting} onCheckedChange={(value) => setField("allowManualPosting", value)} />
              <SwitchRow label="Is Bank Account" checked={form.isBankAccount} onCheckedChange={(value) => setField("isBankAccount", value)} />
              <SwitchRow label="Is Cash Account" checked={form.isCashAccount} onCheckedChange={(value) => setField("isCashAccount", value)} />
              <SwitchRow label="Is Control Account" checked={form.isControlAccount} onCheckedChange={(value) => setField("isControlAccount", value)} />
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
              <Button variant="outline" onClick={() => selectedAccount ? showDetails(selectedAccount.code) : setMode("details")}>
                Cancel
              </Button>
              <Button variant="outline" onClick={() => saveAccount(true)}>
                Save & Create Another
              </Button>
              <Button className="bg-indigo-600 text-white hover:bg-indigo-700" onClick={() => saveAccount()}>
                Save Account
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (!selectedAccount) {
      return (
        <Card className="flex min-h-[500px] items-center justify-center border border-dashed border-slate-300 bg-white shadow-sm">
          <CardContent className="max-w-sm text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
              <FolderTree className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Select an account to view details or create a new account.</h3>
            <Button className="mt-4 bg-indigo-600 text-white hover:bg-indigo-700" onClick={startCreate}>
              <Plus className="h-4 w-4" />
              Add Account
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-start justify-between gap-3">
            <div>
              <CardTitle>{selectedAccount.code} - {selectedAccount.name}</CardTitle>
              <CardDescription>{selectedAccount.description}</CardDescription>
            </div>
            <Badge variant="outline" className={typeBadgeClass[selectedAccount.type]}>
              {selectedAccount.type}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-1">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Detail label="Account Code" value={selectedAccount.code} />
            <Detail label="Account Name" value={selectedAccount.name} />
            <Detail label="Type" value={selectedAccount.type} />
            <Detail label="Group" value={selectedAccount.group} />
            <Detail label="Parent Account" value={selectedAccount.parentAccount} />
            <Detail label="Normal Balance" value={selectedAccount.normalBalance} />
            <Detail label="Current Balance" value={money(selectedAccount.currentBalance)} strong />
            <Detail label="Opening Balance" value={money(selectedAccount.openingBalance)} />
            <Detail label="Status" value={selectedAccount.status} />
            <Detail label="Created Date" value={selectedAccount.createdDate} />
            <Detail label="Last Updated Date" value={selectedAccount.updatedDate} />
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedAccount.allowManualPosting && <Badge variant="outline">Manual Posting</Badge>}
            {selectedAccount.isBankAccount && <Badge variant="outline">Bank Account</Badge>}
            {selectedAccount.isCashAccount && <Badge variant="outline">Cash Account</Badge>}
            {selectedAccount.isControlAccount && <Badge variant="outline">Control Account</Badge>}
          </div>
          <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 pt-4">
            <Button variant="outline" onClick={() => startEdit(selectedAccount)}>
              <Edit className="h-4 w-4" />
              Edit Account
            </Button>
            <Button variant="outline">
              <BookOpen className="h-4 w-4" />
              View Ledger
            </Button>
            <Button variant="destructive">Deactivate Account</Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-full bg-[#F8FAFC] p-6 text-slate-900">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Finance Setup</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Chart of Accounts</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-500">
            Create, organize, and manage ledger accounts used across finance transactions and reports.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button className="bg-indigo-600 text-white hover:bg-indigo-700" onClick={startCreate}>
            <Plus className="h-4 w-4" />
            Add Account
          </Button>
          <Button variant="outline" className="bg-white">
            <Upload className="h-4 w-4" />
            Import Accounts
          </Button>
          <Button variant="outline" className="bg-white">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Card className="mb-4 border border-slate-200 bg-white shadow-sm">
        <CardContent className="grid grid-cols-1 gap-3 pt-1 md:grid-cols-[1fr_180px_180px]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="bg-white pl-9"
              placeholder="Search by account code, name, or group"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full bg-white">
              <SelectValue placeholder="Account Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Asset">Asset</SelectItem>
              <SelectItem value="Liability">Liability</SelectItem>
              <SelectItem value="Equity">Equity</SelectItem>
              <SelectItem value="Income">Income</SelectItem>
              <SelectItem value="Expense">Expense</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full bg-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Tabs defaultValue="tree" className="gap-4">
        <TabsList className="bg-slate-100">
          <TabsTrigger value="tree">
            <FolderTree className="h-4 w-4" />
            Account Tree
          </TabsTrigger>
          <TabsTrigger value="table">
            <FileText className="h-4 w-4" />
            Table View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tree">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[420px_1fr]">
            <Card className="border border-slate-200 bg-white shadow-sm">
              <CardHeader className="border-b border-slate-100">
                <CardTitle>Account Tree</CardTitle>
                <CardDescription>Foundation accounts for OMACX Pharma Pvt Ltd.</CardDescription>
              </CardHeader>
              <CardContent className="max-h-[720px] overflow-auto pt-1">
                <div className="space-y-1">{tree.map((node) => renderTreeNode(node))}</div>
              </CardContent>
            </Card>
            {detailsPanel()}
          </div>
        </TabsContent>

        <TabsContent value="table">
          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardContent className="pt-1">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account Code</TableHead>
                    <TableHead>Account Name</TableHead>
                    <TableHead>Account Type</TableHead>
                    <TableHead>Parent Account</TableHead>
                    <TableHead>Normal Balance</TableHead>
                    <TableHead className="text-right">Opening Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAccounts.map((account) => (
                    <TableRow key={account.code}>
                      <TableCell className="font-medium text-slate-900">{account.code}</TableCell>
                      <TableCell>{account.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={typeBadgeClass[account.type]}>
                          {account.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{account.parentAccount}</TableCell>
                      <TableCell>{account.normalBalance}</TableCell>
                      <TableCell className="text-right">{money(account.openingBalance)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={account.status === "Active" ? "border-green-200 bg-green-50 text-green-700" : "border-slate-200 bg-slate-50 text-slate-600"}>
                          {account.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label={`${account.name} actions`}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 bg-white">
                            <DropdownMenuItem onClick={() => showDetails(account.code)}>
                              <Eye className="h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => startEdit(account)}>
                              <Edit className="h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>Deactivate</DropdownMenuItem>
                            <DropdownMenuItem
                              disabled={account.hasTransactions}
                              onClick={() => deleteAccount(account)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const Field = ({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium text-slate-700">{label}</Label>
    {children}
    {error && <p className="text-xs text-red-600">{error}</p>}
  </div>
);

const SwitchRow = ({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) => (
  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
    <Label className="text-sm font-medium text-slate-700">{label}</Label>
    <Switch checked={checked} onCheckedChange={onCheckedChange} />
  </div>
);

const Detail = ({ label, value, strong = false }: { label: string; value: React.ReactNode; strong?: boolean }) => (
  <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
    <p className={`mt-1 text-sm ${strong ? "font-bold text-slate-900" : "font-medium text-slate-700"}`}>{value}</p>
  </div>
);

export default ChartOfAccountsPage;
