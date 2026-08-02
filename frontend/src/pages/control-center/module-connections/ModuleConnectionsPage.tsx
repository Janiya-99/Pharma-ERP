import {
  ArrowRight,
  CheckCircle2,
  Settings,
  TriangleAlert,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent } from "../../../components/ui/card";

const connections = [
  {
    title: "Control Center -> Finance",
    status: "Connected",
    ready: true,
    required: ["Company", "Branches", "Users", "Roles", "Permissions"],
    missing: [],
    action: "View Chart of Accounts",
    href: "/finance/setup/chart-of-accounts",
    last: "Live company context",
  },
  {
    title: "Control Center -> Inventory",
    status: "Connected",
    ready: true,
    required: ["Company", "Branches", "Users", "Warehouses"],
    missing: [],
    action: "View Warehouses",
    href: "/inventory/warehouses",
    last: "Live branch context",
  },
  {
    title: "Control Center -> Invoice Center",
    status: "Connected",
    ready: true,
    required: ["Customers", "Branches", "Approval Settings"],
    missing: [],
    action: "View Customers",
    href: "/invoice-center/customers",
    last: "Live customer access",
  },
  {
    title: "Inventory -> Invoice Center",
    status: "Connected",
    ready: true,
    required: ["Products", "Batches", "Warehouses", "Stock Balances"],
    missing: [],
    action: "View Stock Availability",
    href: "/inventory/stock-balances",
    last: "Used by sales invoice lines",
  },
  {
    title: "Invoice Center -> Finance",
    status: "Missing Accounts",
    ready: false,
    required: ["Accounts Receivable", "Sales Revenue", "Cash / Bank Account"],
    missing: ["Receipt payment accounts", "Tax account if tax is used"],
    action: "Configure Finance Settings",
    href: "/invoice-center/finance-settings",
    last: "Posts sales invoices, receipts, credit notes, debit notes",
  },
  {
    title: "Inventory -> Finance",
    status: "Prepared",
    ready: false,
    required: ["Inventory Asset", "COGS", "Adjustment Gain / Loss"],
    missing: ["COGS mapping persistence"],
    action: "Review Finance Settings",
    href: "/invoice-center/finance-settings",
    last: "GRN and adjustments can be added later",
  },
];

export default function ModuleConnectionsPage() {
  return (
    <div className="page-content space-y-5 pb-32">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#111827]">
          Module Connections
        </h1>
        <p className="mt-1 text-sm text-[#6B7280]">
          See how Control Center, Inventory, Invoice Center, and Finance share
          setup and posting flows.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {connections.map((connection) => (
          <Card
            key={connection.title}
            className="rounded-2xl border-slate-200 bg-white/80 shadow-sm"
          >
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-[#111827]">
                      {connection.title}
                    </h2>
                    <Badge variant={connection.ready ? "outline" : "secondary"}>
                      {connection.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-[#6B7280]">
                    {connection.last}
                  </p>
                </div>
                <div
                  className={`rounded-xl p-2 ${
                    connection.ready
                      ? "bg-green-50 text-green-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {connection.ready ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <TriangleAlert className="h-5 w-5" />
                  )}
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-sm font-semibold text-[#1F2937]">
                    Required Setup
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-[#374151]">
                    {connection.required.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <p className="text-sm font-semibold text-[#1F2937]">
                    Missing Setup
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-[#374151]">
                    {(connection.missing.length
                      ? connection.missing
                      : ["None"]
                    ).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <Button variant="outline" asChild>
                  <Link to={connection.href}>
                    <Settings className="h-4 w-4" />
                    {connection.action}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
