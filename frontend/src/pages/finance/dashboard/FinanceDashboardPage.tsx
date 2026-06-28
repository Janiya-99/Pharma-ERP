import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BadgeDollarSign,
  BarChart3,
  BookOpen,
  ClipboardCheck,
  CircleDollarSign,
  FileText,
  Landmark,
  MoreHorizontal,
  Plus,
  Receipt,
  TrendingDown,
  TrendingUp,
  Wallet,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Skeleton } from "../../../components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";

const money = (amount: number) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    maximumFractionDigits: 0,
  }).format(amount);

const kpis = [
  { label: "Cash Balance", value: 1865000, trend: "+8.2%", icon: Wallet, tone: "text-emerald-600" },
  { label: "Bank Balance", value: 12845000, trend: "+4.7%", icon: Landmark, tone: "text-blue-600" },
  { label: "Accounts Receivable", value: 5470000, trend: "12 invoices", icon: Receipt, tone: "text-indigo-600" },
  { label: "Accounts Payable", value: 2915000, trend: "9 bills", icon: FileText, tone: "text-orange-600" },
  { label: "Monthly Revenue", value: 18490000, trend: "+15.4%", icon: TrendingUp, tone: "text-green-600" },
  { label: "Monthly Expenses", value: 11260000, trend: "-3.1%", icon: TrendingDown, tone: "text-red-600" },
];

const summaryCards = [
  { label: "Gross Profit", value: 7230000, note: "39.1% margin", icon: BarChart3 },
  { label: "Net Profit", value: 4810000, note: "26.0% margin", icon: BadgeDollarSign },
  { label: "Pending Payments", value: 1290000, note: "6 awaiting approval", icon: ClipboardCheck },
  { label: "Pending Receipts", value: 2145000, note: "8 due this week", icon: CircleDollarSign },
];

const transactions = [
  { date: "2026-06-26", voucher: "JV-2026-0041", type: "Journal", account: "Sales Revenue", debit: 0, credit: 1245000, status: "Posted" },
  { date: "2026-06-26", voucher: "PV-2026-0188", type: "Payment", account: "Accounts Payable", debit: 480000, credit: 0, status: "Approved" },
  { date: "2026-06-25", voucher: "RV-2026-0204", type: "Receipt", account: "Bank Account", debit: 760000, credit: 0, status: "Posted" },
  { date: "2026-06-24", voucher: "JV-2026-0039", type: "Journal", account: "Rent Expense", debit: 185000, credit: 0, status: "Draft" },
];

const approvals = [
  { date: "2026-06-27", type: "Payment Voucher", createdBy: "Nimali Perera", amount: 620000, status: "Pending" },
  { date: "2026-06-27", type: "Journal Entry", createdBy: "Kasun Silva", amount: 410000, status: "Review" },
  { date: "2026-06-26", type: "Receipt Voucher", createdBy: "Amara Dias", amount: 955000, status: "Pending" },
];

const reportShortcuts = [
  { title: "Trial Balance", path: "/finance/reports/trial-balance", icon: BookOpen },
  { title: "Profit and Loss", path: "/finance/reports/profit-and-loss", icon: TrendingUp },
  { title: "Balance Sheet", path: "/finance/reports/balance-sheet", icon: Landmark },
  { title: "Account Ledger", path: "/finance/general-ledger/account-ledger", icon: FileText },
];

const statusBadge = (status: string) => {
  const classes: Record<string, string> = {
    Posted: "bg-green-50 text-green-700 border-green-200",
    Approved: "bg-blue-50 text-blue-700 border-blue-200",
    Draft: "bg-slate-50 text-slate-700 border-slate-200",
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
    Review: "bg-indigo-50 text-indigo-700 border-indigo-200",
  };

  return (
    <Badge variant="outline" className={classes[status] || classes.Draft}>
      {status}
    </Badge>
  );
};

