import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../ui/button';

const ReportPageHeader = ({ title, description, backTo = "/finance/reports" }) => {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        {backTo && (
          <Button variant="outline" size="icon" onClick={() => navigate(backTo)} className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <div>
          <h1 className="text-2xl font-bold text-navy-800 dark:text-white">{title}</h1>
          {description && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>}
        </div>
      </div>
    </div>
  );
};
export default ReportPageHeader;
