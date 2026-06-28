import React from 'react';
import { Badge } from '../ui/badge';
import { CustomerReceiptPaymentMethod } from '../../types/invoice-center';

interface Props {
  method: CustomerReceiptPaymentMethod;
  className?: string;
}

export const CustomerReceiptPaymentMethodBadge: React.FC<Props> = ({ method, className }) => {
  const getBadgeColor = () => {
    switch (method) {
      case 'cash': return 'bg-green-100 text-green-800 border-green-200';
      case 'bank_transfer': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cheque': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'card': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'online': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'other': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formattedMethod = method.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <Badge variant="outline" className={`${getBadgeColor()} ${className || ''}`}>
      {formattedMethod}
    </Badge>
  );
};
