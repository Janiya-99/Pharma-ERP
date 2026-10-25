import React from 'react';
import ReportActions, { ReportActionsProps } from './ReportActions';

export interface ReportToolbarProps extends ReportActionsProps {
  isRefreshing?: boolean;
}

const ReportToolbar: React.FC<ReportToolbarProps> = ({
  isRefreshing,
  loading,
  className = "",
  ...props
}) => {
  return (
    <div className={`mb-4 print:hidden ${className}`}>
      <ReportActions loading={loading ?? isRefreshing} {...props} />
    </div>
  );
};

export default ReportToolbar;
