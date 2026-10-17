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

  // Realistic fallback chart data matching Image 2
  const defaultMonthlyData = [
    { period: "Jan", Revenue: 16500000, GrossProfit: 8200000, NetProfit: 4100000 },
    { period: "Feb", Revenue: 18200000, GrossProfit: 9100000, NetProfit: 4600000 },
    { period: "Mar", Revenue: 21400000, GrossProfit: 10800000, NetProfit: 5400000 },
    { period: "Apr", Revenue: 19800000, GrossProfit: 9900000, NetProfit: 4900000 },
    { period: "May", Revenue: 22600000, GrossProfit: 11400000, NetProfit: 5800000 },
    { period: "Jun", Revenue: 15900000, GrossProfit: 8000000, NetProfit: 3900000 },
    { period: "Jul", Revenue: 17800000, GrossProfit: 9000000, NetProfit: 4500000 },
    { period: "Aug", Revenue: 23100000, GrossProfit: 11900000, NetProfit: 6100000 },
    { period: "Sep", Revenue: 24800000, GrossProfit: 12600000, NetProfit: 6500000 },
    { period: "Oct", Revenue: 26200000, GrossProfit: 13400000, NetProfit: 6900000 },
  ];

  const quarterlyData = [
    { period: "Q1 FY26", Revenue: 56100000, GrossProfit: 28100000, NetProfit: 14100000 },
    { period: "Q2 FY26", Revenue: 58300000, GrossProfit: 29300000, NetProfit: 14600000 },
    { period: "Q3 FY26", Revenue: 65700000, GrossProfit: 33500000, NetProfit: 17100000 },
    { period: "Q4 (Proj)", Revenue: 72400000, GrossProfit: 36800000, NetProfit: 19200000 },
  ];

  const yearlyData = [
    { period: "2023", Revenue: 165000000, GrossProfit: 81000000, NetProfit: 38000000 },
    { period: "2024", Revenue: 198000000, GrossProfit: 99000000, NetProfit: 49000000 },
    { period: "2025", Revenue: 234000000, GrossProfit: 118000000, NetProfit: 61000000 },
    { period: "2026", Revenue: 275000000, GrossProfit: 142000000, NetProfit: 74000000 },
  ];

  // Map backend trend data if available, otherwise use defaults
  const chartData =
    period === "quarterly"
      ? quarterlyData
      : period === "yearly"
      ? yearlyData
      : data && data.length >= 4
      ? data.map((d) => ({
          period: d.period.split(" ")[0] || d.period,
          Revenue: d.Revenue || 0,
          GrossProfit: Math.round((d.Revenue || 0) * 0.52),
          NetProfit: d.Profit || Math.round((d.Revenue || 0) * 0.26),
        }))
      : defaultMonthlyData;

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
      </div>
    </div>
  );
};
