import React, { useState, useEffect } from 'react';
import { invoiceCenterApi } from "@/api/invoiceCenterApi";
import { ReportPageShell } from "@/components/invoice-center/reports/ReportPageShell";
import { ReportSummaryCards, SummaryCardItem } from "@/components/invoice-center/reports/ReportSummaryCards";
import { ReportFilterBar } from "@/components/invoice-center/reports/ReportFilterBar";
import { ReportPermissionState } from "@/components/invoice-center/reports/ReportPermissionState";
import { ReportExportActions } from "@/components/invoice-center/reports/ReportExportActions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  
  const [data, setData] = useState<DashboardSummaryReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      setHasPermission(true);
      const res = await invoiceCenterApi.getInvoiceCenterDashboardSummary(filters);
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
    // Only load if active software is INVOICE_CENTER, handled by routes
    fetchDashboardData();
  }, []);

  const handleApplyFilters = () => {
    fetchDashboardData();
  };

  const handleResetFilters = () => {
    setFilters({ date_from: "", date_to: "" });
    setTimeout(fetchDashboardData, 0);
  };

  if (!hasPermission) {
    return (
      <div className="p-8">
        <ReportPermissionState />
      </div>
    );
  }

  const customerCards: SummaryCardItem[] = [
    { title: "Total Customers", value: data?.total_customers || 0, format: "number", icon: <Users className="h-4 w-4" /> },
    { title: "Active Customers", value: data?.active_customers || 0, format: "number", icon: <Building2 className="h-4 w-4 text-emerald-500" /> },
    { title: "Blocked Customers", value: data?.blocked_customers || 0, format: "number", icon: <UserX className="h-4 w-4 text-red-500" /> },
    { title: "Over Credit Limit", value: data?.customers_over_credit_limit || 0, format: "number", icon: <AlertTriangle className="h-4 w-4 text-amber-500" /> },
  ];

  const salesOrderCards: SummaryCardItem[] = [
    { title: "Total Sales Orders", value: data?.total_sales_orders || 0, format: "number", icon: <ShoppingCart className="h-4 w-4" /> },
    { title: "Approved Orders", value: data?.approved_sales_orders || 0, format: "number", icon: <CheckCircle className="h-4 w-4 text-emerald-500" /> },
    { title: "Pending Orders", value: data?.pending_sales_orders || 0, format: "number", icon: <Clock className="h-4 w-4 text-amber-500" /> },
    { title: "Closed Orders", value: data?.closed_sales_orders || 0, format: "number", icon: <XCircle className="h-4 w-4 text-slate-500" /> },
  ];

  const invoiceCards: SummaryCardItem[] = [
    { title: "Total Invoices", value: data?.total_sales_invoices || 0, format: "number", icon: <FileText className="h-4 w-4" /> },
    { title: "Posted Invoices", value: data?.posted_sales_invoices || 0, format: "number", icon: <UploadCloud className="h-4 w-4 text-blue-500" /> },
    { title: "Unpaid Invoices", value: data?.unpaid_invoices || 0, format: "number", icon: <AlertTriangle className="h-4 w-4 text-amber-500" /> },
    { title: "Paid Invoices", value: data?.paid_invoices || 0, format: "number", icon: <CheckCircle className="h-4 w-4 text-emerald-500" /> },
  ];

  const collectionCards: SummaryCardItem[] = [
    { title: "Total Invoice Amount", value: data?.total_invoice_amount || 0, format: "currency", icon: <Coins className="h-4 w-4" /> },
    { title: "Total Paid Amount", value: data?.total_paid_amount || 0, format: "currency", icon: <Wallet className="h-4 w-4 text-emerald-500" /> },
    { title: "Total Balance Amount", value: data?.total_balance_amount || 0, format: "currency", icon: <Banknote className="h-4 w-4 text-amber-500" /> },
    { title: "Allocated Receipts", value: data?.total_allocated_receipt_amount || 0, format: "currency", icon: <CreditCard className="h-4 w-4 text-blue-500" /> },
  ];

  const financeCards: SummaryCardItem[] = [
    { title: "Finance Posted", value: data?.finance_posted_documents || 0, format: "number", icon: <UploadCloud className="h-4 w-4 text-emerald-500" /> },
    { title: "Finance Unposted", value: data?.finance_unposted_documents || 0, format: "number", icon: <DownloadCloud className="h-4 w-4 text-amber-500" /> },
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
            <Label htmlFor="date_from">Date From</Label>
            <Input 
              id="date_from" 
              type="date"
              value={filters.date_from}
              onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="date_to">Date To</Label>
            <Input 
              id="date_to" 
              type="date"
              value={filters.date_to}
              onChange={(e) => setFilters(prev => ({ ...prev, date_to: e.target.value }))}
            />
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
