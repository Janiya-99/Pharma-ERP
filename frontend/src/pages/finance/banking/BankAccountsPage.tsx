import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  BookOpen,
  Download,
  Edit,
  Eye,
  FileText,
  Landmark,
  Loader2,
  MoreHorizontal,
  Plus,
  RefreshCcw,
  Search,
} from "lucide-react";
import { useAuth } from "../../../auth/AuthContext";
import { financeApi } from "../../../api/financeApi";
import { getBranches } from "../../../api/controlApi";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../../../components/ui/alert";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
import { Separator } from "../../../components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../../../components/ui/sheet";
import { Switch } from "../../../components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import ERPConfirmDialog from "../../../components/erp/ERPConfirmDialog";

type ApiRecord = Record<string, any>;

type BankAccount = {
  id: number;
  company_id?: number;
  branch_id?: number | null;
  chart_account_id: number;
  bank_name: string;
  bank_branch_name?: string;
  account_name: string;
  account_number: string;
  swift_code?: string;
  bank_code?: string;
  branch_code?: string;
  opening_balance?: number;
  current_balance?: number;
  is_default?: boolean;
  status: string;
  created_at?: string;
  updated_at?: string;
  chart_account?: {
    id: number;
    account_code: string;
    account_name: string;
  };
};

type BankAccountForm = {
  branch_id: string;
  chart_account_id: string;
  bank_name: string;
  bank_branch_name: string;
  account_name: string;
  account_number: string;
  account_type: string;
  currency: string;
  opening_balance: string;
  opening_balance_date: string;
  auto_create_ledger: boolean;
  status: string;
  description: string;
  swift_code: string;
  bank_code: string;
  branch_code: string;
  is_default: boolean;
};

const emptyForm: BankAccountForm = {
  branch_id: "",
  chart_account_id: "",
  bank_name: "",
  bank_branch_name: "",
  account_name: "",
  account_number: "",
  account_type: "current",
  currency: "LKR",
  opening_balance: "0",
  opening_balance_date: new Date().toISOString().slice(0, 10),
  auto_create_ledger: false,
  status: "active",
  description: "",
  swift_code: "",
  bank_code: "",
  branch_code: "",
  is_default: false,
};

const accountTypeOptions = [
  { value: "current", label: "Current Account" },
  { value: "savings", label: "Savings Account" },
  { value: "overdraft", label: "Overdraft Account" },
  { value: "loan", label: "Loan Account" },
  { value: "fixed_deposit", label: "Fixed Deposit" },
];

const money = (amount: number | string | undefined, currency = "LKR") =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(Number(amount || 0));

const getErrorMessage = (error: any, fallback: string) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

