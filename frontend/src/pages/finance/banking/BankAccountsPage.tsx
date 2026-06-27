import React, { useMemo, useState } from "react";
import {
  AlertCircle,
  Banknote,
  BookOpen,
  Building2,
  CircleDollarSign,
  CreditCard,
  Download,
  Edit,
  Eye,
  FileText,
  Landmark,
  MoreHorizontal,
  Plus,
  RefreshCcw,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";

type BankAccountStatus = "Active" | "Inactive";
type AccountType = "Current Account" | "Savings Account" | "Overdraft Account" | "Loan Account" | "Fixed Deposit";
type CurrencyCode = "LKR" | "USD";

type BankAccount = {
  id: string;
  bankName: string;
  branchName: string;
  accountName: string;
  accountNumber: string;
  accountType: AccountType;
  currency: CurrencyCode;
  openingBalance: number;
  openingBalanceDate: string;
  currentBalance: number;
  linkedLedgerAccount: string;
  status: BankAccountStatus;
  description: string;
  createdAt: string;
  updatedAt: string;
};

type BankAccountForm = {
  bankName: string;
  branchName: string;
  accountName: string;
  accountNumber: string;
  accountType: AccountType | "";
  currency: CurrencyCode;
  openingBalance: string;
  openingBalanceDate: string;
  linkedLedgerAccount: string;
  autoCreateLedger: boolean;
  status: BankAccountStatus;
  description: string;
};

const ledgerAccounts = [
  "1120 - Commercial Bank Current Account",
  "1121 - Sampath Bank Savings Account",
  "1122 - HNB USD Account",
  "1123 - Bank of Ceylon Current Account",
  "1124 - Nations Trust Bank Current Account",
];

const accountTypes: AccountType[] = [
  "Current Account",
  "Savings Account",
  "Overdraft Account",
  "Loan Account",
  "Fixed Deposit",
];

const currencies: CurrencyCode[] = ["LKR", "USD"];

const initialAccounts: BankAccount[] = [
  {
    id: "bank-1",
    bankName: "Commercial Bank",
    branchName: "Colombo 03",
    accountName: "Commercial Bank - Current Account",
    accountNumber: "1234567890",
    accountType: "Current Account",
    currency: "LKR",
    openingBalance: 1850000,
    openingBalanceDate: "2026-01-01",
    currentBalance: 2450000,
    linkedLedgerAccount: "1120 - Commercial Bank Current Account",
    status: "Active",
    description: "Primary operating bank account for OMACX Pharma Pvt Ltd.",
    createdAt: "2026-01-02",
    updatedAt: "2026-06-24",
  },
  {
    id: "bank-2",
    bankName: "Sampath Bank",
    branchName: "Nugegoda",
    accountName: "Sampath Bank - Savings Account",
    accountNumber: "9876543210",
    accountType: "Savings Account",
    currency: "LKR",
    openingBalance: 500000,
    openingBalanceDate: "2026-01-01",
    currentBalance: 850000,
    linkedLedgerAccount: "1121 - Sampath Bank Savings Account",
    status: "Active",
    description: "Reserve savings account used for short-term cash parking.",
    createdAt: "2026-01-05",
    updatedAt: "2026-06-20",
  },
  {
    id: "bank-3",
    bankName: "HNB",
    branchName: "World Trade Center",
    accountName: "HNB - USD Account",
    accountNumber: "5566778899",
    accountType: "Current Account",
    currency: "USD",
    openingBalance: 9000,
    openingBalanceDate: "2026-01-01",
    currentBalance: 12500,
    linkedLedgerAccount: "1122 - HNB USD Account",
    status: "Active",
    description: "USD account for import payments and foreign receipts.",
    createdAt: "2026-01-08",
    updatedAt: "2026-06-22",
  },
];

const emptyForm: BankAccountForm = {
  bankName: "",
  branchName: "",
  accountName: "",
  accountNumber: "",
  accountType: "",
  currency: "LKR",
  openingBalance: "0",
  openingBalanceDate: "2026-01-01",
  linkedLedgerAccount: "",
  autoCreateLedger: true,
  status: "Active",
  description: "",
};

const money = (amount: number, currency: CurrencyCode) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);

const titleCaseAccountName = (bankName: string, accountType: string) => {
  const cleanedType = accountType.replace(" Account", "");
  return [bankName.trim(), cleanedType].filter(Boolean).join(" ");
};

const makeLedgerAccount = (account: BankAccountForm, sequence: number) => {
  const bankLabel = titleCaseAccountName(account.bankName || "New Bank", account.accountType || "Current Account");
  return `${1120 + sequence} - ${bankLabel} Account`;
};

