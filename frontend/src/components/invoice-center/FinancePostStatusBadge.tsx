import React from 'react';
import { Badge } from '../ui/badge';
import type { InvoiceCenterFinancePostStatus } from '../../types/invoice-center';

interface Props {
  status: InvoiceCenterFinancePostStatus;
  className?: string;
}

export const FinancePostStatusBadge: React.FC<Props> = ({ status, className }) => {
  const getBadgeColor = () => {
    switch (status) {
      case 'posted': return 'bg-green-600 hover:bg-green-700 text-white';
      case 'unposted': return 'bg-gray-200 hover:bg-gray-300 text-gray-800';
      case 'failed': return 'bg-red-600 hover:bg-red-700 text-white';
      default: return 'bg-gray-200 text-gray-800';
    }
  };

  const formattedStatus = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <Badge variant="outline" className={`border-transparent ${getBadgeColor()} ${className || ''}`}>
      {formattedStatus}
    </Badge>
  );
};

export default FinancePostStatusBadge;
