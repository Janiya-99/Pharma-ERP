import { useNavigate } from "react-router-dom";
import { BookOpen, Wallet, Receipt, Plus, BarChart3, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";

export function FinanceQuickActions() {
  const navigate = useNavigate();

  const actions = [
    { label: "New Journal Entry", path: "/finance/general-ledger/journal-entry", icon: BookOpen, color: "text-indigo-600 bg-indigo-50 group-hover:bg-indigo-100 group-hover:text-indigo-700" },
    { label: "Payment Voucher", path: "/finance/banking/payment-vouchers", icon: Wallet, color: "text-rose-600 bg-rose-50 group-hover:bg-rose-100 group-hover:text-rose-700" },
    { label: "Receipt Voucher", path: "/finance/banking/receipt-vouchers", icon: Receipt, color: "text-emerald-600 bg-emerald-50 group-hover:bg-emerald-100 group-hover:text-emerald-700" },
    { label: "Chart of Accounts", path: "/finance/setup/chart-of-accounts", icon: Plus, color: "text-blue-600 bg-blue-50 group-hover:bg-blue-100 group-hover:text-blue-700" },
    { label: "Reports", path: "/finance/reports/reports-dashboard", icon: BarChart3, color: "text-amber-600 bg-amber-50 group-hover:bg-amber-100 group-hover:text-amber-700" },
    { label: "Bank Reconciliation", path: "/finance/bank-reconciliations", icon: RefreshCw, color: "text-teal-600 bg-teal-50 group-hover:bg-teal-100 group-hover:text-teal-700" },
  ];

  return (
    <Card className="rounded-3xl border-0 bg-white/70 backdrop-blur-2xl shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 overflow-hidden relative group/card transition-all hover:shadow-2xl hover:shadow-slate-200/60">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50/50 to-white/30 opacity-50 pointer-events-none" />
      <CardHeader className="pb-4 relative z-10 border-b border-slate-100/50">
        <CardTitle className="text-lg font-semibold tracking-tight text-slate-800">Quick Actions</CardTitle>
        <CardDescription className="text-sm font-medium text-slate-500">Common finance tasks</CardDescription>
      </CardHeader>
      <CardContent className="pt-4 relative z-10">
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <Button
                key={idx}
                variant="outline"
                className="group h-auto flex-col items-center justify-center gap-3 rounded-2xl border-slate-100 px-3 py-5 text-center transition-all duration-300 hover:scale-[1.02] hover:border-transparent hover:bg-white hover:shadow-md hover:shadow-slate-200/50"
                onClick={() => navigate(action.path)}
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-300 ${action.color}`}>
                  <Icon className="h-5 w-5" strokeWidth={2.5} />
                </div>
                <span className="text-xs font-semibold text-slate-600 group-hover:text-slate-900 whitespace-normal leading-tight">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
