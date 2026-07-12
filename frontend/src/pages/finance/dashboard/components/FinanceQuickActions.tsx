import { useNavigate } from "react-router-dom";
import { BookOpen, Wallet, Receipt, Plus, BarChart3, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";

export function FinanceQuickActions() {
  const navigate = useNavigate();

  const actions = [
    { label: "New Journal Entry", path: "/finance/general-ledger/journal-entry", icon: BookOpen },
    { label: "Payment Voucher", path: "/finance/banking/payment-vouchers", icon: Wallet },
    { label: "Receipt Voucher", path: "/finance/banking/receipt-vouchers", icon: Receipt },
    { label: "Chart of Accounts", path: "/finance/setup/chart-of-accounts", icon: Plus },
    { label: "Reports", path: "/finance/reports/reports-dashboard", icon: BarChart3 },
    { label: "Bank Reconciliation", path: "/finance/bank-reconciliations", icon: RefreshCw },
  ];

  return (
    <Card className="border-gray-200 bg-white/88 shadow-sm backdrop-blur-sm  ">
      <CardHeader className="pb-3">
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common finance tasks</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {actions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <Button
                key={idx}
                variant="outline"
                className="h-auto flex-col items-center justify-center gap-2 px-2 py-4 text-center hover:bg-slate-50 hover:text-indigo-600  "
                onClick={() => navigate(action.path)}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs whitespace-normal">{action.label}</span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
