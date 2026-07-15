import { PeriodStatus } from "../types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../../components/ui/card";
import { Calendar, AlertCircle, CheckCircle2, LockKeyhole, LockOpen } from "lucide-react";

interface AccountingPeriodStatusCardProps {
  data: PeriodStatus;
}

export function AccountingPeriodStatusCard({ data }: AccountingPeriodStatusCardProps) {
  const isClosingSoon = data.status === "Closing Soon";
  const isClosed = data.status === "Closed";
  
  return (
    <Card className="rounded-3xl border-0 bg-white/70 backdrop-blur-2xl shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 overflow-hidden relative group transition-all hover:shadow-2xl hover:shadow-slate-200/60">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 to-indigo-50/20 opacity-50 pointer-events-none" />
      
      <CardHeader className="pb-4 relative z-10 border-b border-slate-100/50 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg font-semibold tracking-tight text-slate-800">Period Status</CardTitle>
          <CardDescription className="text-sm font-medium text-slate-500">{data.financial_year}</CardDescription>
        </div>
        <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${
          isClosed 
            ? "bg-slate-50 text-slate-600 ring-slate-200/50" 
            : isClosingSoon 
              ? "bg-amber-50 text-amber-600 ring-amber-200/50"
              : "bg-emerald-50 text-emerald-600 ring-emerald-200/50"
        }`}>
          {isClosed ? <LockKeyhole className="h-3.5 w-3.5" /> : <LockOpen className="h-3.5 w-3.5" />}
          {data.status}
        </div>
      </CardHeader>
      
      <CardContent className="pt-5 relative z-10 space-y-4">
        <div className="flex items-center gap-4 bg-white rounded-2xl p-4 ring-1 ring-slate-100 shadow-sm shadow-slate-100/50">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shadow-inner">
            <Calendar className="h-6 w-6" strokeWidth={2} />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-0.5">Current Period</div>
            <div className="text-base font-bold text-slate-900">{data.accounting_period}</div>
            <div className="text-xs font-medium text-slate-500 mt-0.5">Closes on {data.closing_date}</div>
          </div>
        </div>
        
        <div className={`rounded-2xl p-4 flex items-start gap-3 ring-1 ${
          data.posting_allowed 
            ? "bg-emerald-50/50 ring-emerald-100/50 text-emerald-800" 
            : "bg-amber-50/50 ring-amber-100/50 text-amber-800"
        }`}>
          {data.posting_allowed ? (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5" />
          ) : (
            <AlertCircle className="h-5 w-5 shrink-0 text-amber-500 mt-0.5" />
          )}
          <div>
            <div className="text-sm font-bold mb-1">
              {data.posting_allowed ? "Posting Permitted" : "Posting Restricted"}
            </div>
            <div className={`text-xs font-medium leading-relaxed ${data.posting_allowed ? "text-emerald-600" : "text-amber-600"}`}>
              {data.posting_allowed 
                ? "Journal entry posting is currently allowed for this accounting period." 
                : "Journal posting is locked. The period has been closed or is under restricted access."}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
