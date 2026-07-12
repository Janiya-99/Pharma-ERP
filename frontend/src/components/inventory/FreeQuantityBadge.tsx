import { Gift } from "lucide-react";

const FreeQuantityBadge = ({ quantity }: { quantity?: unknown }) => {
  if (!quantity || quantity <= 0) return null;

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold text-indigo-700 bg-indigo-100 rounded-full  ">
      <Gift className="w-3 h-3" />
      Free
    </span>
  );
};

export default FreeQuantityBadge;
