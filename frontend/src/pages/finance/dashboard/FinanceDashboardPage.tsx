import { useState } from "react";
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
  RefreshCw,
  Download,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
  Building2,
  DollarSign,
} from "lucide-react";
import { AreaChart, BarChart, DonutChart, ProgressBar } from "@tremor/react";
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
  { label: "Cash Balance", value: 1865000, trend: "+8.2%", icon: Wallet, tone: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400" },
  { label: "Bank Balance", value: 12845000, trend: "+4.7%", icon: Landmark, tone: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 dark:text-indigo-400" },
  { label: "Accounts Receivable", value: 5470000, trend: "12 invoices", icon: Receipt, tone: "text-blue-600 bg-blue-50 dark:bg-blue-950/50 dark:text-blue-400" },
  { label: "Accounts Payable", value: 2915000, trend: "9 bills", icon: FileText, tone: "text-amber-600 bg-amber-50 dark:bg-amber-950/50 dark:text-amber-400" },
  { label: "Monthly Revenue", value: 18490000, trend: "+15.4%", icon: TrendingUp, tone: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 dark:text-emerald-400" },
  { label: "Monthly Expenses", value: 11260000, trend: "-3.1%", icon: TrendingDown, tone: "text-rose-600 bg-rose-50 dark:bg-rose-950/50 dark:text-rose-400" },
];

const summaryCards = [
  { label: "Gross Profit", value: 7230000, note: "39.1% gross margin", icon: BarChart3 },
  { label: "Net Profit", value: 4810000, note: "26.0% net margin", icon: BadgeDollarSign },
  { label: "Pending Payments", value: 1290000, note: "6 awaiting approval", icon: ClipboardCheck },
  { label: "Pending Receipts", value: 2145000, note: "8 due this week", icon: CircleDollarSign },
];

const financeTrendData = [
  { month: "Jan", Revenue: 14200000, Expenses: 9800000, Profit: 4400000 },
  { month: "Feb", Revenue: 15800000, Expenses: 10200000, Profit: 5600000 },
  { month: "Mar", Revenue: 16500000, Expenses: 10800000, Profit: 5700000 },
  { month: "Apr", Revenue: 15100000, Expenses: 9900000, Profit: 5200000 },
  { month: "May", Revenue: 17200000, Expenses: 11100000, Profit: 6100000 },
  { month: "Jun", Revenue: 18490000, Expenses: 11260000, Profit: 7230000 },
];

const expenseBreakdownData = [
  { category: "Raw Materials", amount: 4800000 },
  { category: "Payroll & Salaries", amount: 3200000 },
  { category: "Logistics & Freight", amount: 1400000 },
  { category: "Marketing & Sales", amount: 960000 },
  { category: "Rent & Utilities", amount: 900000 },
];

const transactions = [
  { date: "2026-06-26", voucher: "JV-2026-0041", type: "Journal", account: "Sales Revenue", debit: 0, credit: 1245000, status: "Posted" },
  { date: "2026-06-26", voucher: "PV-2026-0188", type: "Payment", account: "Accounts Payable", debit: 480000, credit: 0, status: "Approved" },
  { date: "2026-06-25", voucher: "RV-2026-0204", type: "Receipt", account: "Bank Account", debit: 760000, credit: 0, status: "Posted" },
  { date: "2026-06-24", voucher: "JV-2026-0039", type: "Journal", account: "Rent Expense", debit: 185000, credit: 0, status: "Draft" },
  { date: "2026-06-23", voucher: "PV-2026-0187", type: "Payment", account: "Logistics Vendor", debit: 320000, credit: 0, status: "Posted" },
];

const approvals = [
  { date: "2026-06-27", type: "Payment Voucher", createdBy: "Nimali Perera", amount: 620000, status: "Pending" },
  { date: "2026-06-27", type: "Journal Entry", createdBy: "Kasun Silva", amount: 410000, status: "Review" },
  { date: "2026-06-26", type: "Receipt Voucher", createdBy: "Amara Dias", amount: 955000, status: "Pending" },
];

const reportShortcuts = [
  { title: "Trial Balance", path: "/finance/reports/trial-balance", icon: BookOpen, desc: "Verify ledger account balances" },
  { title: "Profit and Loss", path: "/finance/reports/profit-and-loss", icon: TrendingUp, desc: "Review revenue and net income" },
  { title: "Balance Sheet", path: "/finance/reports/balance-sheet", icon: Landmark, desc: "Assets, liabilities, and equity" },
  { title: "Account Ledger", path: "/finance/general-ledger/account-ledger", icon: FileText, desc: "Detailed transaction history" },
];

const statusBadge = (status: string) => {
  const classes: Record<string, string> = {
    Posted: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800",
    Approved: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-400 dark:border-indigo-800",
    Draft: "bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    Pending: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800",
    Review: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800",
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${classes[status] || classes.Draft}`}>
      {status}
    </span>
  );
};

const FinanceDashboardPage = () => {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const quickActions = [
    { label: "Create Journal Entry", path: "/finance/general-ledger/journal-entry", icon: BookOpen },
    { label: "Add Payment Voucher", path: "/finance/banking/payment-vouchers", icon: Wallet },
    { label: "Add Receipt Voucher", path: "/finance/banking/receipt-vouchers", icon: Receipt },
    { label: "Chart of Accounts", path: "/finance/setup/chart-of-accounts", icon: Plus },
    { label: "Financial Reports", path: "/finance/reports/reports-dashboard", icon: BarChart3 },
  ];

  return (
    <div className="w-full space-y-8 animate-in fade-in-50 duration-300">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                OMACX Pharma Pvt Ltd
              </p>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                Finance Dashboard
              </h1>
            </div>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 pl-12">
            Monitor fiscal performance, liquidity, receivables, payables, and general ledger activity.
          </p>
        </div>

        {/* Header Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Select defaultValue="this-month">
            <SelectTrigger className="w-[160px] rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="this-week">This Week</SelectItem>
              <SelectItem value="this-month">This Month (June)</SelectItem>
              <SelectItem value="this-quarter">Q2 2026</SelectItem>
              <SelectItem value="this-year">FY 2026</SelectItem>
            </SelectContent>
          </Select>

          <Button
            onClick={handleRefresh}
            variant="outline"
            size="icon"
            title="Refresh financial data"
            className="h-10 w-10 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin text-indigo-600" : ""}`} />
          </Button>

          <Button
            onClick={() => navigate("/finance/general-ledger/journal-entry")}
            className="h-10 rounded-xl bg-indigo-600 px-4 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 font-semibold"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            New Journal Entry
          </Button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          TIER 1: High-Level Financial KPI Metrics
      ══════════════════════════════════════════════ */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Liquidity & Balance Overview
          </h2>
          <span className="text-xs text-slate-400">Values in Sri Lankan Rupees (LKR)</span>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {kpis.map((item) => (
            <Card key={item.label} className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-indigo-500/30">
              <CardContent className="space-y-3 p-5">
                <div className="flex items-center justify-between">
                  <div className={`rounded-xl p-2.5 ${item.tone}`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <span className="inline-flex items-center rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {item.trend}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {item.label}
                  </p>
                  <p className="mt-1 text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                    {money(item.value)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Summary Profitability Cards (4-up) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((item) => (
          <Card key={item.label} className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all duration-200 hover:border-indigo-500/30">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 p-3.5 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
                <item.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {item.label}
                </p>
                <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  {money(item.value)}
                </p>
                <p className="mt-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  {item.note}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ══════════════════════════════════════════════
          TIER 2: Financial Charts & Expense Analysis
      ══════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: Revenue vs Expenses & Profit Trend (2/3 width) */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Revenue vs. Expenses & Profit Trajectory
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  6-month fiscal performance overview (Jan – Jun 2026)
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
                  Net Profit: +26.0% Margin
                </span>
              </div>
            </div>

            <div className="mt-4">
              <AreaChart
                className="h-72 w-full"
                data={financeTrendData}
                index="month"
                categories={["Revenue", "Expenses", "Profit"]}
                colors={["indigo", "rose", "emerald"]}
                valueFormatter={(val: number) => money(val)}
                showLegend={true}
                showGridLines={true}
                curveType="monotone"
              />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 text-xs text-slate-500 dark:text-slate-400">
            <span>Peak Monthly Revenue: {money(18490000)} (June)</span>
            <button
              onClick={() => navigate("/finance/reports/profit-and-loss")}
              className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              Open P&L Statement <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Right: Operating Expense Breakdown (1/3 width) */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Operating Expense Distribution
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Breakdown of June expenditures by category
              </p>
            </div>

            <div className="mt-6">
              <BarChart
                className="h-72 w-full"
                data={expenseBreakdownData}
                index="category"
                categories={["amount"]}
                colors={["rose"]}
                valueFormatter={(val: number) => money(val)}
                layout="vertical"
                showLegend={false}
                showGridLines={true}
              />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4 text-xs text-slate-500 dark:text-slate-400">
            <span>Total June Expenses: {money(11260000)}</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">Within Budget</span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          TIER 3: Accounting Activity & Workflow
      ══════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_380px]">
        {/* Main Accounting Table */}
        <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">
                  Accounting Workflow & Vouchers
                </CardTitle>
                <CardDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Recent transactions and pending fiscal approvals across branches
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <Tabs defaultValue="transactions" className="gap-4">
              <TabsList className="bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <TabsTrigger value="transactions" className="rounded-lg text-xs font-semibold">
                  Recent Transactions ({transactions.length})
                </TabsTrigger>
                <TabsTrigger value="approvals" className="rounded-lg text-xs font-semibold">
                  Pending Approvals ({approvals.length})
                </TabsTrigger>
              </TabsList>
              <TabsContent value="transactions" className="mt-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400">
                        <TableHead>Date</TableHead>
                        <TableHead>Voucher No</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Account</TableHead>
                        <TableHead className="text-right">Debit</TableHead>
                        <TableHead className="text-right">Credit</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {transactions.map((row) => (
                        <TableRow key={row.voucher} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <TableCell className="text-xs text-slate-500 dark:text-slate-400">{row.date}</TableCell>
                          <TableCell className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">{row.voucher}</TableCell>
                          <TableCell className="text-xs font-medium text-slate-700 dark:text-slate-300">{row.type}</TableCell>
                          <TableCell className="text-xs font-semibold text-slate-800 dark:text-slate-200">{row.account}</TableCell>
                          <TableCell className="text-right font-mono text-xs text-slate-900 dark:text-white">{row.debit ? money(row.debit) : "-"}</TableCell>
                          <TableCell className="text-right font-mono text-xs text-slate-900 dark:text-white">{row.credit ? money(row.credit) : "-"}</TableCell>
                          <TableCell>{statusBadge(row.status)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
              <TabsContent value="approvals" className="mt-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400">
                        <TableHead>Date</TableHead>
                        <TableHead>Request Type</TableHead>
                        <TableHead>Created By</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                      {approvals.map((row) => (
                        <TableRow key={`${row.type}-${row.createdBy}`} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <TableCell className="text-xs text-slate-500 dark:text-slate-400">{row.date}</TableCell>
                          <TableCell className="font-semibold text-xs text-slate-900 dark:text-white">{row.type}</TableCell>
                          <TableCell className="text-xs text-slate-600 dark:text-slate-400">{row.createdBy}</TableCell>
                          <TableCell className="text-right font-mono font-bold text-xs text-slate-900 dark:text-white">{money(row.amount)}</TableCell>
                          <TableCell>{statusBadge(row.status)}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" className="h-7 text-xs font-semibold hover:bg-indigo-600 hover:text-white transition-colors">
                              Review
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Right Sidebar: Quick Actions & Cash Flow Ratio */}
        <div className="space-y-6">
          {/* Quick Shortcuts */}
          <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                Fiscal Quick Actions
              </CardTitle>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                Direct accounting entry shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-2.5 pt-4">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => navigate(action.path)}
                  className="group flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 px-4 py-3 text-left transition-all hover:border-indigo-500/40 hover:bg-white dark:hover:bg-slate-800 hover:shadow-2xs"
                >
                  <span className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white dark:bg-slate-900 shadow-2xs border border-slate-200/60 dark:border-slate-700/60 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 text-indigo-600 dark:text-indigo-400 transition-colors">
                      <action.icon className="h-4 w-4" />
                    </span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {action.label}
                    </span>
                  </span>
                  <ArrowRight className="h-4 w-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Cash Flow Ratio Card (Replaced Skeletons!) */}
          <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold text-slate-900 dark:text-white">
                  Cash Flow Liquidity
                </CardTitle>
                <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:text-emerald-300">
                  Healthy
                </span>
              </div>
              <CardDescription className="text-xs text-slate-500 dark:text-slate-400">
                June cash movement ratio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Cash In (Receipts)</span>
                <span className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">{money(9245000)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Cash Out (Payments)</span>
                <span className="font-mono text-sm font-bold text-rose-600 dark:text-rose-400">{money(6120000)}</span>
              </div>
              
              {/* Tremor Progress Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between text-[11px] font-medium text-slate-600 dark:text-slate-400">
                  <span>Outflow Ratio</span>
                  <span>66.2% of Inflow</span>
                </div>
                <ProgressBar value={66.2} color="indigo" className="h-2.5" />
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">Net Surplus</span>
                <span className="font-mono text-base font-bold text-indigo-600 dark:text-indigo-400">{money(3125000)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          TIER 4: Report Shortcuts & Analytics
      ══════════════════════════════════════════════ */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Core Financial Reports & Ledgers
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {reportShortcuts.map((report) => (
            <Card key={report.title} className="group border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:border-indigo-500/40">
              <CardContent className="flex items-center justify-between p-5">
                <div className="flex items-center gap-3.5">
                  <div className="rounded-xl bg-slate-100 dark:bg-slate-800 p-3 text-slate-700 dark:text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <report.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {report.title}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{report.desc}</p>
                  </div>
                </div>
                <Button
                  onClick={() => navigate(report.path)}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
                  title={`Open ${report.title}`}
                >
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboardPage;
