import { ArrowDownRight, ArrowUpRight } from "lucide-react";

const AdjustmentDirectionBadge = ({ direction }: { direction?: unknown }) => {
  if (direction === "in") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200   ">
        <ArrowUpRight className="w-3 h-3" />
        In
      </span>
    );
  }

  if (direction === "out") {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-red-50 text-red-700 border border-red-200   ">
        <ArrowDownRight className="w-3 h-3" />
        Out
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200   ">
      Unknown
    </span>
  );
};

export default AdjustmentDirectionBadge;
