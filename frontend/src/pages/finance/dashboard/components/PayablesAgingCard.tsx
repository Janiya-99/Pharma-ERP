import { PayablesSummary } from "../types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../../components/ui/card";
import { money } from "../utils";

interface PayablesAgingCardProps {
  data: PayablesSummary;
}

export function PayablesAgingCard({ data }: PayablesAgingCardProps) {
  return (
    <Card className="rounded-3xl border-0 bg-white/70 backdrop-blur-2xl shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 overflow-hidden relative group transition-all hover:shadow-2xl hover:shadow-slate-200/60">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-orange-50/30 opacity-50 pointer-events-none" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-amber-100/50 to-transparent rounded-bl-full pointer-events-none opacity-50" />
      
      <CardHeader className="pb-4 relative z-10 border-b border-slate-100/50">
        <CardTitle className="text-lg font-semibold tracking-tight text-slate-800">Accounts Payable</CardTitle>
        <CardDescription className="text-sm font-medium text-slate-500">Outstanding vendor bills</CardDescription>
      </CardHeader>
      
      <CardContent className="pt-5 relative z-10">
        <div className="mb-6 flex items-end justify-between bg-white rounded-2xl p-4 ring-1 ring-slate-100 shadow-sm shadow-slate-100/50">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Total Outstanding</div>
            <div className="text-3xl font-bold tracking-tight text-slate-900">
              {money(data.total_payable)}
            </div>
          </div>
          <div className="text-right flex flex-col items-end justify-end">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Payments Due</div>
            <div className="inline-flex items-center justify-center rounded-full bg-amber-50 px-2.5 py-1 text-sm font-bold text-amber-600 ring-1 ring-amber-200/50">
              {data.payment_due_count}
            </div>
          </div>
        </div>
        
        <div className="space-y-4 pt-1">
          {data.aging.map((bucket, index) => {
            const percentage = (bucket.amount / data.total_payable) * 100;
            // Modern gradient colors for payables
            const colors = [
              "from-amber-400 to-orange-500 shadow-orange-500/20",
              "from-orange-400 to-rose-500 shadow-rose-500/20",
              "from-rose-400 to-pink-500 shadow-pink-500/20",
              "from-purple-400 to-fuchsia-500 shadow-fuchsia-500/20",
              "from-slate-400 to-slate-500 shadow-slate-500/20",
            ];
            const colorClass = colors[index % colors.length];

            return (
              <div key={index} className="group/bar">
                <div className="mb-1.5 flex justify-between text-sm items-center">
                  <span className="font-semibold text-slate-600 group-hover/bar:text-amber-600 transition-colors">{bucket.label}</span>
                  <span className="font-bold text-slate-800 tabular-nums">{money(bucket.amount)}</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100/80 shadow-inner">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${colorClass} transition-all duration-700 ease-out shadow-sm`}
                    style={{ width: `${Math.max(percentage, 2)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
