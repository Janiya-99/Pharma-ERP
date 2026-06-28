import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Edit, Eye, FolderTree, Loader2, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react";
import { useAuth } from "../../../auth/AuthContext";
import { financeApi } from "../../../api/financeApi";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
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

type Account = {
  id: number;
  company_id?: number;
  branch_id?: number | null;
  account_code: string;
  account_name: string;
  account_classification_id: number;
  parent_account_id?: number | null;
  account_level?: number;
  account_type?: string;
  normal_balance?: string;
  is_control_account?: boolean;
  is_bank_account?: boolean;
  is_cash_account?: boolean;
  opening_balance?: number;
  current_balance?: number;
  status: string;
  created_at?: string;
  classification?: ApiRecord;
  account_classification?: ApiRecord;
  parent_account?: ApiRecord;
};

type AccountForm = {
  account_code: string;
  account_name: string;
  account_classification_id: string;
  parent_account_id: string;
  account_level: string;
  account_type: string;
  normal_balance: string;
  opening_balance: string;
  status: string;
  is_control_account: boolean;
  is_bank_account: boolean;
  is_cash_account: boolean;
};

const emptyForm: AccountForm = {
  account_code: "",
  account_name: "",
  account_classification_id: "",
  parent_account_id: "",
  account_level: "1",
  account_type: "asset",
  normal_balance: "debit",
  opening_balance: "0",
  status: "active",
  is_control_account: false,
  is_bank_account: false,
  is_cash_account: false,
};

const accountTypes = ["asset", "liability", "equity", "income", "expense"];

const getErrorMessage = (error: any, fallback: string) =>
  error?.response?.data?.message || error?.response?.data?.error || error?.message || fallback;

const money = (amount: number | string | undefined) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 2,
  }).format(Number(amount || 0));

