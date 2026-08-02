import React from "react";
import { Card, CardContent } from "../ui/card";
import { AlertTriangle, Clock, CheckCircle } from "lucide-react";

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
    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="flex items-center gap-3 p-4">
          <Clock className="h-8 w-8 text-amber-600" />
          <div>
            <p className="text-xs font-medium text-amber-600">
              Pending Postings
            </p>
            <p className="text-2xl font-bold text-amber-800">
              {pendingCount ?? "—"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-green-200 bg-green-50">
        <CardContent className="flex items-center gap-3 p-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
          <div>
            <p className="text-xs font-medium text-green-600">
              Posted to Finance
            </p>
            <p className="text-2xl font-bold text-green-800">
              {postedCount ?? "—"}
            </p>
          </div>
        </CardContent>
      </Card>

      {!settingsConfigured && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
            <div>
              <p className="text-xs font-medium text-red-600">
                Action Required
              </p>
              <p className="text-sm font-semibold text-red-800">
                Finance Settings not configured
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FinancePostingSummaryCard;