const BankAccountsPage = () => {
  const { company, activeBranch, user } = useAuth();
  const companyId = company?.id || company?.company_id;
  const defaultBranchId =
    activeBranch?.id ||
    activeBranch?.branch_id ||
    activeBranch?.branch?.id ||
    "";

  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [branches, setBranches] = useState<ApiRecord[]>([]);
  const [ledgerAccounts, setLedgerAccounts] = useState<ApiRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(
    null
  );
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(
    null
  );
  const [accountToDeactivate, setAccountToDeactivate] =
    useState<BankAccount | null>(null);
  const [form, setForm] = useState<BankAccountForm>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
    branch_id: "all",
  });

  const fetchAccounts = async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await financeApi.getBankAccounts({
        page: 1,
        limit: 100,
        search: filters.search,
        status: filters.status === "all" ? "" : filters.status,
        branch_id: filters.branch_id === "all" ? "" : filters.branch_id,
        company_id: companyId,
      });
      setAccounts(res.data?.data || []);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load bank accounts"));
    } finally {
      setLoading(false);
    }
  };

  const fetchLookups = async () => {
    try {
      const [branchesRes, accountsRes] = await Promise.all([
        getBranches({ limit: 100 }),
        financeApi.getChartOfAccounts({
          limit: 1000,
          status: "active",
          is_bank_account: true,
          company_id: companyId,
        }),
      ]);

      setBranches(branchesRes?.data || []);
      setLedgerAccounts(accountsRes.data?.data || []);
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Failed to load bank account lookups")
      );
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [companyId, filters.search, filters.status, filters.branch_id]);

  useEffect(() => {
    if (companyId) fetchLookups();
  }, [companyId]);

  const totalBalance = useMemo(
    () =>
      accounts.reduce(
        (sum, account) => sum + Number(account.current_balance || 0),
        0
      ),
    [accounts]
  );

  const setField = <K extends keyof BankAccountForm>(
    key: K,
    value: BankAccountForm[K]
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const openCreateDialog = () => {
    setEditingAccount(null);
    setForm({
      ...emptyForm,
      branch_id: defaultBranchId ? String(defaultBranchId) : "",
    });
    setErrors({});
    setDialogOpen(true);
  };

  const openEditDialog = (account: BankAccount) => {
    setEditingAccount(account);
    setForm({
      ...emptyForm,
      branch_id: account.branch_id ? String(account.branch_id) : "",
      chart_account_id: account.chart_account_id
        ? String(account.chart_account_id)
        : "",
      bank_name: account.bank_name || "",
      bank_branch_name: account.bank_branch_name || "",
      account_name: account.account_name || "",
      account_number: account.account_number || "",
      opening_balance: String(account.opening_balance || 0),
      status: account.status || "active",
      swift_code: account.swift_code || "",
      bank_code: account.bank_code || "",
      branch_code: account.branch_code || "",
      is_default: !!account.is_default,
    });
    setErrors({});
    setDialogOpen(true);
  };

  const openDetails = async (account: BankAccount) => {
    setSelectedAccount(account);
    setDetailsOpen(true);
    try {
      const res = await financeApi.getBankAccountById(account.id);
      if (res.data?.success) setSelectedAccount(res.data.data);
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Failed to load bank account details")
      );
    }
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!companyId)
      nextErrors.company_id = "Please select a company before saving.";
    if (!form.bank_name.trim()) nextErrors.bank_name = "Bank Name is required.";
    if (!form.account_name.trim())
      nextErrors.account_name = "Account Name is required.";
    if (!form.account_number.trim())
      nextErrors.account_number = "Account Number is required.";
    if (!form.account_type)
      nextErrors.account_type = "Account Type is required.";
    if (!form.currency) nextErrors.currency = "Currency is required.";
    if (!form.status) nextErrors.status = "Status is required.";
    if (!form.auto_create_ledger && !form.chart_account_id) {
      nextErrors.chart_account_id =
        "Linked Ledger Account is required unless Auto Create Ledger is enabled.";
    }
    if (
      Number.isNaN(Number(form.opening_balance)) ||
      Number(form.opening_balance) < 0
    ) {
      nextErrors.opening_balance =
        "Opening Balance must be a non-negative number.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    if (form.auto_create_ledger) {
      setErrors({
        chart_account_id:
          "Auto-create ledger is not available in the current backend route. Select an existing bank ledger account.",
      });
      toast.error(
        "Select an existing bank ledger account until backend auto-create is available."
      );
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        company_id: companyId,
        branch_id: form.branch_id ? Number(form.branch_id) : undefined,
        chart_account_id: Number(form.chart_account_id),
        bank_name: form.bank_name.trim(),
        bank_branch_name: form.bank_branch_name.trim(),
        bank_branch: form.bank_branch_name.trim(),
        account_name: form.account_name.trim(),
        account_number: form.account_number.trim(),
        account_type: form.account_type,
        currency: form.currency,
        opening_balance: Number(form.opening_balance || 0),
        opening_balance_date: form.opening_balance_date,
        linked_ledger_account_id: Number(form.chart_account_id),
        auto_create_ledger: form.auto_create_ledger,
        status: form.status,
        description: form.description.trim(),
        swift_code: form.swift_code.trim(),
        bank_code: form.bank_code.trim(),
        branch_code: form.branch_code.trim(),
        is_default: form.is_default,
        created_by: user?.id,
        updated_by: user?.id,
      };

      if (editingAccount) {
        await financeApi.updateBankAccount(editingAccount.id, payload);
        toast.success("Bank account updated successfully");
      } else {
        await financeApi.createBankAccount(payload);
        toast.success("Bank account created successfully");
      }

      setDialogOpen(false);
      setEditingAccount(null);
      setForm(emptyForm);
      fetchAccounts();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save bank account"));
    } finally {
      setSubmitting(false);
    }
  };

  const requestDeactivate = (account: BankAccount) => {
    setAccountToDeactivate(account);
    setConfirmOpen(true);
  };

  const confirmDeactivate = async () => {
    if (!accountToDeactivate) return;

    setDeactivating(true);
    try {
      try {
        await financeApi.deactivateBankAccount(accountToDeactivate.id, {
          company_id: companyId,
          updated_by: user?.id,
        });
      } catch (error: any) {
        if (
          error?.response?.status === 404 ||
          error?.response?.status === 405
        ) {
          await financeApi.deleteBankAccount(accountToDeactivate.id);
        } else {
          throw error;
        }
      }
      toast.success("Bank account deactivated successfully");
      setConfirmOpen(false);
      setAccountToDeactivate(null);
      fetchAccounts();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to deactivate bank account"));
    } finally {
      setDeactivating(false);
    }
  };

  const statusBadge = (status: string) => (
    <Badge
      variant="outline"
      className={
        status === "active"
          ? "border-green-200 bg-green-50 text-green-700"
          : "border-slate-200 bg-slate-50 text-slate-600"
      }
    >
      {status === "active" ? "Active" : "Inactive"}
    </Badge>
  );

  if (!companyId) {
    return (
      <div className="min-h-full bg-[#F8FAFC] p-6">
        <Alert variant="destructive">
          <AlertTitle>Company context required</AlertTitle>
          <AlertDescription>
            Please select a company before using Finance bank accounts.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="text-slate-900 min-h-full bg-[#F8FAFC] p-6">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            Finance / Banking & Cash
          </p>
          <h1 className="text-slate-900 mt-1 text-3xl font-bold tracking-tight">
            Bank Accounts
          </h1>
          <p className="text-slate-500 mt-2 max-w-3xl text-sm">
            Create and manage company bank accounts used for payments, receipts,
            bank book, and reconciliation.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            className="border-slate-200 text-slate-700 bg-white"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button
            onClick={openCreateDialog}
            className="bg-indigo-600 text-white hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            Add Bank Account
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border-slate-200 border bg-white shadow-sm">
          <CardContent className="flex items-center gap-4">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">
                Bank Accounts
              </p>
              <p className="text-slate-900 mt-1 text-2xl font-bold">
                {accounts.length}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-slate-200 border bg-white shadow-sm md:col-span-2">
          <CardContent className="flex items-center gap-4">
            <div className="rounded-xl bg-green-50 p-3 text-green-600">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-slate-500 text-sm font-medium">
                Visible Current Balance
              </p>
              <p className="text-slate-900 mt-1 text-2xl font-bold">
                {money(totalBalance)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-slate-200 mt-4 border bg-white shadow-sm">
        <CardHeader className="border-slate-100 border-b">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <CardTitle>Company Bank Accounts</CardTitle>
              <CardDescription>
                Accounts are linked to Chart of Accounts ledger records flagged
                as bank accounts.
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="text-slate-400 pointer-events-none absolute left-2.5 top-2 h-4 w-4" />
                <Input
                  value={filters.search}
                  onChange={(event) =>
                    setFilters((current) => ({
                      ...current,
                      search: event.target.value,
                    }))
                  }
                  placeholder="Search accounts"
                  className="border-slate-200 h-9 w-full bg-white pl-8 sm:w-64"
                />
              </div>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  setFilters((current) => ({ ...current, status: value }))
                }
              >
                <SelectTrigger className="border-slate-200 h-9 w-full bg-white sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.branch_id}
                onValueChange={(value) =>
                  setFilters((current) => ({ ...current, branch_id: value }))
                }
              >
                <SelectTrigger className="border-slate-200 h-9 w-full bg-white sm:w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={String(branch.id)}>
                      {branch.branch_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80">
                <TableHead>Bank Name</TableHead>
                <TableHead>Account Name</TableHead>
                <TableHead>Account Number</TableHead>
                <TableHead className="text-right">Current Balance</TableHead>
                <TableHead>Linked Ledger Account</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-slate-500 h-28 text-center"
                  >
                    <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
                    Loading bank accounts...
                  </TableCell>
                </TableRow>
              ) : accounts.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-slate-500 h-28 text-center"
                  >
                    No bank accounts found.
                  </TableCell>
                </TableRow>
              ) : (
                accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
                          <Landmark className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-slate-900 font-semibold">
                            {account.bank_name}
                          </p>
                          <p className="text-slate-500 text-xs">
                            {account.bank_branch_name || "No branch name"}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-800 font-medium">
                      {account.account_name}
                    </TableCell>
                    <TableCell className="text-slate-600 font-mono text-xs">
                      {account.account_number}
                    </TableCell>
                    <TableCell className="text-slate-900 text-right font-semibold">
                      {money(account.current_balance)}
                    </TableCell>
                    <TableCell className="text-slate-600 max-w-[260px] truncate">
                      {account.chart_account
                        ? `${account.chart_account.account_code} - ${account.chart_account.account_name}`
                        : `#${account.chart_account_id}`}
                    </TableCell>
                    <TableCell>{statusBadge(account.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label={`Actions for ${account.account_name}`}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={() => openDetails(account)}
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => openEditDialog(account)}
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <BookOpen className="h-4 w-4" />
                            View Bank Book
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="h-4 w-4" />
                            View Ledger
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-600 focus:text-red-600"
                            onClick={() => requestDeactivate(account)}
                          >
                            <RefreshCcw className="h-4 w-4" />
                            Deactivate
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto bg-white sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {editingAccount ? "Edit Bank Account" : "Add Bank Account"}
            </DialogTitle>
            <DialogDescription>
              Link each bank account to an active bank ledger account from Chart
              of Accounts.
            </DialogDescription>
          </DialogHeader>
          {errors.company_id && (
            <Alert variant="destructive">
              <AlertTitle>Company context required</AlertTitle>
              <AlertDescription>{errors.company_id}</AlertDescription>
            </Alert>
          )}
          <form
            id="bank-account-form"
            onSubmit={submitForm}
            className="space-y-5"
          >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Bank Name" error={errors.bank_name} required>
                <Input
                  value={form.bank_name}
                  onChange={(event) =>
                    setField("bank_name", event.target.value)
                  }
                />
              </Field>
              <Field label="Branch Name">
                <Input
                  value={form.bank_branch_name}
                  onChange={(event) =>
                    setField("bank_branch_name", event.target.value)
                  }
                />
              </Field>
              <Field label="Account Name" error={errors.account_name} required>
                <Input
                  value={form.account_name}
                  onChange={(event) =>
                    setField("account_name", event.target.value)
                  }
                />
              </Field>
              <Field
                label="Account Number"
                error={errors.account_number}
                required
              >
                <Input
                  value={form.account_number}
                  onChange={(event) =>
                    setField("account_number", event.target.value)
                  }
                />
              </Field>
              <Field label="Branch">
                <Select
                  value={form.branch_id || "none"}
                  onValueChange={(value) =>
                    setField("branch_id", value === "none" ? "" : value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Company Level</SelectItem>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={String(branch.id)}>
                        {branch.branch_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field
                label="Linked Ledger Account"
                error={errors.chart_account_id}
                required={!form.auto_create_ledger}
              >
                <Select
                  value={form.chart_account_id}
                  onValueChange={(value) => setField("chart_account_id", value)}
                  disabled={form.auto_create_ledger}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select bank ledger account" />
                  </SelectTrigger>
                  <SelectContent>
                    {ledgerAccounts.map((account) => (
                      <SelectItem key={account.id} value={String(account.id)}>
                        {account.account_code} - {account.account_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-slate-500 mt-1 text-xs">
                  The backend requires this ledger to be flagged as a bank
                  account.
                </p>
              </Field>
              <Field label="Account Type" error={errors.account_type} required>
                <Select
                  value={form.account_type}
                  onValueChange={(value) => setField("account_type", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {accountTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Currency" error={errors.currency} required>
                <Select
                  value={form.currency}
                  onValueChange={(value) => setField("currency", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LKR">LKR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Opening Balance" error={errors.opening_balance}>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.opening_balance}
                  onChange={(event) =>
                    setField("opening_balance", event.target.value)
                  }
                />
              </Field>
              <Field label="Opening Balance Date">
                <Input
                  type="date"
                  value={form.opening_balance_date}
                  onChange={(event) =>
                    setField("opening_balance_date", event.target.value)
                  }
                />
              </Field>
              <Field label="Status" error={errors.status} required>
                <Select
                  value={form.status}
                  onValueChange={(value) => setField("status", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <div className="border-slate-200 bg-slate-50 flex items-center justify-between rounded-xl border p-4">
                <div>
                  <Label>Default Bank Account</Label>
                  <p className="text-slate-500 mt-1 text-xs">
                    Marks this as the default bank account in Finance.
                  </p>
                </div>
                <Switch
                  checked={form.is_default}
                  onCheckedChange={(checked) => setField("is_default", checked)}
                />
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field label="SWIFT Code">
                <Input
                  value={form.swift_code}
                  onChange={(event) =>
                    setField("swift_code", event.target.value)
                  }
                />
              </Field>
              <Field label="Bank Code">
                <Input
                  value={form.bank_code}
                  onChange={(event) =>
                    setField("bank_code", event.target.value)
                  }
                />
              </Field>
              <Field label="Branch Code">
                <Input
                  value={form.branch_code}
                  onChange={(event) =>
                    setField("branch_code", event.target.value)
                  }
                />
              </Field>
            </div>
          </form>
          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => setDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              form="bank-account-form"
              type="submit"
              className="bg-indigo-600 text-white hover:bg-indigo-700"
              disabled={submitting}
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingAccount ? "Save Bank Account" : "Save Bank Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent className="w-full overflow-y-auto bg-white sm:max-w-xl">
          {selectedAccount && (
            <>
              <SheetHeader className="border-slate-100 border-b">
                <SheetTitle>{selectedAccount.account_name}</SheetTitle>
                <SheetDescription>
                  {selectedAccount.bank_name} / {selectedAccount.account_number}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-4 p-4">
                <Detail
                  label="Current Balance"
                  value={money(selectedAccount.current_balance)}
                />
                <Detail label="Bank Name" value={selectedAccount.bank_name} />
                <Detail
                  label="Branch Name"
                  value={selectedAccount.bank_branch_name || "-"}
                />
                <Detail
                  label="Linked Ledger Account"
                  value={
                    selectedAccount.chart_account
                      ? `${selectedAccount.chart_account.account_code} - ${selectedAccount.chart_account.account_name}`
                      : `#${selectedAccount.chart_account_id}`
                  }
                />
                <Detail label="Status" value={selectedAccount.status} />
                <Detail
                  label="Created Date"
                  value={
                    selectedAccount.created_at
                      ? new Date(
                          selectedAccount.created_at
                        ).toLocaleDateString()
                      : "-"
                  }
                />
                <Detail
                  label="Last Updated Date"
                  value={
                    selectedAccount.updated_at
                      ? new Date(
                          selectedAccount.updated_at
                        ).toLocaleDateString()
                      : "-"
                  }
                />
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => openEditDialog(selectedAccount)}
                  >
                    <Edit className="h-4 w-4" />
                    Edit Account
                  </Button>
                  <Button variant="outline">
                    <BookOpen className="h-4 w-4" />
                    View Bank Book
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <ERPConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDeactivate}
        title="Deactivate Bank Account"
        message="Bank accounts with transactions cannot be removed. This action will deactivate or soft-delete the account according to backend safety rules."
        confirmLabel="Deactivate"
        confirmVariant="danger"
        isLoading={deactivating}
      />
    </div>
  );
};

const Field = ({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-2">
    <Label>
      {label}
      {required && <span className="text-red-600">*</span>}
    </Label>
    {children}
    {error && <p className="text-xs font-medium text-red-600">{error}</p>}
  </div>
);

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div className="border-slate-200 rounded-xl border bg-white p-3">
    <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">
      {label}
    </p>
    <p className="text-slate-900 mt-1 text-sm font-semibold">{value}</p>
  </div>
);

export default BankAccountsPage;
