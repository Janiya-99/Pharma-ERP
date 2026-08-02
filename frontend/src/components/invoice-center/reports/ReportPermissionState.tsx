import React from "react";
import { ShieldAlert } from "lucide-react";

export const ReportPermissionState: React.FC = () => {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-md border bg-white p-12 text-center shadow-sm">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
        <ShieldAlert className="h-8 w-8 text-red-500" />
      </div>
      <h3 className="text-slate-900 text-xl font-medium">Access Denied</h3>
      <p className="text-slate-500 mt-2 max-w-md text-sm">
        You do not have permission to view this report. Please contact your
        system administrator if you believe this is a mistake.
      </p>
    </div>
  );
};
