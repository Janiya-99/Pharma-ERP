import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Banknote, Download, Edit, Loader2, MoreHorizontal, Plus, Search } from "lucide-react";
import { useAuth } from "../../../auth/AuthContext";
import { financeApi } from "../../../api/financeApi";
import { getBranches, getUsers } from "../../../api/controlApi";
import { Alert, AlertDescription } from "../../../components/ui/alert";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../../../components/ui/sheet";
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
import { DataTableToolbar } from "../shared/DataTableToolbar";

type ApiRecord = Record<string, any>;

type CashAccount = {
  id: number;
  branch_id?: number;
  cash_account_name: string;
  responsible_user_id?: number;
  opening_balance?: number;
  current_balance?: number;
  opening_balance_date?: string;
  linked_ledger_account_id?: number;
  linked_ledger_account?: ApiRecord;
  status: string;
  description?: string;
  branch?: ApiRecord;
  responsible_user?: ApiRecord;
};

type CashAccountForm = {
  branch_id: string;
  cash_account_name: string;
  responsible_user_id: string;
  opening_balance: string;
  opening_balance_date: string;
  linked_ledger_account_id: string;
  auto_create_ledger: boolean;
  status: string;
  description: string;
};

const emptyForm: CashAccountForm = {
  branch_id: "",
  cash_account_name: "",
  responsible_user_id: "",
  opening_balance: "0",
  opening_balance_date: new Date().toISOString().slice(0, 10),
  linked_ledger_account_id: "",
  auto_create_ledger: false,
  status: "active",
  description: "",
};

const money = (amount: number | string | undefined) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 2,
  }).format(Number(amount || 0));

const getErrorMessage = (error: any, fallback: string) =>
  error?.response?.data?.message || error?.response?.data?.error || error?.message || fallback;