const statusBadge = (status: BankAccountStatus) => (
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

const bankIcon = (accountType: AccountType) => {
  if (accountType === "Fixed Deposit") return <Banknote className="h-4 w-4 text-amber-600" />;
  if (accountType === "Overdraft Account" || accountType === "Loan Account") {
    return <CreditCard className="h-4 w-4 text-indigo-600" />;
  }
  return <Landmark className="h-4 w-4 text-blue-600" />;
};

const BankAccountsPage = () => {
  const [accounts, setAccounts] = useState<BankAccount[]>(initialAccounts);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [bankFilter, setBankFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(initialAccounts[0]);
  const [form, setForm] = useState<BankAccountForm>(emptyForm);
  const [formError, setFormError] = useState("");

  const bankOptions = useMemo(() => Array.from(new Set(accounts.map((account) => account.bankName))).sort(), [accounts]);

  const filteredAccounts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return accounts.filter((account) => {
      const matchesSearch =
        !query ||
        account.bankName.toLowerCase().includes(query) ||
        account.accountName.toLowerCase().includes(query) ||
        account.accountNumber.toLowerCase().includes(query) ||
        account.linkedLedgerAccount.toLowerCase().includes(query);
      const matchesStatus = statusFilter === "all" || account.status === statusFilter;
      const matchesBank = bankFilter === "all" || account.bankName === bankFilter;
      return matchesSearch && matchesStatus && matchesBank;
    });
  }, [accounts, bankFilter, search, statusFilter]);

  const totals = useMemo(() => {
    const activeAccounts = accounts.filter((account) => account.status === "Active");
    return {
      active: activeAccounts.length,
      lkr: activeAccounts.filter((account) => account.currency === "LKR").reduce((sum, account) => sum + account.currentBalance, 0),
      usd: activeAccounts.filter((account) => account.currency === "USD").reduce((sum, account) => sum + account.currentBalance, 0),
    };
  }, [accounts]);

  const openCreateDialog = () => {
    setEditingAccount(null);
    setForm(emptyForm);
    setFormError("");
    setDialogOpen(true);
  };

  const openEditDialog = (account: BankAccount) => {
    setEditingAccount(account);
    setForm({
      bankName: account.bankName,
      branchName: account.branchName,
      accountName: account.accountName,
      accountNumber: account.accountNumber,
      accountType: account.accountType,
      currency: account.currency,
      openingBalance: String(account.openingBalance),
      openingBalanceDate: account.openingBalanceDate,
      linkedLedgerAccount: account.linkedLedgerAccount,
      autoCreateLedger: false,
      status: account.status,
      description: account.description,
    });
    setFormError("");
    setDialogOpen(true);
  };

  const openDetails = (account: BankAccount) => {
    setSelectedAccount(account);
    setDetailsOpen(true);
  };

  const deactivateAccount = (accountId: string) => {
    setAccounts((current) =>
      current.map((account) =>
        account.id === accountId
          ? { ...account, status: "Inactive", updatedAt: "2026-06-27" }
          : account
      )
    );
    setSelectedAccount((current) =>
      current?.id === accountId ? { ...current, status: "Inactive", updatedAt: "2026-06-27" } : current
    );
  };

  const validateForm = () => {
    if (!form.bankName.trim() || !form.accountName.trim() || !form.accountNumber.trim() || !form.accountType || !form.currency || !form.status) {
      return "Bank Name, Account Name, Account Number, Account Type, Currency, and Status are required.";
    }

    const openingBalance = Number(form.openingBalance);
    if (Number.isNaN(openingBalance)) {
      return "Opening Balance must be numeric.";
    }

    const duplicate = accounts.some(
      (account) =>
        account.id !== editingAccount?.id &&
        account.bankName.toLowerCase() === form.bankName.trim().toLowerCase() &&
        account.accountNumber.trim() === form.accountNumber.trim()
    );
    if (duplicate) {
      return "Account Number should be unique per bank.";
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
      ? makeLedgerAccount(form, accounts.length + 1)
      : form.linkedLedgerAccount;

    if (editingAccount) {
      setAccounts((current) =>
        current.map((account) =>
          account.id === editingAccount.id
            ? {
                ...account,
                bankName: form.bankName.trim(),
                branchName: form.branchName.trim(),
                accountName: form.accountName.trim(),
                accountNumber: form.accountNumber.trim(),
                accountType: form.accountType as AccountType,
                currency: form.currency,
                openingBalance,
                openingBalanceDate: form.openingBalanceDate,
                linkedLedgerAccount,
                status: form.status,
                description: form.description.trim(),
                updatedAt: "2026-06-27",
              }
            : account
        )
      );
    } else {
      const newAccount: BankAccount = {
        id: `bank-${Date.now()}`,
        bankName: form.bankName.trim(),
        branchName: form.branchName.trim(),
        accountName: form.accountName.trim(),
        accountNumber: form.accountNumber.trim(),
        accountType: form.accountType as AccountType,
        currency: form.currency,
        openingBalance,
        openingBalanceDate: form.openingBalanceDate,
        currentBalance: openingBalance,
        linkedLedgerAccount,
        status: form.status,
        description: form.description.trim(),
        createdAt: "2026-06-27",
        updatedAt: "2026-06-27",
      };
      setAccounts((current) => [newAccount, ...current]);
      setSelectedAccount(newAccount);
    }

    setDialogOpen(false);
    setFormError("");
  };

  const details = selectedAccount;

  return (
    <div className="min-h-full bg-[#F8FAFC] p-6 text-slate-900">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Finance / Banking & Cash</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Bank Accounts</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-500">
            Create and manage company bank accounts used for payments, receipts, bank book, and reconciliation.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" className="border-slate-200 bg-white text-slate-700">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button onClick={openCreateDialog} className="bg-indigo-600 text-white hover:bg-indigo-700">
            <Plus className="h-4 w-4" />
            Add Bank Account
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardContent className="flex items-center gap-4">
            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Active Bank Accounts</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{totals.active}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardContent className="flex items-center gap-4">
            <div className="rounded-xl bg-green-50 p-3 text-green-600">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">LKR Bank Balance</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{money(totals.lkr, "LKR")}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardContent className="flex items-center gap-4">
            <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
              <CircleDollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">USD Bank Balance</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{money(totals.usd, "USD")}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Alert className="mt-4 border-blue-100 bg-blue-50 text-blue-900">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Finance setup order</AlertTitle>
        <AlertDescription>
          Create Chart of Accounts first, then create Bank Accounts under Assets / Current Assets / Bank Accounts. Payment Vouchers reduce bank balances and Receipt Vouchers increase them.
        </AlertDescription>
      </Alert>

      <Card className="mt-4 border border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <CardTitle>Company Bank Accounts</CardTitle>
              <CardDescription>OMACX Pharma Pvt Ltd bank account master with linked ledger control accounts.</CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-2 h-4 w-4 text-slate-400" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search accounts"
                  className="h-9 w-full border-slate-200 bg-white pl-8 sm:w-64"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 w-full border-slate-200 bg-white sm:w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={bankFilter} onValueChange={setBankFilter}>
                <SelectTrigger className="h-9 w-full border-slate-200 bg-white sm:w-48">
                  <SelectValue placeholder="Bank" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Banks</SelectItem>
                  {bankOptions.map((bank) => (
                    <SelectItem key={bank} value={bank}>
                      {bank}
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
                <TableHead>Account Type</TableHead>
                <TableHead>Currency</TableHead>
                <TableHead className="text-right">Current Balance</TableHead>
                <TableHead>Linked Ledger Account</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAccounts.map((account) => (
                <TableRow key={account.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-slate-50 p-2">{bankIcon(account.accountType)}</div>
                      <div>
                        <p className="font-semibold text-slate-900">{account.bankName}</p>
                        <p className="text-xs text-slate-500">{account.branchName}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-slate-800">{account.accountName}</TableCell>
                  <TableCell className="font-mono text-xs text-slate-600">{account.accountNumber}</TableCell>
                  <TableCell>{account.accountType}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-slate-200 bg-white text-slate-700">
                      {account.currency}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-slate-900">{money(account.currentBalance, account.currency)}</TableCell>
                  <TableCell className="max-w-[260px] truncate text-slate-600">{account.linkedLedgerAccount}</TableCell>
                  <TableCell>{statusBadge(account.status)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" aria-label={`Actions for ${account.accountName}`}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => openDetails(account)}>
                          <Eye className="h-4 w-4" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditDialog(account)}>
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
                          onClick={() => deactivateAccount(account.id)}
                        >
                          <RefreshCcw className="h-4 w-4" />
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
        <DialogContent className="max-h-[92vh] overflow-y-auto bg-white sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{editingAccount ? "Edit Bank Account" : "Add Bank Account"}</DialogTitle>
            <DialogDescription>
              Bank accounts belong to Banking & Cash and must link to a ledger account from Chart of Accounts.
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Check bank account details</AlertTitle>
              <AlertDescription>{formError}</AlertDescription>
            </Alert>
          )}

          <form id="bank-account-form" onSubmit={submitForm} className="space-y-5">
            <Tabs defaultValue="details">
              <TabsList className="bg-slate-100">
                <TabsTrigger value="details">Account Details</TabsTrigger>
                <TabsTrigger value="ledger">Ledger Mapping</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="mt-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field label="Bank Name" required>
                    <Input value={form.bankName} onChange={(event) => setForm({ ...form, bankName: event.target.value })} />
                  </Field>
                  <Field label="Branch Name">
                    <Input value={form.branchName} onChange={(event) => setForm({ ...form, branchName: event.target.value })} />
                  </Field>
                  <Field label="Account Name" required>
                    <Input value={form.accountName} onChange={(event) => setForm({ ...form, accountName: event.target.value })} />
                  </Field>
                  <Field label="Account Number" required>
                    <Input value={form.accountNumber} onChange={(event) => setForm({ ...form, accountNumber: event.target.value })} />
                  </Field>
                  <Field label="Account Type" required>
                    <Select value={form.accountType} onValueChange={(value) => setForm({ ...form, accountType: value as AccountType })}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select account type" />
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
                  <Field label="Currency" required>
                    <Select value={form.currency} onValueChange={(value) => setForm({ ...form, currency: value as CurrencyCode })}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency} value={currency}>
                            {currency}
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
                  <Field label="Opening Balance Date">
                    <Input type="date" value={form.openingBalanceDate} onChange={(event) => setForm({ ...form, openingBalanceDate: event.target.value })} />
                  </Field>
                  <Field label="Status" required>
                    <Select value={form.status} onValueChange={(value) => setForm({ ...form, status: value as BankAccountStatus })}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Description">
                    <Input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
                  </Field>
                </div>
              </TabsContent>
              <TabsContent value="ledger" className="mt-4 space-y-4">
                <Alert className="border-slate-200 bg-slate-50">
                  <Building2 className="h-4 w-4" />
                  <AlertTitle>Ledger account path</AlertTitle>
                  <AlertDescription>Auto-created bank ledgers are created under Assets / Current Assets / Bank Accounts.</AlertDescription>
                </Alert>
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
                  <div>
                    <Label>Auto Create Ledger</Label>
                    <p className="mt-1 text-sm text-slate-500">
                      Generate a ledger such as 1120 - Commercial Bank Current Account.
                    </p>
                  </div>
                  <Switch
                    checked={form.autoCreateLedger}
                    onCheckedChange={(checked) => setForm({ ...form, autoCreateLedger: checked })}
                  />
                </div>
                <Field label="Linked Ledger Account">
                  <Select
                    value={form.linkedLedgerAccount}
                    disabled={form.autoCreateLedger}
                    onValueChange={(value) => setForm({ ...form, linkedLedgerAccount: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={form.autoCreateLedger ? makeLedgerAccount(form, accounts.length + 1) : "Select ledger account"} />
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
              </TabsContent>
            </Tabs>
          </form>

          <DialogFooter>
            <Button variant="outline" type="button" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button form="bank-account-form" type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700">
              {editingAccount ? "Save Changes" : "Add Bank Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
        <SheetContent className="w-full overflow-y-auto bg-white sm:max-w-xl">
          {details && (
            <>
              <SheetHeader className="border-b border-slate-100">
                <SheetTitle>{details.accountName}</SheetTitle>
                <SheetDescription>{details.bankName} / {details.accountNumber}</SheetDescription>
              </SheetHeader>
              <div className="space-y-5 p-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Current Balance</p>
                  <p className="mt-1 text-3xl font-bold text-slate-900">{money(details.currentBalance, details.currency)}</p>
                  <div className="mt-3">{statusBadge(details.status)}</div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Detail label="Bank Name" value={details.bankName} />
                  <Detail label="Branch Name" value={details.branchName} />
                  <Detail label="Account Name" value={details.accountName} />
                  <Detail label="Account Number" value={details.accountNumber} />
                  <Detail label="Account Type" value={details.accountType} />
                  <Detail label="Currency" value={details.currency} />
                  <Detail label="Opening Balance" value={money(details.openingBalance, details.currency)} />
                  <Detail label="Opening Balance Date" value={details.openingBalanceDate} />
                  <Detail label="Created Date" value={details.createdAt} />
                  <Detail label="Last Updated Date" value={details.updatedAt} />
                </div>
                <Separator />
                <Detail label="Linked Ledger Account" value={details.linkedLedgerAccount} />
                <Detail label="Description" value={details.description || "No description"} />
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={() => openEditDialog(details)}>
                    <Edit className="h-4 w-4" />
                    Edit Account
                  </Button>
                  <Button variant="outline">
                    <BookOpen className="h-4 w-4" />
                    View Bank Book
                  </Button>
                  <Button variant="outline">
                    <FileText className="h-4 w-4" />
                    View Ledger
                  </Button>
                  <Button className="bg-indigo-600 text-white hover:bg-indigo-700">
                    <RefreshCcw className="h-4 w-4" />
                    Reconcile
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
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

const Detail = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-3">
    <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
    <p className="mt-1 text-sm font-semibold text-slate-900">{value}</p>
  </div>
);

export default BankAccountsPage;
