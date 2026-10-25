import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { invoiceCenterApi } from "@/api/invoiceCenterApi";
import { useDebounce } from "@/hooks/useDebounce";
import { ReportPageShell } from "@/components/invoice-center/reports/ReportPageShell";
import { ReportSummaryCards, SummaryCardItem } from "@/components/invoice-center/reports/ReportSummaryCards";
import { ReportFilterBar } from "@/components/invoice-center/reports/ReportFilterBar";
import { ReportPermissionState } from "@/components/invoice-center/reports/ReportPermissionState";
import { ReportExportActions } from "@/components/invoice-center/reports/ReportExportActions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/auth/AuthContext";
import { DashboardSummaryReport } from "@/types/invoice-center-reports";
import { toast } from "sonner";
import { 
  Users, Building2, UserX, AlertTriangle, 
  ShoppingCart, FileText, CheckCircle, Clock, XCircle,
  Coins, Wallet, CreditCard, Banknote,
  UploadCloud, DownloadCloud, Activity,
  ArrowUpRight, Calendar, Sparkles
} from "lucide-react";

interface DashboardSectionProps {
  title: string;
  subtitle: string;
  badge: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  badgeBg: string;
  badgeBorder: string;
  badgeColor: string;
  viewLink?: {
    label: string;
    path: string;
  };
  cards: SummaryCardItem[];
  isLoading: boolean;
}

const DashboardSectionCard: React.FC<DashboardSectionProps> = ({
  title,
  subtitle,
  badge,
  icon,
  iconBg,
  iconColor,
  badgeBg,
  badgeBorder,
  badgeColor,
  viewLink,
  cards,
  isLoading,
}) => {
  return (
    <div className="rounded-3xl border border-slate-200/90 bg-white/95 backdrop-blur-md shadow-xs hover:shadow-md transition-all duration-300 p-5 sm:p-7 space-y-5 group/section">
      {/* Section Header Card Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3.5">
          <div className={`h-11 w-11 rounded-2xl flex items-center justify-center shrink-0 ${iconBg} ${iconColor} border ${badgeBorder} shadow-2xs group-hover/section:scale-105 transition-transform duration-300`}>
            {icon}
          </div>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {title}
              </h2>
              <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${badgeBg} ${badgeBorder} ${badgeColor}`}>
                {badge}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {subtitle}
            </p>
          </div>
        </div>

        {viewLink && (
          <Link
            to={viewLink.path}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 bg-slate-50/80 hover:bg-indigo-50/80 border border-slate-200/80 hover:border-indigo-200 rounded-xl transition-all shadow-2xs group/link shrink-0 w-fit"
          >
            <span>{viewLink.label}</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover/link:text-indigo-600 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5 transition-transform" />
          </Link>
        )}
      </div>

      {/* Metric Cards Grid */}
      <ReportSummaryCards items={cards} isLoading={isLoading} />
    </div>
  );
};

