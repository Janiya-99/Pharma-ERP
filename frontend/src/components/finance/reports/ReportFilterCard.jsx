import React from 'react';
import { Card, CardContent } from '../../ui/card';
import { Button } from '../../ui/button';
import { Filter, X } from 'lucide-react';

const ReportFilterCard = ({ children, onApply, onClear, isLoading }) => {
  return (
    <Card className="mb-6 border-gray-200 dark:border-navy-700 shadow-sm print:hidden">
      <CardContent className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {children}
          <div className="flex gap-2 lg:col-span-full justify-end mt-2">
            <Button variant="outline" onClick={onClear} disabled={isLoading}>
              <X className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
            <Button onClick={onApply} disabled={isLoading} className="bg-brand-600 hover:bg-brand-700 text-white">
              <Filter className="w-4 h-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
export default ReportFilterCard;
