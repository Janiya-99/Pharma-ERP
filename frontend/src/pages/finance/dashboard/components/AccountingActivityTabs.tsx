import { CheckCircle2, MoreHorizontal, Activity, ArrowRightLeft } from "lucide-react";
import { PendingApproval, RecentTransaction } from "../types";
import { money } from "../utils";
import { Button } from "../../../../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../../../components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../components/ui/tabs";

interface AccountingActivityTabsProps {
  recentTransactions: RecentTransaction[];
  pendingApprovals: PendingApproval[];
}

const statusBadge = (status: string) => {
  const isPositive = status === "Posted" || status === "Approved";
  const isWarning = status === "Pending" || status === "Review";
  
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${
      isPositive 
        ? "bg-emerald-50 text-emerald-700 ring-emerald-200/50" 
        : isWarning
          ? "bg-amber-50 text-amber-700 ring-amber-200/50"
          : "bg-slate-50 text-slate-700 ring-slate-200/50"
    }`}>
      {isPositive && <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
      {isWarning && <div className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />}
      {!isPositive && !isWarning && <div className="h-1.5 w-1.5 rounded-full bg-slate-400" />}
      {status}
    </span>
  );
};

export function AccountingActivityTabs({ recentTransactions, pendingApprovals }: AccountingActivityTabsProps) {
  return (
    <Card className="col-span-1 h-full rounded-3xl border-0 bg-white/70 backdrop-blur-2xl shadow-xl shadow-slate-200/40 ring-1 ring-slate-100 overflow-hidden relative group/card transition-all hover:shadow-2xl hover:shadow-slate-200/60 lg:col-span-8">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/20 to-purple-50/10 opacity-50 pointer-events-none" />
      
      <CardHeader className="pb-4 relative z-10 border-b border-slate-100/50 flex flex-row items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 shadow-inner ring-1 ring-indigo-100/50">
            <Activity className="h-6 w-6" strokeWidth={2} />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold tracking-tight text-slate-800">Accounting Activity</CardTitle>
            <CardDescription className="text-sm font-medium text-slate-500">Recent entries and pending workflow approvals</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 relative z-10">
        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="mb-6 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/50 shadow-inner">
            <TabsTrigger value="transactions" className="rounded-lg px-6 py-2 data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm transition-all">
              <ArrowRightLeft className="w-4 h-4 mr-2 opacity-70" />
              Recent Transactions
            </TabsTrigger>
            <TabsTrigger value="approvals" className="rounded-lg px-6 py-2 data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm transition-all">
              <CheckCircle2 className="w-4 h-4 mr-2 opacity-70" />
              Pending Approvals
              {pendingApprovals.length > 0 && (
                <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700 ring-1 ring-amber-200/50">
                  {pendingApprovals.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="transactions" className="m-0 focus-visible:outline-none focus-visible:ring-0">
            <div className="rounded-2xl border border-slate-100 bg-white/50 overflow-hidden ring-1 ring-slate-900/5">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 border-b-slate-100">
                    <TableHead className="font-semibold text-slate-600 h-12">Date</TableHead>
                    <TableHead className="font-semibold text-slate-600 h-12">Voucher</TableHead>
                    <TableHead className="font-semibold text-slate-600 h-12">Type</TableHead>
                    <TableHead className="font-semibold text-slate-600 h-12">Account / Entity</TableHead>
                    <TableHead className="font-semibold text-slate-600 h-12 text-right">Debit</TableHead>
                    <TableHead className="font-semibold text-slate-600 h-12 text-right">Credit</TableHead>
                    <TableHead className="font-semibold text-slate-600 h-12">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.map((tx, idx) => (
                    <TableRow key={idx} className="hover:bg-slate-50/50 transition-colors border-b-slate-50">
                      <TableCell className="whitespace-nowrap font-medium text-slate-700 py-3">{tx.date}</TableCell>
                      <TableCell className="font-semibold text-indigo-600 py-3">{tx.voucher}</TableCell>
                      <TableCell className="text-slate-600 py-3">{tx.type}</TableCell>
                      <TableCell className="font-medium text-slate-700 py-3">{tx.account}</TableCell>
                      <TableCell className="text-right font-medium text-slate-700 py-3 tabular-nums">
                        {tx.debit > 0 ? money(tx.debit) : "-"}
                      </TableCell>
                      <TableCell className="text-right font-medium text-slate-700 py-3 tabular-nums">
                        {tx.credit > 0 ? money(tx.credit) : "-"}
                      </TableCell>
                      <TableCell className="py-3">{statusBadge(tx.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="approvals" className="m-0 focus-visible:outline-none focus-visible:ring-0">
            <div className="rounded-2xl border border-slate-100 bg-white/50 overflow-hidden ring-1 ring-slate-900/5">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/80 hover:bg-slate-50/80 border-b-slate-100">
                    <TableHead className="font-semibold text-slate-600 h-12">Document</TableHead>
                    <TableHead className="font-semibold text-slate-600 h-12">Reference</TableHead>
                    <TableHead className="font-semibold text-slate-600 h-12 text-right">Amount</TableHead>
                    <TableHead className="font-semibold text-slate-600 h-12">Submitted By</TableHead>
                    <TableHead className="font-semibold text-slate-600 h-12">Stage</TableHead>
                    <TableHead className="font-semibold text-slate-600 h-12">Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingApprovals.map((app, idx) => (
                    <TableRow key={idx} className="hover:bg-slate-50/50 transition-colors border-b-slate-50">
                      <TableCell className="font-medium text-slate-700 py-3">{app.document}</TableCell>
                      <TableCell className="font-semibold text-indigo-600 py-3">{app.reference}</TableCell>
                      <TableCell className="text-right font-bold text-slate-800 py-3 tabular-nums">{money(app.amount)}</TableCell>
                      <TableCell className="text-slate-600 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600">
                            {app.submitted_by.charAt(0)}
                          </div>
                          {app.submitted_by}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-medium text-slate-500 py-3 uppercase tracking-wider">{app.current_stage}</TableCell>
                      <TableCell className="py-3">{statusBadge(app.status)}</TableCell>
                      <TableCell className="py-3">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl shadow-xl ring-1 ring-slate-900/5">
                            <DropdownMenuItem className="cursor-pointer rounded-lg hover:bg-slate-50 transition-colors">
                              View Document
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer rounded-lg text-emerald-600 focus:bg-emerald-50 focus:text-emerald-700 transition-colors mt-1">
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Approve
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {pendingApprovals.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-500">
                          <CheckCircle2 className="h-8 w-8 text-emerald-400 mb-2" />
                          <p className="font-medium">All caught up!</p>
                          <p className="text-sm">No pending approvals require your attention.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
