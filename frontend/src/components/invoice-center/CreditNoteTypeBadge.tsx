import React from 'react';
import { Badge } from '../ui/badge';
import { CreditNoteType } from '../../types/invoice-center';

interface Props {
  type: CreditNoteType;
  className?: string;
}

export const CreditNoteTypeBadge: React.FC<Props> = ({ type, className }) => {
  const getBadgeColor = () => {
    switch (type) {
      case 'sales_return': return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'price_adjustment': return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'discount_adjustment': return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      case 'billing_error': return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
      case 'goodwill': return 'bg-teal-100 text-teal-800 hover:bg-teal-200';
      case 'other': return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formattedType = type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <Badge variant="outline" className={`border-transparent ${getBadgeColor()} ${className || ''}`}>
      {formattedType}
    </Badge>
  );
};
