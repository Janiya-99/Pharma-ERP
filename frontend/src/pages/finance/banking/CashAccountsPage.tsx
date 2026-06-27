import React, { useMemo, useState } from "react";
import {
  AlertCircle,
  Banknote,
  Download,
  Edit,
  MoreHorizontal,
  Plus,
  Search,
  Wallet,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../../../components/ui/alert";
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

type CashAccountStatus = "Active" | "Inactive";

type CashAccount = {
  id: string;
  cashAccountName: string;
  branch: string;
  responsibleUser: string;
  openingBalance: number;
  currentBalance: number;
  linkedLedgerAccount: string;
  status: CashAccountStatus;
  autoCreatedLedger: boolean;
};

type CashAccountForm = {
  cashAccountName: string;
  branch: string;
  responsibleUser: string;
  openingBalance: string;
  linkedLedgerAccount: string;
  autoCreateLedger: boolean;
  status: CashAccountStatus;
};

const initialCashAccounts: CashAccount[] = [
  {
    id: "cash-1",
    cashAccountName: "Main Cash",
    branch: "Head Office",
    responsibleUser: "Nimali Perera",
    openingBalance: 250000,
    currentBalance: 420000,
    linkedLedgerAccount: "1110 - Main Cash",
    status: "Active",
    autoCreatedLedger: true,
  },
  {
    id: "cash-2",
    cashAccountName: "Petty Cash",
    branch: "Head Office",
    responsibleUser: "Kasun Silva",
    openingBalance: 50000,
    currentBalance: 38500,
    linkedLedgerAccount: "1111 - Petty Cash",
    status: "Active",
    autoCreatedLedger: true,
  },
  {
    id: "cash-3",
    cashAccountName: "Colombo Branch Cash",
    branch: "Colombo Branch",
    responsibleUser: "Amara Dias",
    openingBalance: 75000,
    currentBalance: 112000,
    linkedLedgerAccount: "1112 - Colombo Branch Cash",
    status: "Active",
    autoCreatedLedger: true,
  },
  {
    id: "cash-4",
    cashAccountName: "Kandy Branch Cash",
    branch: "Kandy Branch",
    responsibleUser: "Ruwan Jayasinghe",
    openingBalance: 60000,
    currentBalance: 81500,
    linkedLedgerAccount: "1113 - Kandy Branch Cash",
    status: "Active",
    autoCreatedLedger: true,
  },
];

const ledgerAccounts = [
  "1110 - Main Cash",
  "1111 - Petty Cash",
  "1112 - Colombo Branch Cash",
  "1113 - Kandy Branch Cash",
  "1114 - Cashier Cash",
];

const branches = ["Head Office", "Colombo Branch", "Kandy Branch", "Galle Branch"];
const users = ["Nimali Perera", "Kasun Silva", "Amara Dias", "Ruwan Jayasinghe", "Madhavi Fernando"];

const emptyForm: CashAccountForm = {
  cashAccountName: "",
  branch: "Head Office",
  responsibleUser: "",
  openingBalance: "0",
  linkedLedgerAccount: "",
  autoCreateLedger: true,
  status: "Active",
};

const money = (amount: number) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 2,
  }).format(amount);

const makeLedgerAccount = (name: string, sequence: number) => `${1110 + sequence} - ${name || "Cash Account"}`;

const statusBadge = (status: CashAccountStatus) => (
  <Badge
    variant="outline"
    className={
      status === "Active"
        ? "border-green-200 bg-green-50 text-green-700"
        : "border-slate-200 bg-slate-50 text-slate-600"
    }
  >
    {status}
  </Badge>
);

