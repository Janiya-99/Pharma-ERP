import React from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { PageTitleCard } from '@/components/common/PageTitleCard';

interface ReportPageHeaderProps {
  title: string;
  description?: string;
  backTo?: string;
  actions?: React.ReactNode;
  icon?: any;
}

const ReportPageHeader: React.FC<ReportPageHeaderProps> = ({
  title,
  description,
  backTo = "/finance/reports",
  actions,
  icon = FileSpreadsheet,
}) => {
  return (
    <PageTitleCard
      title={title}
      description={description}
      moduleTag="Statutory Financial Intelligence"
      icon={icon}
      backTo={backTo}
      accent="emerald"
      quote={{
        text: "Audited financial transparency, real-time fiscal control, and statutory governance.",
        author: "SLFRS / LKAS Accounting Standard",
      }}
      actions={actions}
    />
  );
};

export default ReportPageHeader;
