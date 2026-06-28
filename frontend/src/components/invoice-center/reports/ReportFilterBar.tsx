import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Filter, RefreshCcw } from "lucide-react";

interface ReportFilterBarProps {
  children: React.ReactNode;
  onApply: () => void;
  onReset: () => void;
  isLoading?: boolean;
}

export const ReportFilterBar: React.FC<ReportFilterBarProps> = ({
  children,
  onApply,
  onReset,
  isLoading = false,
}) => {
  return (
    <Card className="bg-white">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 w-full">
            {children}
          </div>
          <div className="flex space-x-2 shrink-0">
            <Button 
              variant="outline" 
              onClick={onReset} 
              disabled={isLoading}
              className="w-full md:w-auto"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button 
              onClick={onApply} 
              disabled={isLoading}
              className="w-full md:w-auto bg-navy-600 hover:bg-navy-700 text-white"
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
