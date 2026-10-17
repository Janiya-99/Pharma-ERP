import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ArrowUpRight, ChevronDown, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";
import { LiquiditySummary } from "../types";
import { formatLKR, formatCompactLKR } from "../utils";
import { useNavigate } from "react-router-dom";

interface CashFlowSummaryCardProps {
  data?: LiquiditySummary;
}

export const CashFlowSummaryCard: React.FC<CashFlowSummaryCardProps> = ({ data }) => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState("This Month");

  // Conforming numbers from Image 2
  const defaultInflow = 58934210;
  const defaultOutflow = 41720430;
  const defaultNet = 17213780;

  const cashIn = data?.cash_in ? data.cash_in : defaultInflow;
  const cashOut = data?.cash_out ? data.cash_out : defaultOutflow;
  const netCash = data?.net_surplus ? data.net_surplus : defaultNet;

  // Dual bar series across month
  const cashFlowDailyData = [
    { date: "1 Oct", Inflow: 4800000, Outflow: 3100000 },
    { date: "5 Oct", Inflow: 7200000, Outflow: 4800000 },
    { date: "10 Oct", Inflow: 11400000, Outflow: 6500000 },
    { date: "15 Oct", Inflow: 9600000, Outflow: 8200000 },
    { date: "20 Oct", Inflow: 12100000, Outflow: 7300000 },
    { date: "25 Oct", Inflow: 6800000, Outflow: 5900000 },
    { date: "30 Oct", Inflow: 7034210, Outflow: 5920430 },
  ];

  const formatYAxis = (val: number) => {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(0)}M`;
    return `${val}`;
  };

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-slate-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h2 className="text-base font-bold text-slate-900 tracking-tight">
          Cash Flow Summary
        </h2>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 cursor-pointer"
            >
              <span>{selectedPeriod}</span>
              <ChevronDown className="h-3 w-3 text-slate-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-36 rounded-xl p-1 bg-white shadow-lg border-slate-200 text-xs">
            {["This Month", "Last Month", "This Quarter"].map((p) => (
              <DropdownMenuItem
                key={p}
                onClick={() => setSelectedPeriod(p)}
                className="flex items-center justify-between rounded-lg p-2 cursor-pointer font-medium"
              >
                <span>{p}</span>
                {selectedPeriod === p && <Check className="h-3 w-3 text-indigo-600" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* 3 Metrics Mini Cards */}
      <div className="grid grid-cols-3 gap-2 pt-3 pb-2">
        {/* Cash Inflow */}
        <div
          onClick={() => navigate("/finance/reports/cash-flow")}
          className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-2.5 transition-all hover:bg-emerald-50 cursor-pointer"
        >
          <span className="text-[10px] font-semibold text-emerald-800 uppercase tracking-wider block truncate">
            Cash Inflow
          </span>
          <div className="text-sm font-bold text-slate-900 mt-1 truncate">
            {formatLKR(cashIn)}
          </div>
          <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 mt-0.5">
            <ArrowUpRight className="h-2.5 w-2.5" /> 18%
          </span>
        </div>

        {/* Cash Outflow */}
        <div
          onClick={() => navigate("/finance/reports/cash-flow")}
          className="rounded-xl border border-rose-100 bg-rose-50/40 p-2.5 transition-all hover:bg-rose-50 cursor-pointer"
        >
          <span className="text-[10px] font-semibold text-rose-800 uppercase tracking-wider block truncate">
            Cash Outflow
          </span>
          <div className="text-sm font-bold text-slate-900 mt-1 truncate">
            {formatLKR(cashOut)}
          </div>
          <span className="inline-flex items-center text-[10px] font-bold text-rose-600 mt-0.5">
            <ArrowUpRight className="h-2.5 w-2.5" /> 6%
          </span>
        </div>

        {/* Net Cash Flow */}
        <div
          onClick={() => navigate("/finance/reports/cash-flow")}
          className="rounded-xl border border-blue-100 bg-blue-50/40 p-2.5 transition-all hover:bg-blue-50 cursor-pointer"
        >
          <span className="text-[10px] font-semibold text-blue-800 uppercase tracking-wider block truncate">
            Net Cash Flow
          </span>
          <div className="text-sm font-bold text-slate-900 mt-1 truncate">
            {formatLKR(netCash)}
          </div>
          <span className="inline-flex items-center text-[10px] font-bold text-blue-600 mt-0.5">
            <ArrowUpRight className="h-2.5 w-2.5" /> 42%
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-3 text-[11px] font-medium text-slate-500 pt-1">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>Inflow</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-rose-500" />
          <span>Outflow</span>
        </span>
      </div>

      {/* Dual Bar Chart */}
      <div className="h-[140px] w-full pt-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={cashFlowDailyData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis
              dataKey="date"
              axisLine={{ stroke: "#E2E8F0" }}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#64748B" }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: "#64748B" }}
              tickFormatter={formatYAxis}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.98)",
                borderRadius: "8px",
                border: "1px solid #E2E8F0",
                fontSize: "11px",
              }}
              formatter={(val: any) => formatLKR(Number(val))}
            />
            <Bar dataKey="Inflow" fill="#10B981" radius={[3, 3, 0, 0]} maxBarSize={12} />
            <Bar dataKey="Outflow" fill="#F43F5E" radius={[3, 3, 0, 0]} maxBarSize={12} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
