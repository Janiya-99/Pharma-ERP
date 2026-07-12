import { useNavigate } from "react-router-dom";
import { BookOpen, TrendingUp, Landmark, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../../components/ui/card";

export function FinanceReportShortcuts() {
  const navigate = useNavigate();

  const reportShortcuts = [
    { title: "Trial Balance", path: "/finance/reports/trial-balance", icon: BookOpen, desc: "Verify ledger balances" },
    { title: "Profit & Loss", path: "/finance/reports/profit-and-loss", icon: TrendingUp, desc: "Revenue and net income" },
    { title: "Balance Sheet", path: "/finance/reports/balance-sheet", icon: Landmark, desc: "Assets, liabilities, equity" },
    { title: "Account Ledger", path: "/finance/general-ledger/account-ledger", icon: FileText, desc: "Transaction history" },
  ];

  return (
    <Card className="border-gray-200 bg-white/88 shadow-sm backdrop-blur-sm  ">
      <CardHeader className="pb-3">
        <CardTitle>Core Reports</CardTitle>
        <CardDescription>Essential financial statements</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          {reportShortcuts.map((report, idx) => {
            const Icon = report.icon;
            return (
              <div
                key={idx}
                className="group flex cursor-pointer items-start gap-3 rounded-md p-2 transition-colors hover:bg-slate-50 "
                onClick={() => navigate(report.path)}
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-indigo-50 text-indigo-600 transition-colors group-hover:bg-indigo-100  ">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900 group-hover:text-indigo-600  ">
                    {report.title}
                  </div>
                  <div className="text-xs text-gray-500">{report.desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
