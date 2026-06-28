import React from "react";
import { Sparkles } from "lucide-react";

const NewBatchIndicator = ({ isNew }: { isNew?: boolean }) => {
  if (!isNew) return null;

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
      <Sparkles className="h-3 w-3" />
      New Batch
    </span>
  );
};

export default NewBatchIndicator;
