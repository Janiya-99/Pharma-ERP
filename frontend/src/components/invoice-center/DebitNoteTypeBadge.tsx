import React from 'react';
import { Badge } from '../ui/badge';
import { DebitNoteType } from '../../types/invoice-center';

interface Props {
  type: DebitNoteType;
  className?: string;
}

export const DebitNoteTypeBadge: React.FC<Props> = ({ type, className }) => {
  const getBadgeColor = () => {
    switch (type) {
      case 'price_adjustment': return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'additional_charge': return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
      case 'billing_error': return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'freight_charge': return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      case 'tax_adjustment': return 'bg-teal-100 text-teal-800 hover:bg-teal-200';
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
