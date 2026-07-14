import { CheckCircle2, MoreHorizontal } from "lucide-react";
import { PendingApproval, RecentTransaction } from "../types";
import { money } from "../utils";
import { Badge } from "../../../../components/ui/badge";
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
  const classes: Record<string, string> = {
    Posted: "bg-emerald-50 text-emerald-700 border-emerald-200   ",
    Approved: "bg-indigo-50 text-indigo-700 border-indigo-200   ",
    Draft: "bg-slate-50 text-slate-700 border-slate-200   ",
    Pending: "bg-amber-50 text-amber-700 border-amber-200   ",
    Review: "bg-blue-50 text-blue-700 border-blue-200   ",
  };

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${classes[status] || classes.Draft}`}>
      {status}
    </span>
  );
};

export function AccountingActivityTabs({ recentTransactions, pendingApprovals }: AccountingActivityTabsProps) {
  return (
    <Card className="col-span-1 h-full rounded-2xl border-slate-200/60 bg-white/70 backdrop-blur-xl shadow-sm transition-all duration-300 hover:shadow-md ring-1 ring-inset ring-slate-900/5 lg:col-span-8  ">
      <CardHeader className="pb-0">
        <CardTitle>Accounting Activity</CardTitle>
        <CardDescription>Recent entries and pending workflow approvals</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="mb-4 bg-slate-100 ">
            <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
            <TabsTrigger value="approvals">
              Pending Approvals
              {pendingApprovals.length > 0 && (
                <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700  ">
                  {pendingApprovals.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="transactions" className="m-0 focus-visible:outline-none focus-visible:ring-0">
            <div className="rounded-md border border-gray-200 ">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 hover:bg-slate-50/50  ">
                    <TableHead>Date</TableHead>
                    <TableHead>Voucher</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Account / Entity</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.map((tx, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="whitespace-nowrap font-medium">{tx.date}</TableCell>
                      <TableCell className="text-indigo-600 ">{tx.voucher}</TableCell>
                      <TableCell>{tx.type}</TableCell>
                      <TableCell>{tx.account}</TableCell>
                      <TableCell className="text-right text-gray-600 ">
                        {tx.debit > 0 ? money(tx.debit) : "-"}
                      </TableCell>
                      <TableCell className="text-right text-gray-600 ">
                        {tx.credit > 0 ? money(tx.credit) : "-"}
                      </TableCell>
                      <TableCell>{statusBadge(tx.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="approvals" className="m-0 focus-visible:outline-none focus-visible:ring-0">
            <div className="rounded-md border border-gray-200 ">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50 hover:bg-slate-50/50  ">
                    <TableHead>Document</TableHead>
                    <TableHead>Reference</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>Stage</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingApprovals.map((app, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{app.document}</TableCell>
                      <TableCell className="text-indigo-600 ">{app.reference}</TableCell>
                      <TableCell className="text-right font-medium">{money(app.amount)}</TableCell>
                      <TableCell>{app.submitted_by}</TableCell>
                      <TableCell className="text-xs text-gray-500">{app.current_stage}</TableCell>
                      <TableCell>{statusBadge(app.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Document</DropdownMenuItem>
                            <DropdownMenuItem className="text-emerald-600 focus:bg-emerald-50 focus:text-emerald-700">
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
                      <TableCell colSpan={7} className="h-24 text-center text-gray-500">
                        No pending approvals.
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
