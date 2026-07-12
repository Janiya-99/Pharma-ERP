import { PeriodStatus } from "../types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Calendar, AlertCircle, CheckCircle2 } from "lucide-react";

interface AccountingPeriodStatusCardProps {
  data: PeriodStatus;
}

export function AccountingPeriodStatusCard({ data }: AccountingPeriodStatusCardProps) {
  const isClosingSoon = data.status === "Closing Soon";
  const isClosed = data.status === "Closed";
  
  return (
    <Card className="border-gray-200 bg-white/88 shadow-sm backdrop-blur-sm  ">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">Period Status</CardTitle>
          <CardDescription>{data.financial_year}</CardDescription>
        </div>
        <Badge variant="outline" className={
          isClosed 
            ? "bg-slate-50 text-slate-700  " 
            : isClosingSoon 
              ? "bg-amber-50 text-amber-700  "
              : "bg-emerald-50 text-emerald-700  "
        }>
          {data.status}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-50 text-blue-600  ">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900 ">{data.accounting_period}</div>
            <div className="text-xs text-gray-500">Closes on {data.closing_date}</div>
          </div>
        </div>
        
        <div className="rounded-md bg-slate-50 p-3 flex items-start gap-2 ">
          {data.posting_allowed ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5" />
          ) : (
            <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
          )}
          <div className="text-xs text-gray-700 ">
            {data.posting_allowed 
              ? "Journal posting is currently permitted for this period." 
              : "Journal posting is locked. Period is closed or restricted."}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
