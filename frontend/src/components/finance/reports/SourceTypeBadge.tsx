import React from 'react';

const formatSourceType = (type?: string) => {
  if (!type) return 'Other';
  const clean = String(type).toLowerCase().replace(/_/g, ' ');
  return clean.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
};

interface SourceTypeBadgeProps {
  type?: string;
}

const SourceTypeBadge: React.FC<SourceTypeBadgeProps> = ({ type }) => {
  const normType = String(type || '').toLowerCase().trim();

  let colorClass = "bg-slate-100 text-slate-700 border-slate-200";

  if (normType.includes("journal")) {
    colorClass = "bg-indigo-50 text-indigo-700 border-indigo-200/80";
  } else if (normType.includes("payment")) {
    colorClass = "bg-rose-50 text-rose-700 border-rose-200/80";
  } else if (normType.includes("receipt")) {
    colorClass = "bg-emerald-50 text-emerald-700 border-emerald-200/80";
  } else if (normType.includes("petty")) {
    colorClass = "bg-amber-50 text-amber-700 border-amber-200/80";
  } else if (normType.includes("opening")) {
    colorClass = "bg-purple-50 text-purple-700 border-purple-200/80";
  } else if (normType.includes("depreciation") || normType.includes("fixed_asset")) {
    colorClass = "bg-blue-50 text-blue-700 border-blue-200/80";
  } else if (normType.includes("inventory") || normType.includes("adjustment")) {
    colorClass = "bg-teal-50 text-teal-700 border-teal-200/80";
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border whitespace-nowrap shadow-2xs ${colorClass}`}>
      {formatSourceType(type)}
    </span>
  );
};

export default SourceTypeBadge;
