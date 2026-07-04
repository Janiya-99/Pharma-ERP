import { Link } from "react-router-dom";
import { FileText, Plus, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const sampleRows = [
  {
    number: "PF-0001",
    customer: "Sample Pharmacy",
    date: new Date().toISOString().slice(0, 10),
    status: "Draft",
    amount: "LKR 0.00",
  },
];

export default function ProformaInvoicesPage() {
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
        <Button asChild>
          <Link to="/invoice-center/sales-invoices/create">
            <Plus className="h-4 w-4" />
            Create
          </Link>
        </Button>
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
                {sampleRows.map((row) => (
                  <tr key={row.number} className="border-t border-slate-200/80">
                    <td className="px-3 py-3 font-medium text-[#111827]">{row.number}</td>
                    <td className="px-3 py-3 text-[#1F2937]">{row.customer}</td>
                    <td className="px-3 py-3 text-[#1F2937]">{row.date}</td>
                    <td className="px-3 py-3 text-[#1F2937]">{row.amount}</td>
                    <td className="px-3 py-3">
                      <Badge variant="outline">{row.status}</Badge>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/invoice-center/sales-invoices/create">
                          <Printer className="h-3.5 w-3.5" />
                          Continue
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
