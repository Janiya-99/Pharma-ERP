import React from "react";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TopEntityItem } from "../types";
import { formatLKR } from "../utils";

interface TopCustomersReceivablesCardProps {
  customers?: TopEntityItem[];
}

export const TopCustomersReceivablesCard: React.FC<TopCustomersReceivablesCardProps> = ({
  customers,
}) => {
  const navigate = useNavigate();

  // Conforming list from Image 2
  const list = customers || [];
  const maxVal = list.length > 0 ? Math.max(...list.map((c) => c.amount), 1) : 1;

  const handleNavigate = () => {
    navigate("/invoice-center/reports/customer-aging");
  };

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-slate-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h2 className="text-base font-bold text-slate-900 tracking-tight">
          Top Customers by Receivables
        </h2>
        <button
          type="button"
          onClick={handleNavigate}
          className="group inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer transition-colors"
        >
          <span>View All</span>
          <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* List */}
      <div className="space-y-3.5 pt-3">
        {list.length === 0 ? (
          <div className="py-6 text-center text-xs font-medium text-slate-400">
            No customers currently have outstanding balances.
          </div>
        ) : (
          list.map((item, idx) => {
            const progress = Math.min(Math.round((item.amount / maxVal) * 100), 100);
            return (
              <div
                key={idx}
                onClick={handleNavigate}
                className="group cursor-pointer rounded-lg p-1 transition-colors hover:bg-slate-50/70"
              >
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700 group-hover:text-blue-600 transition-colors truncate pr-2">
                    {item.name}
                  </span>
                  <span className="text-slate-900 font-bold tabular-nums shrink-0">
                    {formatLKR(item.amount).replace("LKR ", "")}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-500 transition-all duration-500"
                    style={{ width: `${Math.max(progress, 8)}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
