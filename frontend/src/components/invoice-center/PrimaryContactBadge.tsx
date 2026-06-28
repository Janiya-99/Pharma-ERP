import React from "react";
import { Star } from "lucide-react";

interface PrimaryContactBadgeProps {
  isPrimary?: boolean;
}

const PrimaryContactBadge: React.FC<PrimaryContactBadgeProps> = ({ isPrimary }) => {
  if (!isPrimary) return null;

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">
      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
      Primary Contact
    </span>
  );
};

export default PrimaryContactBadge;