const FinanceDashboardPage = () => {
  const navigate = useNavigate();

  const quickActions = [
    { label: "Create Journal Entry", path: "/finance/general-ledger/journal-entry", icon: BookOpen },
    { label: "Add Payment", path: "/finance/banking/payment-vouchers", icon: Wallet },
    { label: "Add Receipt", path: "/finance/banking/receipt-vouchers", icon: Receipt },
    { label: "Create Account", path: "/finance/setup/chart-of-accounts", icon: Plus },
    { label: "View Reports", path: "/finance/reports/reports-dashboard", icon: BarChart3 },
  ];

  return (
    <div className="min-h-full bg-[#F8FAFC] p-6 text-slate-900">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">OMACX Pharma Pvt Ltd</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Finance Dashboard</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-500">
            Monitor financial performance, cash flow, receivables, payables, and accounting activity.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select defaultValue="this-month">
            <SelectTrigger className="w-[160px] border-slate-200 bg-white">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this-week">This week</SelectItem>
              <SelectItem value="this-month">This month</SelectItem>
              <SelectItem value="this-quarter">This quarter</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => navigate("/finance/journal-entry")} className="bg-indigo-600 text-white hover:bg-indigo-700">
            <Plus className="h-4 w-4" />
            New Entry
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
        {kpis.map((item) => (
          <Card key={item.label} className="border border-slate-200 bg-white shadow-sm">
            <CardContent className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-slate-50 p-2">
                  <item.icon className={`h-5 w-5 ${item.tone}`} />
                </div>
                <Badge variant="outline" className="border-slate-200 text-slate-500">
                  {item.trend}
                </Badge>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">{item.label}</p>
                <p className="mt-1 text-xl font-bold text-slate-900">{money(item.value)}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-4">
        {summaryCards.map((item) => (
          <Card key={item.label} className="border border-slate-200 bg-white shadow-sm">
            <CardContent className="flex items-center gap-4 pt-1">
              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{item.label}</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{money(item.value)}</p>
                <p className="mt-1 text-xs text-slate-500">{item.note}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_360px]">
        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle>Accounting Activity</CardTitle>
            <CardDescription>Recent vouchers and approvals across the finance workflow.</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Tabs defaultValue="transactions" className="gap-4">
              <TabsList className="mt-3 bg-slate-100">
                <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
                <TabsTrigger value="approvals">Pending Approvals</TabsTrigger>
              </TabsList>
              <TabsContent value="transactions">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Voucher No</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Account</TableHead>
                      <TableHead className="text-right">Debit</TableHead>
                      <TableHead className="text-right">Credit</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((row) => (
                      <TableRow key={row.voucher}>
                        <TableCell>{row.date}</TableCell>
                        <TableCell className="font-medium text-slate-900">{row.voucher}</TableCell>
                        <TableCell>{row.type}</TableCell>
                        <TableCell>{row.account}</TableCell>
                        <TableCell className="text-right">{row.debit ? money(row.debit) : "-"}</TableCell>
                        <TableCell className="text-right">{row.credit ? money(row.credit) : "-"}</TableCell>
                        <TableCell>{statusBadge(row.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
              <TabsContent value="approvals">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Request Type</TableHead>
                      <TableHead>Created By</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {approvals.map((row) => (
                      <TableRow key={`${row.type}-${row.createdBy}`}>
                        <TableCell>{row.date}</TableCell>
                        <TableCell className="font-medium text-slate-900">{row.type}</TableCell>
                        <TableCell>{row.createdBy}</TableCell>
                        <TableCell className="text-right">{money(row.amount)}</TableCell>
                        <TableCell>{statusBadge(row.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">Review</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common accounting tasks.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-2">
              {quickActions.map((action) => (
                <Button
                  key={action.label}
                  variant="outline"
                  className="h-10 justify-between border-slate-200 bg-white"
                  onClick={() => navigate(action.path)}
                >
                  <span className="flex items-center gap-2">
                    <action.icon className="h-4 w-4 text-indigo-600" />
                    {action.label}
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card className="border border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-100">
              <CardTitle>Cash Flow Summary</CardTitle>
              <CardDescription>June movement across cash and bank accounts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Cash In</span>
                <span className="font-semibold text-green-600">{money(9245000)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Cash Out</span>
                <span className="font-semibold text-red-600">{money(6120000)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                <span className="text-sm font-medium text-slate-900">Net Movement</span>
                <span className="font-bold text-slate-900">{money(3125000)}</span>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-2 w-full bg-slate-100" />
                <Skeleton className="h-2 w-8/12 bg-slate-100" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {reportShortcuts.map((report) => (
          <Card key={report.title} className="border border-slate-200 bg-white shadow-sm">
            <CardContent className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-slate-50 p-3 text-slate-700">
                  <report.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{report.title}</p>
                  <p className="text-xs text-slate-500">Open report</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label={`${report.title} actions`}>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 bg-white">
                  <DropdownMenuItem onClick={() => navigate(report.path)}>View</DropdownMenuItem>
                  <DropdownMenuItem>Export PDF</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default FinanceDashboardPage;
