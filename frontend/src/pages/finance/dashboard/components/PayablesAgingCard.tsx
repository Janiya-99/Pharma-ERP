import { PayablesSummary } from "../types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../../components/ui/card";
import { money } from "../utils";

interface PayablesAgingCardProps {
  data: PayablesSummary;
}

export function PayablesAgingCard({ data }: PayablesAgingCardProps) {
  return (
    <Card className="border-gray-200 bg-white/88 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
      <CardHeader className="pb-3">
        <CardTitle>Accounts Payable</CardTitle>
        <CardDescription>Outstanding supplier bills</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Total Payable</div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {money(data.total_payable)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 dark:text-gray-400">Due/Overdue</div>
            <div className="text-xl font-semibold text-amber-600 dark:text-amber-400">
              {data.payment_due_count} bills
            </div>
          </div>
        </div>
        
        <div className="space-y-3 pt-2">
          {data.aging.map((bucket, index) => {
            const percentage = (bucket.amount / data.total_payable) * 100;
            return (
              <div key={index}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300">{bucket.label}</span>
                  <span className="text-gray-900 dark:text-gray-100">{money(bucket.amount)}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-amber-500 transition-all dark:bg-amber-600"
                    style={{ width: `${percentage}%` }}
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
