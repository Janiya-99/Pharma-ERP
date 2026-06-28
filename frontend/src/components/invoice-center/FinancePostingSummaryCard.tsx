import React from 'react';
import { Card, CardContent } from '../ui/card';
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';

interface Props {
  pendingCount?: number;
  postedCount?: number;
  settingsConfigured?: boolean;
}

export const FinancePostingSummaryCard: React.FC<Props> = ({
  pendingCount,
  postedCount,
  settingsConfigured = true,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
      <Card className="bg-amber-50 border-amber-200">
        <CardContent className="flex items-center gap-3 p-4">
          <Clock className="h-8 w-8 text-amber-600" />
          <div>
            <p className="text-xs text-amber-600 font-medium">Pending Postings</p>
            <p className="text-2xl font-bold text-amber-800">{pendingCount ?? '—'}</p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-green-50 border-green-200">
        <CardContent className="flex items-center gap-3 p-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
          <div>
            <p className="text-xs text-green-600 font-medium">Posted to Finance</p>
            <p className="text-2xl font-bold text-green-800">{postedCount ?? '—'}</p>
          </div>
        </CardContent>
      </Card>

      {!settingsConfigured && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-xs text-red-600 font-medium">Action Required</p>
              <p className="text-sm font-semibold text-red-800">Finance Settings not configured</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FinancePostingSummaryCard;
