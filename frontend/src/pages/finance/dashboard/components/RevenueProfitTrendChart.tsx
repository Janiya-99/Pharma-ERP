import React, { useState } from "react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TrendPoint } from "../types";
import { formatLKR } from "../utils";

interface RevenueProfitTrendChartProps {
  data?: TrendPoint[];
}

export const RevenueProfitTrendChart: React.FC<RevenueProfitTrendChartProps> = ({ data }) => {
  const [period, setPeriod] = useState<"monthly" | "quarterly" | "yearly">("monthly");

  // Map live backend trend data directly without hardcoded mock fallbacks
  const chartData = (data && data.length > 0)
    ? data.map((d) => ({
        period: d.period.split(" ")[0] || d.period,
        Revenue: d.Revenue || 0,
        GrossProfit: (d.Revenue || 0) - (d.Expenses || 0),
        NetProfit: d.Profit ?? ((d.Revenue || 0) - (d.Expenses || 0)),
      }))
    : [];

  const formatYAxis = (val: number) => {
    if (val >= 1_000_000) return `LKR ${(val / 1_000_000).toFixed(0)}M`;
    if (val >= 1_000) return `LKR ${(val / 1_000).toFixed(0)}K`;
    return `LKR ${val}`;
  };

  return (
    <div className="col-span-12 lg:col-span-8 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all">
      {/* Header with Title, Legend & Period Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Revenue & Profitability Trend
          </h2>
          <div className="mt-1 flex items-center gap-4 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-400" />
              <span>Revenue</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-purple-500" />
              <span>Gross Profit</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span>Net Profit</span>
            </span>
          </div>
        </div>

        {/* Period Pills */}
        <div className="flex items-center rounded-xl bg-slate-100/90 p-1 text-xs font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => setPeriod("monthly")}
            className={`rounded-lg px-3 py-1.5 transition-all cursor-pointer ${
              period === "monthly"
                ? "bg-indigo-600 text-white shadow-xs font-bold"
                : "hover:text-slate-900"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setPeriod("quarterly")}
            className={`rounded-lg px-3 py-1.5 transition-all cursor-pointer ${
              period === "quarterly"
                ? "bg-indigo-600 text-white shadow-xs font-bold"
                : "hover:text-slate-900"
            }`}
          >
            Quarterly
          </button>
          <button
            type="button"
            onClick={() => setPeriod("yearly")}
            className={`rounded-lg px-3 py-1.5 transition-all cursor-pointer ${
              period === "yearly"
                ? "bg-indigo-600 text-white shadow-xs font-bold"
                : "hover:text-slate-900"
            }`}
          >
            Yearly
          </button>
        </div>
      </div>

      {/* Composed Chart */}
      <div className="h-[290px] w-full pt-4">
        {chartData.length === 0 ? (
          <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 text-xs">
            <p className="font-semibold text-slate-600">No Revenue & Profit Trend Recorded</p>
            <p className="text-[11px] text-slate-400 mt-1">Ledger will dynamically chart financial movements as transactions are posted.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
            <XAxis
              dataKey="period"
              axisLine={{ stroke: "#E2E8F0" }}
              tickLine={false}
              tick={{ fontSize: 12, fill: "#64748B", fontWeight: 500 }}
              dy={8}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: "#64748B" }}
              tickFormatter={formatYAxis}
              width={75}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.98)",
                borderRadius: "12px",
                border: "1px solid #E2E8F0",
                boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                padding: "10px 14px",
              }}
              formatter={(val: any, name: any) => [
                <span className="font-bold text-slate-900">{formatLKR(Number(val))}</span>,
                name === "Revenue"
                  ? "Gross Revenue"
                  : name === "GrossProfit"
                  ? "Gross Profit"
                  : "Net Profit",
              ]}
            />
            <Bar
              dataKey="Revenue"
              name="Revenue"
              fill="#818CF8"
              radius={[5, 5, 0, 0]}
              maxBarSize={36}
              fillOpacity={0.7}
            />
            <Line
              type="monotone"
              dataKey="GrossProfit"
              name="GrossProfit"
              stroke="#8B5CF6"
              strokeWidth={2.8}
              dot={{ r: 3.5, fill: "#8B5CF6", strokeWidth: 2, stroke: "#FFFFFF" }}
              activeDot={{ r: 6, fill: "#8B5CF6" }}
            />
            <Line
              type="monotone"
              dataKey="NetProfit"
              name="NetProfit"
              stroke="#10B981"
              strokeWidth={2.8}
              dot={{ r: 3.5, fill: "#10B981", strokeWidth: 2, stroke: "#FFFFFF" }}
              activeDot={{ r: 6, fill: "#10B981" }}
            />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
