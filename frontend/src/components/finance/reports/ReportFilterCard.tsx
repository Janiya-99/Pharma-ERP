import React from "react";
import { Card, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { Filter, X } from "lucide-react";

const ReportFilterCard = ({
  children,
  onApply,
  onClear,
  isLoading,
}: {
  children?: React.ReactNode;
  onApply?: unknown;
  onClear?: unknown;
  isLoading?: boolean;
}) => {
  return (
    <Card className="mb-6 border-gray-200 shadow-sm dark:border-navy-700 print:hidden">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 items-end gap-4 md:grid-cols-2 lg:grid-cols-4">
          {children}
          <div className="mt-2 flex justify-end gap-2 lg:col-span-full">
            <Button variant="outline" onClick={onClear} disabled={isLoading}>
              <X className="mr-2 h-4 w-4" />
              Clear Filters
            </Button>
            <Button
              onClick={onApply}
              disabled={isLoading}
              className="bg-brand-600 text-white hover:bg-brand-700"
            >
              <Filter className="mr-2 h-4 w-4" />
              Apply Filters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
export default ReportFilterCard;
