import React from "react";
import { Star } from "lucide-react";

interface PrimaryContactBadgeProps {
  isPrimary?: boolean;
}

const PrimaryContactBadge: React.FC<PrimaryContactBadgeProps> = ({
  isPrimary,
}) => {
  if (!isPrimary) return null;

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
      Primary Contact
    </span>
  );
};

export default PrimaryContactBadge;
