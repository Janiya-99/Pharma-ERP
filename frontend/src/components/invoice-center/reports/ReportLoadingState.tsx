import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ReportLoadingStateProps {
  type?: 'table' | 'cards' | 'full';
  columns?: number;
  rows?: number;
}

export const ReportLoadingState: React.FC<ReportLoadingStateProps> = ({
  type = 'full',
  columns = 5,
  rows = 5,
}) => {
  if (type === 'cards') {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 bg-white rounded-md border shadow-sm">
            <Skeleton className="h-4 w-[100px] mb-4" />
            <Skeleton className="h-8 w-[150px]" />
          </div>
        ))}
      </div>
    );
  }

  const table = (
    <div className="rounded-md border bg-white overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            {Array.from({ length: columns }).map((_, i) => (
              <TableHead key={i}>
                <Skeleton className="h-4 w-full max-w-[150px]" />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, rIndex) => (
            <TableRow key={rIndex}>
              {Array.from({ length: columns }).map((_, cIndex) => (
                <TableCell key={cIndex}>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  if (type === 'table') {
    return table;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 bg-white rounded-md border shadow-sm">
            <Skeleton className="h-4 w-[100px] mb-4" />
            <Skeleton className="h-8 w-[150px]" />
          </div>
        ))}
      </div>
      {table}
    </div>
  );
};
