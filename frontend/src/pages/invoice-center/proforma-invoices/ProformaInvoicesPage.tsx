import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { FileText, Plus, Printer, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { invoiceCenterApi } from "@/api/invoiceCenterApi";
import { formatCurrency, formatDate } from "@/lib/utils";

interface ProformaRow {
  id: number | string;
  number: string;
  customer: string;
  date: string;
  status: string;
  amount: number;
}

export default function ProformaInvoicesPage() {
  const [invoices, setInvoices] = useState<ProformaRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProformaInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await invoiceCenterApi.getSalesInvoices({
        approval_status: "draft" as any,
        limit: 50,
      });
      const raw = res?.data?.data || res?.data?.items || (Array.isArray(res?.data) ? res.data : []);
      const mapped: ProformaRow[] = raw.map((inv: any) => ({
        id: inv.id,
        number: inv.invoice_number || `PF-${String(inv.id).padStart(4, "0")}`,
        customer: inv.customer?.name || inv.customer_name || "Direct Customer",
        date: inv.invoice_date ? formatDate(inv.invoice_date) : "N/A",
        status: inv.approval_status || inv.status || "Draft",
        amount: Number(inv.total_amount || 0),
      }));
      setInvoices(mapped);
    } catch {
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProformaInvoices();
  }, [fetchProformaInvoices]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#111827]">
            Proforma Invoices
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            Prepare draft customer invoices before issuing final sales invoices.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchProformaInvoices} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button asChild>
            <Link to="/invoice-center/sales-invoices/create">
              <Plus className="h-4 w-4 mr-1.5" />
              Create
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <FileText className="h-4 w-4 text-[#4854CC]" />
            Proforma Workspace
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-xl border border-slate-200/80">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-[#374151]">
                <tr>
                  <th className="px-3 py-2 text-left">Number</th>
                  <th className="px-3 py-2 text-left">Customer</th>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">Amount</th>
                  <th className="px-3 py-2 text-left">Status</th>
                  <th className="px-3 py-2 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#6B7280]">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#4854CC] border-t-transparent mb-2" />
                      <p className="text-sm font-medium">Loading proforma invoices...</p>
                    </td>
                  </tr>
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-[#6B7280]">
                      No proforma invoices found.
                    </td>
                  </tr>
                ) : (
                  invoices.map((row) => (
                    <tr key={row.id} className="border-t border-slate-200/80 hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-3 font-medium text-[#111827]">{row.number}</td>
                      <td className="px-3 py-3 text-[#1F2937]">{row.customer}</td>
                      <td className="px-3 py-3 text-[#1F2937]">{row.date}</td>
                      <td className="px-3 py-3 text-[#1F2937]">{formatCurrency(row.amount)}</td>
                      <td className="px-3 py-3">
                        <Badge variant="outline">{row.status}</Badge>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/invoice-center/sales-invoices/${row.id}`}>
                            <Printer className="h-3.5 w-3.5 mr-1" />
                            Continue
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
