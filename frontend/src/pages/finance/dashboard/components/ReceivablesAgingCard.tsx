import React from "react";
import { ArrowUpRight, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ReceivablesSummary } from "../types";
import { formatLKR } from "../utils";

interface ReceivablesAgingCardProps {
  data?: ReceivablesSummary;
}

export const ReceivablesAgingCard: React.FC<ReceivablesAgingCardProps> = ({ data }) => {
  const navigate = useNavigate();

  // Conforming default data from Image 2
  const defaultTotal = 43934760;
  const defaultBuckets = [
    { label: "Current (0-30 days)", amount: 24120000, share: 55, color: "#3B82F6" },
    { label: "31 - 60 days", amount: 9842120, share: 22, color: "#06B6D4" },
    { label: "61 - 90 days", amount: 5271430, share: 12, color: "#F59E0B" },
    { label: "91 - 120 days", amount: 2934850, share: 7, color: "#8B5CF6" },
    { label: "> 120 days", amount: 1766360, share: 4, color: "#EF4444" },
  ];

  const totalOutstanding = data?.total_outstanding ? data.total_outstanding : defaultTotal;

  // Process data if provided by backend, otherwise use exact Image 2 buckets
  const buckets =
    data && data.aging && data.aging.length > 0 && data.total_outstanding > 0
      ? [
          {
            label: "Current (0-30 days)",
            amount: data.aging[0]?.amount || 0,
            share: Math.round(((data.aging[0]?.amount || 0) / data.total_outstanding) * 100),
            color: "#3B82F6",
          },
          {
            label: "31 - 60 days",
            amount: data.aging[1]?.amount || 0,
            share: Math.round(((data.aging[1]?.amount || 0) / data.total_outstanding) * 100),
            color: "#06B6D4",
          },
          {
            label: "61 - 90 days",
            amount: data.aging[2]?.amount || 0,
            share: Math.round(((data.aging[2]?.amount || 0) / data.total_outstanding) * 100),
            color: "#F59E0B",
          },
          {
            label: "91 - 120 days",
            amount: data.aging[3]?.amount || 0,
            share: Math.round(((data.aging[3]?.amount || 0) / data.total_outstanding) * 100),
            color: "#8B5CF6",
          },
          {
            label: "> 120 days",
            amount: data.aging[4]?.amount || 0,
            share: Math.round(((data.aging[4]?.amount || 0) / data.total_outstanding) * 100),
            color: "#EF4444",
          },
        ]
      : defaultBuckets;

  const handleNavigate = () => {
    navigate("/invoice-center/reports/customer-aging");
  };

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-slate-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h2 className="text-base font-bold text-slate-900 tracking-tight">
          Accounts Receivable
        </h2>
        <button
          type="button"
          onClick={handleNavigate}
          className="group inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer transition-colors"
        >
          <span>View Details</span>
          <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Main Metric */}
      <div className="pt-3 pb-1">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            {formatLKR(totalOutstanding)}
          </span>
          <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-600 border border-emerald-100">
            <ArrowUpRight className="h-3 w-3 stroke-[2.5]" />
            12%
          </span>
        </div>
        <p className="mt-0.5 text-xs text-slate-500 font-medium">
          Outstanding customer balances
        </p>
      </div>

      {/* Stacked Segmented Progress Bar */}
      <div className="my-3.5 flex h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        {buckets.map((b, i) => (
          <div
            key={i}
            style={{
              width: `${Math.max(b.share, 2)}%`,
              backgroundColor: b.color,
            }}
            className="h-full transition-all duration-500"
            title={`${b.label}: ${b.share}%`}
          />
        ))}
      </div>

      {/* Buckets List */}
      <div className="space-y-2 pt-1">
        {buckets.map((b, i) => (
          <div
            key={i}
            onClick={handleNavigate}
            className="group flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50/70 p-1 rounded-lg transition-colors"
          >
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: b.color }}
              />
              <span className="text-slate-600 font-medium group-hover:text-slate-900">
                {b.label}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-slate-800">
                {formatLKR(b.amount).replace("LKR ", "")}
              </span>
              <span className="w-8 text-right font-medium text-slate-400">
                {b.share}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
