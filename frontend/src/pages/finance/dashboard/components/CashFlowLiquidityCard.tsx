import { LiquiditySummary } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { money } from "../utils";

interface CashFlowLiquidityCardProps {
  data: LiquiditySummary;
}

export function CashFlowLiquidityCard({ data }: CashFlowLiquidityCardProps) {
  const isHealthy = data.liquidity_status === "Healthy";
  
  return (
    <Card className="border-gray-200 bg-white/88 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base">Cash Flow Liquidity</CardTitle>
        <Badge variant="outline" className={
          isHealthy 
            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400" 
            : "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
        }>
          {data.liquidity_status}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <div className="text-xs text-gray-500">Cash In</div>
              <div className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">{money(data.cash_in)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">Cash Out</div>
              <div className="text-sm font-semibold text-rose-600 dark:text-rose-400">{money(data.cash_out)}</div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500">Outflow Ratio</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">{data.outflow_ratio}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-slate-800">
              <div
                className={`h-full rounded-full transition-all ${
                  data.outflow_ratio > 80 ? 'bg-amber-500 dark:bg-amber-600' : 'bg-emerald-500 dark:bg-emerald-600'
                }`}
                style={{ width: `${Math.min(data.outflow_ratio, 100)}%` }}
              />
            </div>
          </div>
          
          <div className="pt-2 border-t border-gray-100 dark:border-slate-800 flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Net Surplus</span>
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100">{money(data.net_surplus)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
