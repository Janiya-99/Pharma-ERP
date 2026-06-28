import React from "react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertTriangle } from "lucide-react";

interface WarningItem {
  field: string;
  message: string;
}

interface Props {
  warnings: WarningItem[];
}

export const FinanceSettingsWarningCard: React.FC<Props> = ({ warnings }) => {
  if (warnings.length === 0) return null;

  return (
    <Alert variant="destructive" className="border-amber-200 bg-amber-50">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-sm font-semibold text-amber-800">
        Missing Optional Account Mappings
      </AlertTitle>
      <AlertDescription>
        <ul className="mt-1.5 space-y-1">
          {warnings.map((w, i) => (
            <li
              key={i}
              className="flex items-start gap-1.5 text-xs text-amber-700"
            >
              <span className="mt-0.5 shrink-0">•</span>
              <span>
                <strong>{w.field}:</strong> {w.message}
              </span>
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
};

export default FinanceSettingsWarningCard;