export const InvoiceCenterReportsDashboardPage: React.FC = () => {
  const { user } = useAuth();
  
  const [filters, setFilters] = useState({
    date_from: "",
    date_to: "",
  });
  
  const debouncedFilters = useDebounce(filters, 300);

  const [data, setData] = useState<DashboardSummaryReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(true);

  const fetchDashboardData = async (activeFilters = filters) => {
    try {
      setIsLoading(true);
      setHasPermission(true);
      const res = await invoiceCenterApi.getInvoiceCenterDashboardSummary(activeFilters);
      setData(res.data?.data || null);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setHasPermission(false);
      } else {
        toast.error(err.response?.data?.message || "Failed to load dashboard data");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(debouncedFilters);
  }, [debouncedFilters]);

  const handleApplyFilters = () => {
    fetchDashboardData(filters);
  };

  const handleResetFilters = () => {
    setFilters({ date_from: "", date_to: "" });
  };

  if (!hasPermission) {
    return (
      <div className="p-8">
        <ReportPermissionState />
      </div>
    );
  }

  const customerCards: SummaryCardItem[] = [
    { title: "Total Customers", value: data?.total_customers || 0, format: "number", icon: <Users className="h-4 w-4 text-sky-600" />, subtitle: "Registered customer portfolio", path: "/invoice-center/customers" },
    { title: "Active Customers", value: data?.active_customers || 0, format: "number", icon: <Building2 className="h-4 w-4 text-emerald-600" />, subtitle: "Active trading accounts", path: "/invoice-center/customers" },
    { title: "Blocked Customers", value: data?.blocked_customers || 0, format: "number", icon: <UserX className="h-4 w-4 text-rose-600" />, subtitle: "Credit or compliance holds", path: "/invoice-center/customers" },
    { title: "Over Credit Limit", value: data?.customers_over_credit_limit || 0, format: "number", icon: <AlertTriangle className="h-4 w-4 text-amber-600" />, subtitle: "Exposure exceeded limit", path: "/invoice-center/reports/customer-balance" },
  ];

  const salesOrderCards: SummaryCardItem[] = [
    { title: "Total Sales Orders", value: data?.total_sales_orders || 0, format: "number", icon: <ShoppingCart className="h-4 w-4 text-emerald-600" />, subtitle: "Cumulative sales orders", path: "/invoice-center/sales-orders" },
    { title: "Approved Orders", value: data?.approved_sales_orders || 0, format: "number", icon: <CheckCircle className="h-4 w-4 text-emerald-600" />, subtitle: "Approved for fulfillment", path: "/invoice-center/sales-orders" },
    { title: "Pending Orders", value: data?.pending_sales_orders || 0, format: "number", icon: <Clock className="h-4 w-4 text-amber-600" />, subtitle: "Awaiting approval review", path: "/invoice-center/sales-orders" },
    { title: "Closed Orders", value: data?.closed_sales_orders || 0, format: "number", icon: <XCircle className="h-4 w-4 text-slate-500" />, subtitle: "Completed and closed orders", path: "/invoice-center/sales-orders" },
  ];

  const invoiceCards: SummaryCardItem[] = [
    { title: "Total Invoices", value: data?.total_sales_invoices || 0, format: "number", icon: <FileText className="h-4 w-4 text-violet-600" />, subtitle: "Issued sales invoices", path: "/invoice-center/sales-invoices" },
    { title: "Posted Invoices", value: data?.posted_sales_invoices || 0, format: "number", icon: <UploadCloud className="h-4 w-4 text-indigo-600" />, subtitle: "Synchronized to GL ledger", path: "/invoice-center/sales-invoices" },
    { title: "Unpaid Invoices", value: data?.unpaid_invoices || 0, format: "number", icon: <AlertTriangle className="h-4 w-4 text-amber-600" />, subtitle: "Outstanding receivables", path: "/invoice-center/sales-invoices" },
    { title: "Paid Invoices", value: data?.paid_invoices || 0, format: "number", icon: <CheckCircle className="h-4 w-4 text-emerald-600" />, subtitle: "Settled and cleared invoices", path: "/invoice-center/sales-invoices" },
  ];

  const collectionCards: SummaryCardItem[] = [
    { title: "Total Invoice Amount", value: data?.total_invoice_amount || 0, format: "currency", icon: <Coins className="h-4 w-4 text-amber-600" />, subtitle: "Total gross billed receivables", path: "/invoice-center/reports/collection-summary" },
    { title: "Total Paid Amount", value: data?.total_paid_amount || 0, format: "currency", icon: <Wallet className="h-4 w-4 text-emerald-600" />, subtitle: "Total cleared cash receipts", path: "/invoice-center/customer-receipts" },
    { title: "Total Balance Amount", value: data?.total_balance_amount || 0, format: "currency", icon: <Banknote className="h-4 w-4 text-rose-600" />, subtitle: "Net unpaid aging balance", path: "/invoice-center/reports/customer-aging" },
    { title: "Allocated Receipts", value: data?.total_allocated_receipt_amount || 0, format: "currency", icon: <CreditCard className="h-4 w-4 text-indigo-600" />, subtitle: "Receipts matched to invoices", path: "/invoice-center/customer-receipts" },
  ];

  const financeCards: SummaryCardItem[] = [
    { title: "Finance Posted", value: data?.finance_posted_documents || 0, format: "number", icon: <UploadCloud className="h-4 w-4 text-teal-600" />, subtitle: "Synchronized to General Ledger", path: "/invoice-center/finance-posting" },
    { title: "Finance Unposted", value: data?.finance_unposted_documents || 0, format: "number", icon: <DownloadCloud className="h-4 w-4 text-amber-600" />, subtitle: "Pending GL synchronization", path: "/invoice-center/finance-posting" },
  ];

  return (
    <ReportPageShell
      title="Reports Dashboard"
      description="Overview of Invoice Center operations and finances."
      actions={
        <ReportExportActions 
          data={data} 
          filename={`invoice-center-dashboard-${new Date().toISOString().split('T')[0]}`} 
          title="Invoice Center Reports Dashboard"
          subtitle={`Generated on ${new Date().toLocaleDateString()}`}
          summaryCards={[...customerCards, ...salesOrderCards, ...invoiceCards, ...collectionCards]}
          disabled={isLoading || !data}
        />
      }
      filters={
        <ReportFilterBar
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
          isLoading={isLoading}
        >
          <div className="space-y-1.5">
            <Label htmlFor="date_preset" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
              Quick Presets
            </Label>
            <Select
              value="custom"
              onValueChange={(val) => {
                const today = new Date();
                const pad = (n: number) => String(n).padStart(2, "0");
                const formatDate = (d: Date) =>
                  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

                if (val === "this_month") {
                  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                  setFilters({
                    date_from: formatDate(startOfMonth),
                    date_to: formatDate(today),
                  });
                } else if (val === "last_month") {
                  const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                  const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
                  setFilters({
                    date_from: formatDate(startOfLastMonth),
                    date_to: formatDate(endOfLastMonth),
                  });
                } else if (val === "this_quarter") {
                  const startOfQuarter = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);
                  setFilters({
                    date_from: formatDate(startOfQuarter),
                    date_to: formatDate(today),
                  });
                } else if (val === "ytd") {
                  const startOfYear = new Date(today.getFullYear(), 0, 1);
                  setFilters({
                    date_from: formatDate(startOfYear),
                    date_to: formatDate(today),
                  });
                }
              }}
            >
              <SelectTrigger id="date_preset" className="w-full h-9 rounded-xl border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-indigo-100">
                <SelectValue placeholder="Quick Presets..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="custom">Quick Presets...</SelectItem>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="this_quarter">This Quarter</SelectItem>
                <SelectItem value="ytd">Year to Date (YTD)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="date_from" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              Date From
            </Label>
            <Input 
              id="date_from" 
              type="date"
              value={filters.date_from}
              onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value }))}
              className="w-full h-9 rounded-xl border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-indigo-100"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="date_to" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              Date To
            </Label>
            <Input 
              id="date_to" 
              type="date"
              value={filters.date_to}
              onChange={(e) => setFilters(prev => ({ ...prev, date_to: e.target.value }))}
              className="w-full h-9 rounded-xl border-slate-200 bg-white text-xs font-medium focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </ReportFilterBar>
      }
      summary={
        <div className="space-y-7">
          {/* 1. Customers Section Card */}
          <DashboardSectionCard
            title="Customers"
            subtitle="Customer portfolio accounts, compliance holds, and credit limit tracking"
            badge="Portfolio & Risk"
            icon={<Users className="h-5 w-5" />}
            iconBg="bg-sky-50"
            iconColor="text-sky-600"
            badgeBg="bg-sky-50"
            badgeBorder="border-sky-200/80"
            badgeColor="text-sky-700"
            viewLink={{ label: "Customer Directory", path: "/invoice-center/customers" }}
            cards={customerCards}
            isLoading={isLoading}
          />

          {/* 2. Sales Orders Section Card */}
          <DashboardSectionCard
            title="Sales Orders"
            subtitle="Fulfillment pipeline, approval workflows, backlog, and closed sales"
            badge="Order Pipeline"
            icon={<ShoppingCart className="h-5 w-5" />}
            iconBg="bg-emerald-50"
            iconColor="text-emerald-600"
            badgeBg="bg-emerald-50"
            badgeBorder="border-emerald-200/80"
            badgeColor="text-emerald-700"
            viewLink={{ label: "Sales Orders", path: "/invoice-center/sales-orders" }}
            cards={salesOrderCards}
            isLoading={isLoading}
          />

          {/* 3. Sales Invoices Section Card */}
          <DashboardSectionCard
            title="Sales Invoices"
            subtitle="Commercial invoice issuance, GL sync status, and collection aging"
            badge="Billing Center"
            icon={<FileText className="h-5 w-5" />}
            iconBg="bg-violet-50"
            iconColor="text-violet-600"
            badgeBg="bg-violet-50"
            badgeBorder="border-violet-200/80"
            badgeColor="text-violet-700"
            viewLink={{ label: "Invoice Register", path: "/invoice-center/sales-invoices" }}
            cards={invoiceCards}
            isLoading={isLoading}
          />

          {/* 4. Collections Section Card */}
          <DashboardSectionCard
            title="Collections & Cash Flow"
            subtitle="Gross invoiced revenue, cleared inflows, outstanding aging, and receipts allocation"
            badge="Liquidity & Receivables"
            icon={<Coins className="h-5 w-5" />}
            iconBg="bg-amber-50"
            iconColor="text-amber-600"
            badgeBg="bg-amber-50"
            badgeBorder="border-amber-200/80"
            badgeColor="text-amber-700"
            viewLink={{ label: "Collection Summary", path: "/invoice-center/reports/collection-summary" }}
            cards={collectionCards}
            isLoading={isLoading}
          />

          {/* 5. Finance Posting Section Card */}
          <DashboardSectionCard
            title="Finance & GL Synchronization"
            subtitle="Real-time synchronization between invoice center transactions and the General Ledger"
            badge="General Ledger Sync"
            icon={<Activity className="h-5 w-5" />}
            iconBg="bg-teal-50"
            iconColor="text-teal-600"
            badgeBg="bg-teal-50"
            badgeBorder="border-teal-200/80"
            badgeColor="text-teal-700"
            viewLink={{ label: "Posting Center", path: "/invoice-center/finance-posting" }}
            cards={financeCards}
            isLoading={isLoading}
          />
        </div>
      }
    />
  );
};