const CashAccountsPage = () => {
  const { company, activeBranch, user } = useAuth();
  const companyId = company?.id || company?.company_id;
  const defaultBranchId = activeBranch?.id || activeBranch?.branch_id || activeBranch?.branch?.id || "";

  const [accounts, setAccounts] = useState<CashAccount[]>([]);
  const [branches, setBranches] = useState<ApiRecord[]>([]);
  const [users, setUsers] = useState<ApiRecord[]>([]);
  const [ledgerAccounts, setLedgerAccounts] = useState<ApiRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<CashAccount | null>(null);
  const [accountToDeactivate, setAccountToDeactivate] = useState<CashAccount | null>(null);
  const [form, setForm] = useState<CashAccountForm>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [filters, setFilters] = useState({ search: "", status: "all", branch_id: "all" });

  const fetchAccounts = async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await financeApi.getCashAccounts({
        page: 1,
        limit: 100,
        company_id: companyId,
        search: filters.search,
        status: filters.status === "all" ? "" : filters.status,
        branch_id: filters.branch_id === "all" ? "" : filters.branch_id,
      });
      setAccounts((Array.isArray(res?.data?.data) ? res.data.data : Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : []));
    } catch (error) {
      setAccounts([]);
      toast.error(getErrorMessage(error, "Failed to load cash accounts"));
    } finally {
      setLoading(false);
    }
  };

  const fetchLookups = async () => {
    try {
      const [branchesRes, usersRes, accountsRes] = await Promise.all([
        getBranches({ limit: 100 }),
        getUsers({ limit: 100 }),
        financeApi.getChartOfAccounts({ limit: 1000, status: "active", is_cash_account: true, company_id: companyId }),
      ]);
      setBranches((Array.isArray(branchesRes?.data?.data) ? branchesRes.data.data : Array.isArray(branchesRes?.data) ? branchesRes.data : Array.isArray(branchesRes) ? branchesRes : []));
      setUsers((Array.isArray(usersRes?.data?.data) ? usersRes.data.data : Array.isArray(usersRes?.data) ? usersRes.data : Array.isArray(usersRes) ? usersRes : []));
      setLedgerAccounts((Array.isArray(accountsRes?.data?.data) ? accountsRes.data.data : Array.isArray(accountsRes?.data) ? accountsRes.data : Array.isArray(accountsRes) ? accountsRes : []));
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load cash account lookups"));
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [companyId, filters.search, filters.status, filters.branch_id]);

  useEffect(() => {
    if (companyId) fetchLookups();
  }, [companyId]);

  const totalBalance = useMemo(
    () => accounts.reduce((sum, account) => sum + Number(account.current_balance || 0), 0),
    [accounts]
  );

  const setField = <K extends keyof CashAccountForm>(key: K, value: CashAccountForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const openCreateDialog = () => {
    setEditingAccount(null);
    setForm({ ...emptyForm, branch_id: defaultBranchId ? String(defaultBranchId) : "" });
    setErrors({});
    setDialogOpen(true);
  };

  const openEditDialog = (account: CashAccount) => {
    setEditingAccount(account);
    setForm({
      branch_id: account.branch_id ? String(account.branch_id) : "",
      cash_account_name: account.cash_account_name || "",
      responsible_user_id: account.responsible_user_id ? String(account.responsible_user_id) : "",
      opening_balance: String(account.opening_balance || 0),
      opening_balance_date: account.opening_balance_date || new Date().toISOString().slice(0, 10),
      linked_ledger_account_id: account.linked_ledger_account_id ? String(account.linked_ledger_account_id) : "",
      auto_create_ledger: false,
      status: account.status || "active",
      description: account.description || "",
    });
    setErrors({});
    setDialogOpen(true);
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!companyId) nextErrors.company_id = "Please select a company before saving.";
    if (!form.cash_account_name.trim()) nextErrors.cash_account_name = "Cash Account Name is required.";
    if (!form.branch_id) nextErrors.branch_id = "Branch is required.";
    if (!form.status) nextErrors.status = "Status is required.";
    if (!form.auto_create_ledger && !form.linked_ledger_account_id) {
      nextErrors.linked_ledger_account_id = "Linked Ledger Account is required unless Auto Create Ledger is enabled.";
    }
    if (Number.isNaN(Number(form.opening_balance)) || Number(form.opening_balance) < 0) {
      nextErrors.opening_balance = "Opening Balance must be a non-negative number.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        company_id: companyId,
        branch_id: Number(form.branch_id),
        cash_account_name: form.cash_account_name.trim(),
        responsible_user_id: form.responsible_user_id ? Number(form.responsible_user_id) : undefined,
        opening_balance: Number(form.opening_balance || 0),
        opening_balance_date: form.opening_balance_date,
        linked_ledger_account_id: form.linked_ledger_account_id ? Number(form.linked_ledger_account_id) : undefined,
        auto_create_ledger: form.auto_create_ledger,
        status: form.status,
        description: form.description.trim(),
        created_by: user?.id,
        updated_by: user?.id,
      };

      if (editingAccount) {
        await financeApi.updateCashAccount(editingAccount.id, payload);
        toast.success("Cash account updated successfully");
      } else {
        await financeApi.createCashAccount(payload);
        toast.success("Cash account created successfully");
      }

      setDialogOpen(false);
      setEditingAccount(null);
      setForm(emptyForm);
      fetchAccounts();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save cash account"));
    } finally {
      setSubmitting(false);
    }
  };

  const requestDeactivate = (account: CashAccount) => {
    setAccountToDeactivate(account);
    setConfirmOpen(true);
  };

  const confirmDeactivate = async () => {
    if (!accountToDeactivate) return;

    setDeactivating(true);
    try {
      await financeApi.deactivateCashAccount(accountToDeactivate.id, {
        company_id: companyId,
        updated_by: user?.id,
      });
      toast.success("Cash account deactivated successfully");
      setConfirmOpen(false);
      setAccountToDeactivate(null);
      fetchAccounts();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to deactivate cash account"));
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
          <AlertDescription>Please select a company before using Finance cash accounts.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-[#F8FAFC] p-6 text-slate-900">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Finance / Banking & Cash</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Cash Accounts</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-500">
            Manage cash locations such as main cash, petty cash, branch cash, and cashier cash.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" className="border-slate-200 bg-white text-slate-700">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Card className="mb-4 border border-slate-200 bg-white shadow-sm">
        <CardContent className="flex items-center gap-4">
          <div className="rounded-xl bg-green-50 p-3 text-green-600">
            <Banknote className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Visible Cash Balance</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{money(totalBalance)}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="border border-slate-200 bg-white shadow-sm overflow-hidden">
        <DataTableToolbar
          searchQuery={filters.search}
          onSearchChange={(value) =>
            setFilters((current) => ({ ...current, search: value }))
          }
          statusFilter={true}
          statusValue={filters.status}
          onStatusChange={(value) =>
            setFilters((current) => ({ ...current, status: value }))
          }
          onAdd={() => {
            setEditingAccount(null);
            form.reset();
            setDialogOpen(true);
          }}
        />
        <CardContent className="pt-0 p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80">
                <TableHead className="text-xs uppercase font-bold text-slate-500 tracking-wide">Cash Account Name</TableHead>
                <TableHead className="text-xs uppercase font-bold text-slate-500 tracking-wide">Branch</TableHead>
                <TableHead className="text-xs uppercase font-bold text-slate-500 tracking-wide">Responsible User</TableHead>
                <TableHead className="text-xs uppercase font-bold text-slate-500 tracking-wide text-right">Current Balance</TableHead>
                <TableHead className="text-xs uppercase font-bold text-slate-500 tracking-wide">Linked Ledger Account</TableHead>
                <TableHead className="text-xs uppercase font-bold text-slate-500 tracking-wide">Status</TableHead>
                <TableHead className="text-xs uppercase font-bold text-slate-500 tracking-wide text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-28 text-center text-slate-500">
                    <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
                    Loading cash accounts...
                  </TableCell>
                </TableRow>
              ) : accounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-28 text-center text-slate-500">
                    No cash accounts found.
                  </TableCell>
                </TableRow>
              ) : (
                accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-semibold text-slate-900">{account.cash_account_name}</TableCell>
                    <TableCell>{account.branch?.branch_name || account.branch_id || "-"}</TableCell>
                    <TableCell>{account.responsible_user?.name || account.responsible_user?.full_name || account.responsible_user_id || "-"}</TableCell>
                    <TableCell className="text-right font-semibold text-slate-900">{money(account.current_balance)}</TableCell>
                    <TableCell className="max-w-[260px] truncate text-slate-600">
                      {account.linked_ledger_account
                        ? `${account.linked_ledger_account.account_code} - ${account.linked_ledger_account.account_name}`
                        : account.linked_ledger_account_id || "-"}
                    </TableCell>
                    <TableCell>{statusBadge(account.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" aria-label={`Actions for ${account.cash_account_name}`}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem onClick={() => openEditDialog(account)}>
                            <Edit className="h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>View Cash Book</DropdownMenuItem>
                          <DropdownMenuItem>View Ledger</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => requestDeactivate(account)}>
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

      <Sheet open={dialogOpen} onOpenChange={setDialogOpen}>
        <SheetContent className="flex w-full flex-col overflow-hidden bg-white p-0 sm:max-w-2xl border-l border-slate-200 shadow-2xl">
          <SheetHeader className="border-b border-slate-100 bg-slate-50/50 px-6 py-5 shrink-0">
            <SheetTitle className="text-xl font-bold text-slate-800">{editingAccount ? "Edit Cash Account" : "Add Cash Account"}</SheetTitle>
            <SheetDescription>Cash accounts must link to a cash ledger account or request backend auto-create.</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {errors.company_id && (
              <Alert variant="destructive" className="mb-6">
                <AlertTitle>Company context required</AlertTitle>
                <AlertDescription>{errors.company_id}</AlertDescription>
              </Alert>
            )}
            <form id="cash-account-form" onSubmit={submitForm} className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Field label="Cash Account Name" error={errors.cash_account_name} required>
                <Input value={form.cash_account_name} onChange={(event) => setField("cash_account_name", event.target.value)} />
              </Field>
              <Field label="Branch" error={errors.branch_id} required>
                <Select value={form.branch_id} onValueChange={(value) => setField("branch_id", value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={String(branch.id)}>
                        {branch.branch_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Responsible User">
                <Select value={form.responsible_user_id || "none"} onValueChange={(value) => setField("responsible_user_id", value === "none" ? "" : value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Not assigned</SelectItem>
                    {users.map((item) => (
                      <SelectItem key={item.id} value={String(item.id)}>
                        {item.name || item.full_name || item.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Opening Balance" error={errors.opening_balance}>
                <Input type="number" min="0" step="0.01" value={form.opening_balance} onChange={(event) => setField("opening_balance", event.target.value)} />
              </Field>
              <Field label="Opening Balance Date">
                <Input type="date" value={form.opening_balance_date} onChange={(event) => setField("opening_balance_date", event.target.value)} />
              </Field>
              <Field label="Linked Ledger Account" error={errors.linked_ledger_account_id} required={!form.auto_create_ledger}>
                <Select
                  value={form.linked_ledger_account_id}
                  disabled={form.auto_create_ledger}
                  onValueChange={(value) => setField("linked_ledger_account_id", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select cash ledger account" />
                  </SelectTrigger>
                  <SelectContent>
                    {ledgerAccounts.map((account) => (
                      <SelectItem key={account.id} value={String(account.id)}>
                        {account.account_code} - {account.account_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Status" error={errors.status} required>
                <Select value={form.status} onValueChange={(value) => setField("status", value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <div className="flex flex-col gap-2 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm hover:border-indigo-200 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <Label className="text-sm font-semibold text-slate-700 leading-tight">Auto Create Ledger</Label>
                    <p className="mt-1 text-xs text-slate-500">Backend should create Assets / Current Assets / Cash Accounts ledger.</p>
                  </div>
                  <Switch checked={form.auto_create_ledger} onCheckedChange={(checked) => setField("auto_create_ledger", checked)} />
                </div>
              </div>
            </div>
            <Separator className="my-6" />
            <Field label="Description">
              <Input value={form.description} onChange={(event) => setField("description", event.target.value)} />
            </Field>
          </form>
          </div>
          <SheetFooter className="border-t border-slate-100 bg-slate-50/50 px-6 py-4 shrink-0 flex flex-row items-center justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button form="cash-account-form" type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save Cash Account
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <ERPConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDeactivate}
        title="Deactivate Cash Account"
        message="Cash accounts with transactions should be deactivated rather than deleted."
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
  <div className="space-y-1.5">
    <Label className="text-sm font-semibold text-slate-700">
      {label}
      {required && <span className="text-red-600 ml-1">*</span>}
    </Label>
    {children}
    {error && <p className="text-xs font-medium text-red-600">{error}</p>}
  </div>
);

export default CashAccountsPage;