const ChartOfAccountsPage = () => {
  const { company, activeBranch, user } = useAuth();
  const companyId = company?.id || company?.company_id;
  const defaultBranchId = activeBranch?.id || activeBranch?.branch_id || activeBranch?.branch?.id || "";

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [classifications, setClassifications] = useState<ApiRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [accountToDeactivate, setAccountToDeactivate] = useState<Account | null>(null);
  const [form, setForm] = useState<AccountForm>(emptyForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [filters, setFilters] = useState({ search: "", account_type: "all", status: "all" });

  const fetchAccounts = async () => {
    if (!companyId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await financeApi.getChartOfAccounts({
        page: 1,
        limit: 500,
        company_id: companyId,
        search: filters.search,
        account_type: filters.account_type === "all" ? "" : filters.account_type,
        status: filters.status === "all" ? "" : filters.status,
      });
      setAccounts(res.data?.data || []);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load chart of accounts"));
    } finally {
      setLoading(false);
    }
  };

  const fetchClassifications = async () => {
    try {
      const res = await financeApi.getAccountClassifications({ limit: 1000, status: "active", company_id: companyId });
      setClassifications(res.data?.data || []);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load account classifications"));
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [companyId, filters.search, filters.account_type, filters.status]);

  useEffect(() => {
    if (companyId) fetchClassifications();
  }, [companyId]);

  const rootAccounts = useMemo(() => accounts.filter((account) => !account.parent_account_id), [accounts]);

  const setField = <K extends keyof AccountForm>(key: K, value: AccountForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const openCreateDialog = () => {
    setEditingAccount(null);
    setForm(emptyForm);
    setErrors({});
    setDialogOpen(true);
  };

  const openEditDialog = (account: Account) => {
    setEditingAccount(account);
    setForm({
      account_code: account.account_code || "",
      account_name: account.account_name || "",
      account_classification_id: account.account_classification_id ? String(account.account_classification_id) : "",
      parent_account_id: account.parent_account_id ? String(account.parent_account_id) : "",
      account_level: String(account.account_level || 1),
      account_type: account.account_type || "asset",
      normal_balance: account.normal_balance || "debit",
      opening_balance: String(account.opening_balance || 0),
      status: account.status || "active",
      is_control_account: !!account.is_control_account,
      is_bank_account: !!account.is_bank_account,
      is_cash_account: !!account.is_cash_account,
    });
    setErrors({});
    setDialogOpen(true);
  };

  const openDetails = async (account: Account) => {
    setSelectedAccount(account);
    setDetailsOpen(true);
    try {
      const res = await financeApi.getChartOfAccountById(account.id);
      if (res.data?.success) setSelectedAccount(res.data.data);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to load account details"));
    }
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!companyId) nextErrors.company_id = "Please select a company before saving.";
    if (!form.account_code.trim()) nextErrors.account_code = "Account Code is required.";
    if (!form.account_name.trim()) nextErrors.account_name = "Account Name is required.";
    if (!form.account_classification_id) nextErrors.account_classification_id = "Classification is required.";
    if (!form.account_type) nextErrors.account_type = "Account Type is required.";
    if (!form.normal_balance) nextErrors.normal_balance = "Normal Balance is required.";
    if (!form.status) nextErrors.status = "Status is required.";
    if (form.parent_account_id && editingAccount && Number(form.parent_account_id) === editingAccount.id) {
      nextErrors.parent_account_id = "Parent account cannot be the same account.";
    }
    if ((form.is_bank_account || form.is_cash_account) && form.account_type !== "asset") {
      nextErrors.account_type = "Bank and Cash flags can only be used for Asset accounts.";
    }
    if (Number.isNaN(Number(form.opening_balance))) nextErrors.opening_balance = "Opening Balance must be numeric.";
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
        branch_id: defaultBranchId ? Number(defaultBranchId) : undefined,
        account_code: form.account_code.trim(),
        account_name: form.account_name.trim(),
        account_classification_id: Number(form.account_classification_id),
        parent_account_id: form.parent_account_id ? Number(form.parent_account_id) : undefined,
        account_level: Number(form.account_level || 1),
        account_type: form.account_type,
        normal_balance: form.normal_balance,
        opening_balance: Number(form.opening_balance || 0),
        status: form.status,
        is_control_account: form.is_control_account,
        is_bank_account: form.is_bank_account,
        is_cash_account: form.is_cash_account,
        created_by: user?.id,
        updated_by: user?.id,
      };

      if (editingAccount) {
        await financeApi.updateChartOfAccount(editingAccount.id, payload);
        toast.success("Account updated successfully");
      } else {
        await financeApi.createChartOfAccount(payload);
        toast.success("Account created successfully");
      }

      setDialogOpen(false);
      setEditingAccount(null);
      setForm(emptyForm);
      fetchAccounts();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to save account"));
    } finally {
      setSubmitting(false);
    }
  };

  const requestDeactivate = (account: Account) => {
    setAccountToDeactivate(account);
    setConfirmOpen(true);
  };

  const confirmDeactivate = async () => {
    if (!accountToDeactivate) return;
    setDeactivating(true);
    try {
      try {
        await financeApi.deactivateChartOfAccount?.(accountToDeactivate.id, {
          company_id: companyId,
          updated_by: user?.id,
        });
      } catch (error: any) {
        if (error?.response?.status === 404 || error?.response?.status === 405 || !financeApi.deactivateChartOfAccount) {
          await financeApi.deleteChartOfAccount(accountToDeactivate.id);
        } else {
          throw error;
        }
      }
      toast.success("Account deactivated successfully");
      setConfirmOpen(false);
      setAccountToDeactivate(null);
      fetchAccounts();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to deactivate account"));
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

  return (
    <div className="min-h-full bg-[#F8FAFC] p-6 text-slate-900">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Finance / Accounting Setup</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Chart of Accounts</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-500">
            Create, organize, and maintain ledger accounts used by journals, vouchers, bank accounts, cash accounts, and reports.
          </p>
        </div>
        <Button onClick={openCreateDialog} className="bg-indigo-600 text-white hover:bg-indigo-700">
          <Plus className="h-4 w-4" />
          Create Account
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center gap-2">
              <FolderTree className="h-4 w-4 text-indigo-600" />
              Account Tree
            </CardTitle>
            <CardDescription>Root accounts loaded from the API.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {rootAccounts.length === 0 ? (
              <p className="text-sm text-slate-500">No root accounts found.</p>
            ) : (
              rootAccounts.map((account) => (
                <button
                  key={account.id}
                  onClick={() => openDetails(account)}
                  className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm hover:bg-slate-50"
                >
                  <span className="truncate font-medium text-slate-800">{account.account_code} - {account.account_name}</span>
                  <Eye className="h-3.5 w-3.5 text-slate-400" />
                </button>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <CardTitle>Ledger Accounts</CardTitle>
                <CardDescription>Search, filter, create, edit, view, and deactivate accounts.</CardDescription>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-2.5 top-2 h-4 w-4 text-slate-400" />
                  <Input
                    value={filters.search}
                    onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                    placeholder="Search accounts"
                    className="h-9 w-full border-slate-200 bg-white pl-8 sm:w-64"
                  />
                </div>
                <Select value={filters.account_type} onValueChange={(value) => setFilters((current) => ({ ...current, account_type: value }))}>
                  <SelectTrigger className="h-9 w-full border-slate-200 bg-white sm:w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {accountTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filters.status} onValueChange={(value) => setFilters((current) => ({ ...current, status: value }))}>
                  <SelectTrigger className="h-9 w-full border-slate-200 bg-white sm:w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80">
                  <TableHead>Code</TableHead>
                  <TableHead>Account Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Normal Balance</TableHead>
                  <TableHead className="text-right">Current Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-28 text-center text-slate-500">
                      <Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />
                      Loading chart of accounts...
                    </TableCell>
                  </TableRow>
                ) : accounts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-28 text-center text-slate-500">No accounts found.</TableCell>
                  </TableRow>
                ) : (
                  accounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-mono text-xs text-slate-600">{account.account_code}</TableCell>
                      <TableCell>
                        <p className="font-semibold text-slate-900">{account.account_name}</p>
                        <p className="text-xs text-slate-500">
                          {account.classification?.name || account.account_classification?.name || "Unclassified"}
                        </p>
                      </TableCell>
                      <TableCell className="capitalize">{account.account_type || "-"}</TableCell>
                      <TableCell className="capitalize">{account.normal_balance || "-"}</TableCell>
                      <TableCell className="text-right font-semibold">{money(account.current_balance)}</TableCell>
                      <TableCell>{statusBadge(account.status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" aria-label={`Actions for ${account.account_name}`}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44">
                            <DropdownMenuItem onClick={() => openDetails(account)}>
                              <Eye className="h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openEditDialog(account)}>
                              <Edit className="h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => requestDeactivate(account)}>
                              <Trash2 className="h-4 w-4" />
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
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto bg-white sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{editingAccount ? "Update Account" : "Create Account"}</DialogTitle>
            <DialogDescription>Accounts with transactions should be deactivated instead of deleted.</DialogDescription>
          </DialogHeader>
          <form id="account-form" onSubmit={submitForm} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Account Code" error={errors.account_code} required>
                <Input value={form.account_code} onChange={(event) => setField("account_code", event.target.value)} disabled={!!editingAccount} />
              </Field>
              <Field label="Account Name" error={errors.account_name} required>
                <Input value={form.account_name} onChange={(event) => setField("account_name", event.target.value)} />
              </Field>
              <Field label="Classification" error={errors.account_classification_id} required>
                <Select value={form.account_classification_id} onValueChange={(value) => setField("account_classification_id", value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select classification" />
                  </SelectTrigger>
                  <SelectContent>
                    {classifications.map((item) => (
                      <SelectItem key={item.id} value={String(item.id)}>
                        {item.name} {item.level ? `(Level ${item.level})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Parent Account" error={errors.parent_account_id}>
                <Select value={form.parent_account_id || "none"} onValueChange={(value) => setField("parent_account_id", value === "none" ? "" : value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No parent</SelectItem>
                    {accounts
                      .filter((account) => account.id !== editingAccount?.id)
                      .map((account) => (
                        <SelectItem key={account.id} value={String(account.id)}>
                          {account.account_code} - {account.account_name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Account Type" error={errors.account_type} required>
                <Select value={form.account_type} onValueChange={(value) => setField("account_type", value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {accountTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Normal Balance" error={errors.normal_balance} required>
                <Select value={form.normal_balance} onValueChange={(value) => setField("normal_balance", value)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="debit">Debit</SelectItem>
                    <SelectItem value="credit">Credit</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Opening Balance" error={errors.opening_balance}>
                <Input type="number" step="0.01" value={form.opening_balance} onChange={(event) => setField("opening_balance", event.target.value)} disabled={!!editingAccount} />
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
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <Toggle label="Allow control posting" checked={form.is_control_account} onChange={(checked) => setField("is_control_account", checked)} />
              <Toggle label="Bank account ledger" checked={form.is_bank_account} onChange={(checked) => setField("is_bank_account", checked)} />
              <Toggle label="Cash account ledger" checked={form.is_cash_account} onChange={(checked) => setField("is_cash_account", checked)} />
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button form="account-form" type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700" disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingAccount ? "Update Account" : "Create Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent className="w-full overflow-y-auto bg-white sm:max-w-xl">
          {selectedAccount && (
            <>
              <SheetHeader className="border-b border-slate-100">
                <SheetTitle>{selectedAccount.account_code} - {selectedAccount.account_name}</SheetTitle>
                <SheetDescription>{selectedAccount.account_type || "Ledger account"}</SheetDescription>
              </SheetHeader>
              <div className="space-y-4 p-4">
                <Detail label="Classification" value={selectedAccount.classification?.name || selectedAccount.account_classification?.name || "-"} />
                <Detail label="Normal Balance" value={selectedAccount.normal_balance || "-"} />
                <Detail label="Opening Balance" value={money(selectedAccount.opening_balance)} />
                <Detail label="Current Balance" value={money(selectedAccount.current_balance)} />
                <Detail label="Status" value={selectedAccount.status} />
                <div className="flex flex-wrap gap-2">
                  {selectedAccount.is_bank_account && <Badge variant="outline">Bank Ledger</Badge>}
                  {selectedAccount.is_cash_account && <Badge variant="outline">Cash Ledger</Badge>}
                  {selectedAccount.is_control_account && <Badge variant="outline">Control Account</Badge>}
                </div>
                <Button variant="outline" onClick={() => openEditDialog(selectedAccount)}>
                  <Edit className="h-4 w-4" />
                  Edit Account
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <ERPConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDeactivate}
        title="Deactivate Account"
        message="Accounts with transactions should be deactivated rather than deleted. The backend will enforce accounting safety rules."
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

const Toggle = ({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) => (
  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
    <Label>{label}</Label>
    <Switch checked={checked} onCheckedChange={onChange} />
  </div>
);

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-3">
    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
    <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
  </div>
);

export default ChartOfAccountsPage;