const CashAccountsPage = () => {
  const [accounts, setAccounts] = useState<CashAccount[]>(initialCashAccounts);
  const [search, setSearch] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<CashAccount | null>(null);
  const [form, setForm] = useState<CashAccountForm>(emptyForm);
  const [formError, setFormError] = useState("");

  const filteredAccounts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return accounts.filter((account) => {
      const matchesSearch =
        !query ||
        account.cashAccountName.toLowerCase().includes(query) ||
        account.responsibleUser.toLowerCase().includes(query) ||
        account.linkedLedgerAccount.toLowerCase().includes(query);
      const matchesBranch = branchFilter === "all" || account.branch === branchFilter;
      const matchesStatus = statusFilter === "all" || account.status === statusFilter;
      return matchesSearch && matchesBranch && matchesStatus;
    });
  }, [accounts, branchFilter, search, statusFilter]);

  const totalBalance = accounts
    .filter((account) => account.status === "Active")
    .reduce((sum, account) => sum + account.currentBalance, 0);

  const openCreateDialog = () => {
    setEditingAccount(null);
    setForm(emptyForm);
    setFormError("");
    setDialogOpen(true);
  };

  const openEditDialog = (account: CashAccount) => {
    setEditingAccount(account);
    setForm({
      cashAccountName: account.cashAccountName,
      branch: account.branch,
      responsibleUser: account.responsibleUser,
      openingBalance: String(account.openingBalance),
      linkedLedgerAccount: account.linkedLedgerAccount,
      autoCreateLedger: account.autoCreatedLedger,
      status: account.status,
    });
    setFormError("");
    setDialogOpen(true);
  };

  const validateForm = () => {
    if (!form.cashAccountName.trim() || !form.branch || !form.responsibleUser || !form.status) {
      return "Cash Account Name, Branch, Responsible User, and Status are required.";
    }

    if (Number.isNaN(Number(form.openingBalance))) {
      return "Opening Balance must be numeric.";
    }

    if (!form.autoCreateLedger && !form.linkedLedgerAccount) {
      return "Select a linked ledger account or enable Auto Create Ledger.";
    }

    return "";
  };

  const submitForm = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setFormError(validationError);
      return;
    }

    const openingBalance = Number(form.openingBalance);
    const linkedLedgerAccount = form.autoCreateLedger
      ? makeLedgerAccount(form.cashAccountName.trim(), accounts.length + 1)
      : form.linkedLedgerAccount;

    if (editingAccount) {
      setAccounts((current) =>
        current.map((account) =>
          account.id === editingAccount.id
            ? {
                ...account,
                cashAccountName: form.cashAccountName.trim(),
                branch: form.branch,
                responsibleUser: form.responsibleUser,
                openingBalance,
                linkedLedgerAccount,
                status: form.status,
                autoCreatedLedger: form.autoCreateLedger,
              }
            : account
        )
      );
    } else {
      setAccounts((current) => [
        {
          id: `cash-${Date.now()}`,
          cashAccountName: form.cashAccountName.trim(),
          branch: form.branch,
          responsibleUser: form.responsibleUser,
          openingBalance,
          currentBalance: openingBalance,
          linkedLedgerAccount,
          status: form.status,
          autoCreatedLedger: form.autoCreateLedger,
        },
        ...current,
      ]);
    }

    setDialogOpen(false);
    setFormError("");
  };

  const deactivateAccount = (id: string) => {
    setAccounts((current) =>
      current.map((account) => (account.id === id ? { ...account, status: "Inactive" } : account))
    );
  };

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
          <Button onClick={openCreateDialog} className="bg-indigo-600 text-white hover:bg-indigo-700">
            <Plus className="h-4 w-4" />
            Add Cash Account
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardContent className="flex items-center gap-4">
            <div className="rounded-xl bg-green-50 p-3 text-green-600">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Active Cash Balance</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{money(totalBalance)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardContent className="flex items-center gap-4">
            <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
              <Banknote className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Cash Locations</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{accounts.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardContent className="flex items-center gap-4">
            <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Ledger Mapping</p>
              <p className="mt-1 text-lg font-bold text-slate-900">Current Assets / Cash Accounts</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Alert className="mt-4 border-blue-100 bg-blue-50 text-blue-900">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Cash account rule</AlertTitle>
        <AlertDescription>
          Each cash account links to Chart of Accounts under Assets / Current Assets / Cash Accounts. Payment Vouchers reduce cash balances and Receipt Vouchers increase them.
        </AlertDescription>
      </Alert>

      <Card className="mt-4 border border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <CardTitle>Cash Account Register</CardTitle>
              <CardDescription>Cash locations and their linked ledger accounts for OMACX Pharma Pvt Ltd.</CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-2 h-4 w-4 text-slate-400" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search cash accounts"
                  className="h-9 w-full border-slate-200 bg-white pl-8 sm:w-64"
                />
              </div>
              <Select value={branchFilter} onValueChange={setBranchFilter}>
                <SelectTrigger className="h-9 w-full border-slate-200 bg-white sm:w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch} value={branch}>
                      {branch}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 w-full border-slate-200 bg-white sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/80">
                <TableHead>Cash Account Name</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Responsible User</TableHead>
                <TableHead className="text-right">Opening Balance</TableHead>
                <TableHead className="text-right">Current Balance</TableHead>
                <TableHead>Linked Ledger Account</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell className="font-semibold text-slate-900">{account.cashAccountName}</TableCell>
                  <TableCell>{account.branch}</TableCell>
                  <TableCell>{account.responsibleUser}</TableCell>
                  <TableCell className="text-right">{money(account.openingBalance)}</TableCell>
                  <TableCell className="text-right font-semibold text-slate-900">{money(account.currentBalance)}</TableCell>
                  <TableCell className="max-w-[260px] truncate text-slate-600">{account.linkedLedgerAccount}</TableCell>
                  <TableCell>{statusBadge(account.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label={`Actions for ${account.cashAccountName}`}>
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
                        <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => deactivateAccount(account.id)}>
                          Deactivate
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-white sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingAccount ? "Edit Cash Account" : "Add Cash Account"}</DialogTitle>
            <DialogDescription>Cash accounts belong to Banking & Cash and must link to a ledger account.</DialogDescription>
          </DialogHeader>
          {formError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Check cash account details</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}
          <form id="cash-account-form" onSubmit={submitForm} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Cash Account Name" required>
                <Input value={form.cashAccountName} onChange={(event) => setForm({ ...form, cashAccountName: event.target.value })} />
              </Field>
              <Field label="Branch" required>
                <Select value={form.branch} onValueChange={(value) => setForm({ ...form, branch: value })}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch} value={branch}>
                        {branch}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Responsible User" required>
                <Select value={form.responsibleUser} onValueChange={(value) => setForm({ ...form, responsibleUser: value })}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select user" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user} value={user}>
                        {user}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Opening Balance">
                <Input
                  type="number"
                  step="0.01"
                  value={form.openingBalance}
                  onChange={(event) => setForm({ ...form, openingBalance: event.target.value })}
                />
              </Field>
            </div>
            <Separator />
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div>
                <Label>Auto Create Ledger</Label>
                <p className="mt-1 text-sm text-slate-500">Create the ledger under Assets / Current Assets / Cash Accounts.</p>
              </div>
              <Switch checked={form.autoCreateLedger} onCheckedChange={(checked) => setForm({ ...form, autoCreateLedger: checked })} />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Linked Ledger Account">
                <Select
                  value={form.linkedLedgerAccount}
                  disabled={form.autoCreateLedger}
                  onValueChange={(value) => setForm({ ...form, linkedLedgerAccount: value })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={form.autoCreateLedger ? makeLedgerAccount(form.cashAccountName, accounts.length + 1) : "Select ledger"} />
                  </SelectTrigger>
                  <SelectContent>
                    {ledgerAccounts.map((ledger) => (
                      <SelectItem key={ledger} value={ledger}>
                        {ledger}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Status" required>
                <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value as CashAccountStatus })}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          </form>
          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button form="cash-account-form" type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700">
              {editingAccount ? "Save Changes" : "Add Cash Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Field = ({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) => (
  <div className="space-y-2">
    <Label>
      {label}
      {required && <span className="text-red-600">*</span>}
    </Label>
    {children}
  </div>
);

export default CashAccountsPage;
