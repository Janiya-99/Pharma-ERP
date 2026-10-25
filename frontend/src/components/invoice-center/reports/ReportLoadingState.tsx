import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ReportLoadingStateProps {
  type?: "table" | "cards" | "full";
  columns?: number;
  rows?: number;
  columnHeaders?: string[];
  message?: string;
}

export const ReportLoadingState: React.FC<ReportLoadingStateProps> = ({
  type = "full",
  columns = 5,
  rows = 5,
  columnHeaders,
  message = "Loading report data...",
}) => {
  if (type === "cards") {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs space-y-2">
            <Skeleton className="h-3.5 w-[90px] rounded-md" />
            <Skeleton className="h-7 w-[140px] rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  const effectiveColumns = columnHeaders?.length || columns;

  const table = (
    <div className="relative overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs">
      {/* Top animated linear progress bar */}
      <div className="h-0.5 w-full bg-slate-100 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-indigo-500 via-sky-400 to-indigo-600 animate-pulse w-full" />
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-slate-50/70 border-b border-slate-100">
            <TableRow>
              {columnHeaders
                ? columnHeaders.map((head, i) => (
                    <TableHead key={i} className="text-slate-500 text-xs uppercase tracking-wider font-semibold px-4 py-3.5">
                      {head}
                    </TableHead>
                  ))
                : Array.from({ length: effectiveColumns }).map((_, i) => (
                    <TableHead key={i} className="px-4 py-3.5">
                      <Skeleton className="h-3.5 w-full max-w-[120px] rounded-md" />
                    </TableHead>
                  ))}
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-slate-100 relative">
            {Array.from({ length: rows }).map((_, rIndex) => (
              <TableRow key={rIndex} className="hover:bg-transparent">
                {Array.from({ length: effectiveColumns }).map((_, cIndex) => (
                  <TableCell key={cIndex} className="px-4 py-3.5">
                    <Skeleton
                      className="h-3.5 rounded-md"
                      style={{
                        width: `${Math.max(45, ((rIndex + cIndex) * 23 + 45) % 85)}%`,
                      }}
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Centered Modern Floating Loading Badge */}
      <div className="absolute inset-0 top-10 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[1.5px] z-10 transition-all">
        <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/90 bg-white/95 px-5 py-3 shadow-xl ring-1 ring-slate-900/5">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-600 shrink-0" />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-slate-800">{message}</span>
            <span className="text-[11px] text-slate-400">Processing live transaction records</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (type === "table") {
    return table;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs space-y-2">
            <Skeleton className="h-3.5 w-[90px] rounded-md" />
            <Skeleton className="h-7 w-[140px] rounded-lg" />
          </div>
        ))}
      </div>
      {table}
    </div>
  );
};
