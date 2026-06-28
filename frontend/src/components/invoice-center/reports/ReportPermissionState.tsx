import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const ReportPermissionState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-md border shadow-sm text-center min-h-[400px]">
      <div className="h-16 w-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
        <ShieldAlert className="h-8 w-8 text-red-500" />
      </div>
      <h3 className="text-xl font-medium text-slate-900">Access Denied</h3>
      <p className="text-sm text-slate-500 mt-2 max-w-md">
        You do not have permission to view this report. Please contact your system administrator if you believe this is a mistake.
      </p>
    </div>
  );
};
