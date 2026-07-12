import { ReceivablesSummary } from "../types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../../components/ui/card";
import { money } from "../utils";

interface ReceivablesAgingCardProps {
  data: ReceivablesSummary;
}

export function ReceivablesAgingCard({ data }: ReceivablesAgingCardProps) {
  return (
    <Card className="border-gray-200 bg-white/88 shadow-sm backdrop-blur-sm  ">
      <CardHeader className="pb-3">
        <CardTitle>Accounts Receivable</CardTitle>
        <CardDescription>Outstanding customer invoices</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 ">Total Outstanding</div>
            <div className="text-2xl font-bold text-gray-900 ">
              {money(data.total_outstanding)}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500 ">Collection Rate</div>
            <div className="text-xl font-semibold text-emerald-600 ">
              {data.collection_rate}%
            </div>
          </div>
        </div>
        
        <div className="space-y-3 pt-2">
          {data.aging.map((bucket, index) => {
            const percentage = (bucket.amount / data.total_outstanding) * 100;
            return (
              <div key={index}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium text-gray-700 ">{bucket.label}</span>
                  <span className="text-gray-900 ">{money(bucket.amount)}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 ">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all "
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
