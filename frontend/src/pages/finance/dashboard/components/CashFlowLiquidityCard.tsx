import { LiquiditySummary } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { money } from "../utils";
import { ArrowDownRight, ArrowUpRight, CheckCircle2, AlertCircle } from "lucide-react";

interface CashFlowLiquidityCardProps {
  data: LiquiditySummary;
}

export function CashFlowLiquidityCard({ data }: CashFlowLiquidityCardProps) {
  const isHealthy = data.liquidity_status === "Healthy";
  
  return (
    <Card className="rounded-3xl border-0 bg-white/70 backdrop-blur-2xl shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 overflow-hidden relative group transition-all hover:shadow-2xl hover:shadow-slate-200/60">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/40 to-teal-50/20 opacity-50 pointer-events-none" />
      
      <CardHeader className="pb-4 relative z-10 border-b border-slate-100/50 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold tracking-tight text-slate-800">Cash Flow Liquidity</CardTitle>
        <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${
          isHealthy 
            ? "bg-emerald-50 text-emerald-700 ring-emerald-200/50" 
            : "bg-amber-50 text-amber-700 ring-amber-200/50"
        }`}>
          {isHealthy ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}
          {data.liquidity_status}
        </div>
      </CardHeader>
      
      <CardContent className="pt-5 relative z-10">
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-emerald-50/50 rounded-2xl p-4 ring-1 ring-emerald-100/50">
              <div className="flex items-center gap-2 mb-2 text-emerald-600">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider">Cash In</span>
              </div>
              <div className="text-lg font-bold text-slate-900">{money(data.cash_in)}</div>
            </div>
            
            <div className="bg-rose-50/50 rounded-2xl p-4 ring-1 ring-rose-100/50">
              <div className="flex items-center gap-2 mb-2 text-rose-600">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-100">
                  <ArrowDownRight className="h-3.5 w-3.5" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider">Cash Out</span>
              </div>
              <div className="text-lg font-bold text-slate-900">{money(data.cash_out)}</div>
            </div>
          </div>
          
          <div className="bg-slate-50/50 rounded-2xl p-4 ring-1 ring-slate-100/80">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Outflow Ratio</span>
              <span className={`text-sm font-bold ${data.outflow_ratio > 80 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {data.outflow_ratio}%
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200/50 shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out shadow-sm ${
                  data.outflow_ratio > 80 ? 'bg-gradient-to-r from-amber-400 to-amber-500' : 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                }`}
                style={{ width: `${Math.min(data.outflow_ratio, 100)}%` }}
              />
            </div>
          </div>
          
          <div className="pt-2 flex justify-between items-end">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Net Surplus</span>
            <span className="text-2xl font-bold tracking-tight text-slate-900 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700">{money(data.net_surplus)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
