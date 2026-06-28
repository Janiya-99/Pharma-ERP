import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import type { InvoiceCenterFinancePostingDocumentType } from '../../types/invoice-center';

interface Props {
  documentType: InvoiceCenterFinancePostingDocumentType;
}

const impactText: Record<InvoiceCenterFinancePostingDocumentType, { title: string; entries: string[] }> = {
  sales_invoice: {
    title: 'Sales Invoice Accounting Impact',
    entries: [
      'Dr  Accounts Receivable',
      'Dr  Sales Discount (if applicable)',
      'Cr  Sales Revenue',
      'Cr  Output Tax (if applicable)',
    ],
  },
  credit_note: {
    title: 'Credit Note Accounting Impact',
    entries: [
      'Dr  Credit Note Adjustment',
      'Dr  Output Tax (if applicable)',
      'Cr  Accounts Receivable',
    ],
  },
  debit_note: {
    title: 'Debit Note Accounting Impact',
    entries: [
      'Dr  Accounts Receivable',
      'Cr  Debit Note Income',
      'Cr  Output Tax (if applicable)',
    ],
  },
  customer_receipt: {
    title: 'Customer Receipt Accounting Impact',
    entries: [
      'Dr  Payment Method Account',
      'Cr  Accounts Receivable (allocated amount)',
      'Cr  Customer Advance (unallocated amount)',
    ],
  },
};

export const FinancePostingImpactCard: React.FC<Props> = ({ documentType }) => {
  const impact = impactText[documentType];
  if (!impact) return null;

  return (
    <Card className="bg-blue-50/50 border-blue-200">
      <CardHeader className="pb-2 pt-3 px-4">
        <CardTitle className="text-sm font-semibold text-blue-800">{impact.title}</CardTitle>
      </CardHeader>
      <Separator className="bg-blue-200" />
      <CardContent className="px-4 pt-3 pb-3">
        <div className="space-y-1">
          {impact.entries.map((entry, i) => (
            <p key={i} className="text-xs font-mono text-blue-700">{entry}</p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancePostingImpactCard;
