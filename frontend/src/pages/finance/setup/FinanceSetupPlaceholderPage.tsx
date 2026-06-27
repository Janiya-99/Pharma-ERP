import React from "react";
import { CalendarClock, CircleHelp, FileSpreadsheet, Settings } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";

type FinanceSetupPlaceholderPageProps = {
  title: string;
  description: string;
  eyebrow?: string;
};

const workflowCards = [
  { title: "Chart of Accounts", description: "Every financial transaction posts against one or more ledger accounts.", icon: FileSpreadsheet },
  { title: "Opening Balances", description: "Starting balances seed the general ledger at financial year opening.", icon: CalendarClock },
  { title: "Posting Rules", description: "Cash, bank, control, income, expense, and asset accounts drive finance reports.", icon: Settings },
];

const FinanceSetupPlaceholderPage = ({ title, description, eyebrow = "Finance Setup" }: FinanceSetupPlaceholderPageProps) => {
  return (
    <div className="min-h-full bg-[#F8FAFC] p-6 text-slate-900">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">{eyebrow}</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">{title}</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-500">{description}</p>
      </div>

      <Card className="border border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-100">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>This setup screen is ready in navigation and can be connected to backend finance APIs next.</CardDescription>
            </div>
            <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">Setup</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5 pt-1">
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
            <CircleHelp className="mx-auto h-10 w-10 text-slate-400" />
            <h2 className="mt-4 text-lg font-semibold text-slate-900">Configuration workspace</h2>
            <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-500">
              Use this area for account governance, period setup, approvals, defaults, and posting rules. Chart of Accounts is already available as the foundation screen for ledger transactions.
            </p>
            <Button className="mt-5 bg-indigo-600 text-white hover:bg-indigo-700">Create Setup Record</Button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {workflowCards.map((card) => (
              <div key={card.title} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                  <card.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold text-slate-900">{card.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{card.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceSetupPlaceholderPage;
