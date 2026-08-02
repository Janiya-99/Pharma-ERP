import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, RefreshCw } from "lucide-react";

import invoiceCenterApi from "@/api/invoiceCenterApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type ApprovalMode = "inbox" | "submitted" | "history";

type ApprovalRow = {
  id: number | string;
  documentType: string;
  documentNumber: string;
  customerName: string;
  date: string;
  amount: number;
  approvalStatus: string;
  route: string;
};

type ApprovalWorkspacePageProps = {
  mode: ApprovalMode;
};

const config: Record<ApprovalMode, { title: string; description: string }> = {
  inbox: {
    title: "Approval Inbox",
    description: "Documents waiting for review and approval.",
  },
  submitted: {
    title: "My Submitted Documents",
    description: "Draft and pending documents submitted through Invoice Center.",
  },
  history: {
    title: "Approval History",
    description: "Approved, rejected, cancelled, and completed approval activity.",
  },
};

const rowsFromResponse = (response: any): any[] => {
  const data = response?.data?.data ?? response?.data ?? response;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.rows)) return data.rows;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const amountOf = (row: any) =>
  Number(row.total_amount ?? row.receipt_amount ?? row.grand_total ?? 0);

const formatMoney = (value: number) =>
  `LKR ${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const statusParams = (mode: ApprovalMode) => {
  if (mode === "inbox") return ["pending"];
  if (mode === "submitted") return ["draft", "pending"];
  return ["approved", "rejected", "cancelled"];
};

export default function ApprovalWorkspacePage({ mode }: ApprovalWorkspacePageProps) {
  const [rows, setRows] = useState<ApprovalRow[]>([]);
  const [loading, setLoading] = useState(true);

  const pageConfig = config[mode];

  const loadRows = async () => {
    setLoading(true);
    try {
      const statuses = statusParams(mode);
      const requests = statuses.flatMap((approval_status) => [
        invoiceCenterApi.getSalesOrders({ approval_status, limit: 20 }),
        invoiceCenterApi.getSalesInvoices({ approval_status: approval_status as any, limit: 20 }),
        invoiceCenterApi.getCreditNotes({ approval_status, limit: 20 }),
        invoiceCenterApi.getDebitNotes({ approval_status, limit: 20 }),
        invoiceCenterApi.getCustomerReceipts({ approval_status, limit: 20 }),
      ]);

      const results = await Promise.allSettled(requests);
      const nextRows: ApprovalRow[] = [];

      results.forEach((result, index) => {
        if (result.status !== "fulfilled") return;
        const source = index % 5;
        const meta = [
          ["Sales Order", "/invoice-center/sales-orders", "sales_order_number", "sales_order_date"],
          ["Sales Invoice", "/invoice-center/sales-invoices", "invoice_number", "invoice_date"],
          ["Credit Note", "/invoice-center/credit-notes", "credit_note_number", "credit_note_date"],
          ["Debit Note", "/invoice-center/debit-notes", "debit_note_number", "debit_note_date"],
          ["Customer Receipt", "/invoice-center/customer-receipts", "receipt_number", "receipt_date"],
        ][source];

        rowsFromResponse(result.value).forEach((row) => {
          nextRows.push({
            id: row.id,
            documentType: meta[0],
            documentNumber: row[meta[2]] || `#${row.id}`,
            customerName: row.customer_name || row.customer?.customer_name || "-",
            date: String(row[meta[3]] || row.created_at || "").slice(0, 10),
            amount: amountOf(row),
            approvalStatus: row.approval_status || row.status || "-",
            route: `${meta[1]}/${row.id}`,
          });
        });
      });

      setRows(nextRows);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRows();
  }, [mode]);

  const emptyMessage = useMemo(() => {
    if (mode === "inbox") return "No documents are waiting for approval.";
    if (mode === "submitted") return "No submitted documents found.";
    return "No approval history found.";
  }, [mode]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#111827]">
            {pageConfig.title}
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">{pageConfig.description}</p>
        </div>
        <Button variant="outline" onClick={loadRows} disabled={loading}>
          <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-3 p-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : rows.length === 0 ? (
            <div className="p-10 text-center text-sm text-[#6B7280]">{emptyMessage}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-[#374151]">
                  <tr>
                    <th className="px-4 py-3 text-left">Document</th>
                    <th className="px-4 py-3 text-left">Customer</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Amount</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={`${row.documentType}-${row.id}`} className="border-t border-slate-200/80">
                      <td className="px-4 py-3">
                        <div className="font-medium text-[#111827]">{row.documentNumber}</div>
                        <div className="text-xs text-[#6B7280]">{row.documentType}</div>
                      </td>
                      <td className="px-4 py-3 text-[#1F2937]">{row.customerName}</td>
                      <td className="px-4 py-3 text-[#1F2937]">{row.date || "-"}</td>
                      <td className="px-4 py-3 text-[#1F2937]">{formatMoney(row.amount)}</td>
                      <td className="px-4 py-3">
                        <Badge variant="outline">{row.approvalStatus}</Badge>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button asChild variant="outline" size="sm">
                          <Link to={row.route}>
                            <Eye className="h-3.5 w-3.5" />
                            View
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
