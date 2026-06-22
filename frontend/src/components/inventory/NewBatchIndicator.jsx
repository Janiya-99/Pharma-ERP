import React from "react";
import { Sparkles } from "lucide-react";

const NewBatchIndicator = ({ isNew }) => {
  if (!isNew) return null;

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-brand-700 bg-brand-100 rounded-full dark:bg-brand-900/30 dark:text-brand-300">
      <Sparkles className="w-3 h-3" />
      New Batch
    </span>
  );
};

export default NewBatchIndicator;
