import { ReceivablesSummary } from "../types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../../components/ui/card";
import { money } from "../utils";

interface ReceivablesAgingCardProps {
  data: ReceivablesSummary;
}

export function ReceivablesAgingCard({ data }: ReceivablesAgingCardProps) {
  return (
    <Card className="rounded-3xl border-0 bg-white/70 backdrop-blur-2xl shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 overflow-hidden relative group transition-all hover:shadow-2xl hover:shadow-slate-200/60">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 opacity-50 pointer-events-none" />
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-100/50 to-transparent rounded-bl-full pointer-events-none opacity-50" />
      
      <CardHeader className="pb-4 relative z-10 border-b border-slate-100/50">
        <CardTitle className="text-lg font-semibold tracking-tight text-slate-800">Accounts Receivable</CardTitle>
        <CardDescription className="text-sm font-medium text-slate-500">Outstanding customer invoices</CardDescription>
      </CardHeader>
      
      <CardContent className="pt-5 relative z-10">
        <div className="mb-6 flex items-end justify-between bg-white rounded-2xl p-4 ring-1 ring-slate-100 shadow-sm shadow-slate-100/50">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Total Outstanding</div>
            <div className="text-3xl font-bold tracking-tight text-slate-900">
              {money(data.total_outstanding)}
            </div>
          </div>
          <div className="text-right flex flex-col items-end justify-end">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Collection Rate</div>
            <div className="inline-flex items-center justify-center rounded-full bg-emerald-50 px-2.5 py-1 text-sm font-bold text-emerald-600 ring-1 ring-emerald-200/50">
              {data.collection_rate}%
            </div>
          </div>
        </div>
        
        <div className="space-y-4 pt-1">
          {data.aging.map((bucket, index) => {
            const percentage = (bucket.amount / data.total_outstanding) * 100;
            // Create a gradient for each bar from a predefined set of modern colors based on index
            const colors = [
              "from-blue-400 to-blue-500 shadow-blue-500/20",
              "from-indigo-400 to-indigo-500 shadow-indigo-500/20",
              "from-violet-400 to-violet-500 shadow-violet-500/20",
              "from-amber-400 to-amber-500 shadow-amber-500/20",
              "from-rose-400 to-rose-500 shadow-rose-500/20",
            ];
            const colorClass = colors[index % colors.length];
            
            return (
              <div key={index} className="group/bar">
                <div className="mb-1.5 flex justify-between text-sm items-center">
                  <span className="font-semibold text-slate-600 group-hover/bar:text-indigo-600 transition-colors">{bucket.label}</span>
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
