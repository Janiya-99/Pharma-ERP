import React, { useState, useEffect } from 'react';
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
  UploadCloud, DownloadCloud, Activity
} from "lucide-react";

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
    { title: "Total Customers", value: data?.total_customers || 0, format: "number", icon: <Users className="h-4 w-4" />, path: "/invoice-center/customers" },
    { title: "Active Customers", value: data?.active_customers || 0, format: "number", icon: <Building2 className="h-4 w-4 text-emerald-500" />, path: "/invoice-center/customers" },
    { title: "Blocked Customers", value: data?.blocked_customers || 0, format: "number", icon: <UserX className="h-4 w-4 text-red-500" />, path: "/invoice-center/customers" },
    { title: "Over Credit Limit", value: data?.customers_over_credit_limit || 0, format: "number", icon: <AlertTriangle className="h-4 w-4 text-amber-500" />, path: "/invoice-center/reports/customer-balance" },
  ];

  const salesOrderCards: SummaryCardItem[] = [
    { title: "Total Sales Orders", value: data?.total_sales_orders || 0, format: "number", icon: <ShoppingCart className="h-4 w-4" />, path: "/invoice-center/sales-orders" },
    { title: "Approved Orders", value: data?.approved_sales_orders || 0, format: "number", icon: <CheckCircle className="h-4 w-4 text-emerald-500" />, path: "/invoice-center/sales-orders" },
    { title: "Pending Orders", value: data?.pending_sales_orders || 0, format: "number", icon: <Clock className="h-4 w-4 text-amber-500" />, path: "/invoice-center/sales-orders" },
    { title: "Closed Orders", value: data?.closed_sales_orders || 0, format: "number", icon: <XCircle className="h-4 w-4 text-slate-500" />, path: "/invoice-center/sales-orders" },
  ];

  const invoiceCards: SummaryCardItem[] = [
    { title: "Total Invoices", value: data?.total_sales_invoices || 0, format: "number", icon: <FileText className="h-4 w-4" />, path: "/invoice-center/sales-invoices" },
    { title: "Posted Invoices", value: data?.posted_sales_invoices || 0, format: "number", icon: <UploadCloud className="h-4 w-4 text-indigo-500" />, path: "/invoice-center/sales-invoices" },
    { title: "Unpaid Invoices", value: data?.unpaid_invoices || 0, format: "number", icon: <AlertTriangle className="h-4 w-4 text-amber-500" />, path: "/invoice-center/sales-invoices" },
    { title: "Paid Invoices", value: data?.paid_invoices || 0, format: "number", icon: <CheckCircle className="h-4 w-4 text-emerald-500" />, path: "/invoice-center/sales-invoices" },
  ];

  const collectionCards: SummaryCardItem[] = [
    { title: "Total Invoice Amount", value: data?.total_invoice_amount || 0, format: "currency", icon: <Coins className="h-4 w-4" />, path: "/invoice-center/reports/collection-summary" },
    { title: "Total Paid Amount", value: data?.total_paid_amount || 0, format: "currency", icon: <Wallet className="h-4 w-4 text-emerald-500" />, path: "/invoice-center/customer-receipts" },
    { title: "Total Balance Amount", value: data?.total_balance_amount || 0, format: "currency", icon: <Banknote className="h-4 w-4 text-amber-500" />, path: "/invoice-center/reports/customer-aging" },
    { title: "Allocated Receipts", value: data?.total_allocated_receipt_amount || 0, format: "currency", icon: <CreditCard className="h-4 w-4 text-indigo-500" />, path: "/invoice-center/customer-receipts" },
  ];

  const financeCards: SummaryCardItem[] = [
    { title: "Finance Posted", value: data?.finance_posted_documents || 0, format: "number", icon: <UploadCloud className="h-4 w-4 text-emerald-500" />, path: "/invoice-center/finance-posting" },
    { title: "Finance Unposted", value: data?.finance_unposted_documents || 0, format: "number", icon: <DownloadCloud className="h-4 w-4 text-amber-500" />, path: "/invoice-center/finance-posting" },
  ];

  return (
    <ReportPageShell
      title="Reports Dashboard"
      description="Overview of Invoice Center operations and finances."
      actions={
        <ReportExportActions 
          data={data} 
          filename={`invoice-center-dashboard-${new Date().toISOString().split('T')[0]}`} 
          disabled={isLoading || !data}
        />
      }
      filters={
        <ReportFilterBar
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
          isLoading={isLoading}
        >
          <div className="space-y-1">
            <Label htmlFor="date_preset">Quick Presets</Label>
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
              <SelectTrigger id="date_preset" className="w-[160px]">
                <SelectValue placeholder="Quick Presets" />
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
          <div className="space-y-1">
            <Label htmlFor="date_from">Date From</Label>
            <Input 
              id="date_from" 
              type="date"
              value={filters.date_from}
              onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value }))}
             placeholder="Enter Date From" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="date_to">Date To</Label>
            <Input 
              id="date_to" 
              type="date"
              value={filters.date_to}
              onChange={(e) => setFilters(prev => ({ ...prev, date_to: e.target.value }))}
             placeholder="Enter Date To" />
          </div>
        </ReportFilterBar>
      }
      summary={
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-navy-900 mb-3 flex items-center"><Users className="mr-2 h-5 w-5" /> Customers</h3>
            <ReportSummaryCards items={customerCards} isLoading={isLoading} />
          </div>
          <div>
            <h3 className="text-lg font-medium text-navy-900 mb-3 flex items-center"><ShoppingCart className="mr-2 h-5 w-5" /> Sales Orders</h3>
            <ReportSummaryCards items={salesOrderCards} isLoading={isLoading} />
          </div>
          <div>
            <h3 className="text-lg font-medium text-navy-900 mb-3 flex items-center"><FileText className="mr-2 h-5 w-5" /> Invoices</h3>
            <ReportSummaryCards items={invoiceCards} isLoading={isLoading} />
          </div>
          <div>
            <h3 className="text-lg font-medium text-navy-900 mb-3 flex items-center"><Wallet className="mr-2 h-5 w-5" /> Collections</h3>
            <ReportSummaryCards items={collectionCards} isLoading={isLoading} />
          </div>
          <div>
            <h3 className="text-lg font-medium text-navy-900 mb-3 flex items-center"><Activity className="mr-2 h-5 w-5" /> Finance Posting</h3>
            <ReportSummaryCards items={financeCards} isLoading={isLoading} />
          </div>
        </div>
      }
    />
  );
};
