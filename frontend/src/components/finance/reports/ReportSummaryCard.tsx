import React from 'react';
import { Card, CardContent } from '../../ui/card';

const ReportSummaryCard = ({ title, amount, className = "" }: { title?: unknown; amount?: unknown; className?: unknown }) => {
  return (
    <Card className={`border-gray-200 dark:border-navy-700 shadow-sm ${className}`}>
      <CardContent className="p-4 flex flex-col justify-center">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</h3>
        <p className="text-xl font-bold text-navy-800 dark:text-white">
          {amount === undefined || amount === null ? "-" : new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(amount)}
        </p>
      </CardContent>
    </Card>
  );
};
export default ReportSummaryCard;
