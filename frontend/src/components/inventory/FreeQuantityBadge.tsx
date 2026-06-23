import React from "react";
import { Gift } from "lucide-react";

const FreeQuantityBadge = ({ quantity }: { quantity?: unknown }) => {
  if (!quantity || quantity <= 0) return null;

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-blue-700 bg-blue-100 rounded-full dark:bg-blue-900/30 dark:text-blue-300">
      <Gift className="w-3 h-3" />
      Free
    </span>
  );
};

export default FreeQuantityBadge;
