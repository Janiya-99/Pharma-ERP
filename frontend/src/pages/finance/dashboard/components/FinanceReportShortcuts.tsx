import { useNavigate } from "react-router-dom";
import { BookOpen, TrendingUp, Landmark, FileText, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../../components/ui/card";

export function FinanceReportShortcuts() {
  const navigate = useNavigate();

  const reportShortcuts = [
    { title: "Trial Balance", path: "/finance/reports/trial-balance", icon: BookOpen, desc: "Verify ledger balances", color: "bg-blue-500", light: "bg-blue-50/80 text-blue-600" },
    { title: "Profit & Loss", path: "/finance/reports/profit-and-loss", icon: TrendingUp, desc: "Revenue and net income", color: "bg-emerald-500", light: "bg-emerald-50/80 text-emerald-600" },
    { title: "Balance Sheet", path: "/finance/reports/balance-sheet", icon: Landmark, desc: "Assets, liabilities, equity", color: "bg-indigo-500", light: "bg-indigo-50/80 text-indigo-600" },
    { title: "Account Ledger", path: "/finance/general-ledger/account-ledger", icon: FileText, desc: "Transaction history", color: "bg-amber-500", light: "bg-amber-50/80 text-amber-600" },
  ];

  return (
    <Card className="rounded-3xl border-0 bg-white/70 backdrop-blur-2xl shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 to-purple-50/10 pointer-events-none" />
      <CardHeader className="pb-4 relative z-10">
        <CardTitle className="text-lg font-semibold tracking-tight text-slate-800">Core Reports</CardTitle>
        <CardDescription className="text-sm font-medium text-slate-500">Essential financial statements</CardDescription>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="flex flex-col gap-3">
          {reportShortcuts.map((report, idx) => {
            const Icon = report.icon;
            return (
              <div
                key={idx}
                className="group flex cursor-pointer items-center justify-between gap-3 rounded-2xl p-3 transition-all duration-300 hover:bg-white hover:shadow-md hover:shadow-slate-200/50 hover:ring-1 hover:ring-slate-100"
                onClick={() => navigate(report.path)}
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${report.light}`}>
                    <Icon className="h-5 w-5" strokeWidth={2.5} />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-700 transition-colors group-hover:text-slate-900">
                      {report.title}
                    </div>
                    <div className="text-xs font-medium text-slate-500">{report.desc}</div>
                  </div>
                </div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-all duration-300 group-hover:bg-slate-100 group-hover:text-slate-700 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0">
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
