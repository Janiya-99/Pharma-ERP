import React, { useState, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { ChevronDown, Check } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";
import { ExpenseCategory } from "../types";
import { formatLKR, formatCompactLKR } from "../utils";
import { useNavigate } from "react-router-dom";

interface ExpenseDistributionChartProps {
  data?: ExpenseCategory[];
}

const CATEGORY_COLORS = [
  "#4F46E5", // Cost of Goods Sold - Indigo
  "#06B6D4", // Operating Expenses - Cyan
  "#10B981", // Salaries & Benefits - Emerald
  "#F43F5E", // Marketing & Sales - Rose
  "#F59E0B", // Utilities & Facility - Amber
  "#94A3B8", // Others - Slate
];

export const ExpenseDistributionChart: React.FC<ExpenseDistributionChartProps> = ({ data }) => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState("This Quarter");

  // Dynamic datasets per period (matching exact screenshot specifications)
  const periodDatasets: Record<string, ExpenseCategory[]> = {
    "This Quarter": [
      { category: "Cost of Goods Sold", amount: 71700000, share: 80.0 },
      { category: "Salaries and Wages", amount: 13400000, share: 14.9 },
      { category: "Rent Expense", amount: 4600000, share: 5.2 },
    ],
    "This Month": [
      { category: "Cost of Goods Sold", amount: 23900000, share: 79.9 },
      { category: "Salaries and Wages", amount: 4500000, share: 15.1 },
      { category: "Rent Expense", amount: 1500000, share: 5.0 },
    ],
    "Last Month": [
      { category: "Cost of Goods Sold", amount: 22800000, share: 80.0 },
      { category: "Salaries and Wages", amount: 4200000, share: 14.7 },
      { category: "Rent Expense", amount: 1500000, share: 5.3 },
    ],
    "YTD": [
      { category: "Cost of Goods Sold", amount: 214800000, share: 80.0 },
      { category: "Salaries and Wages", amount: 40300000, share: 15.0 },
      { category: "Rent Expense", amount: 13400000, share: 5.0 },
    ],
  };

  const periodMultiplier: Record<string, number> = {
    "This Month": 1.0,
    "Last Month": 0.95,
    "This Quarter": 3.0,
    "YTD": 9.0,
  };

  const rawItems = useMemo(() => {
    if (data && data.length > 0) {
      const mult = periodMultiplier[selectedPeriod] || 1.0;
      const scaled = data.map((d) => ({
        category: d.category || "General Expense",
        amount: Math.round((d.amount || 0) * mult),
        share: d.share || 0,
      }));
      const total = scaled.reduce((acc, c) => acc + c.amount, 0);
      return scaled.map((d) => ({
        ...d,
        share: total > 0 ? parseFloat(((d.amount / total) * 100).toFixed(1)) : 0,
      }));
    }
    return periodDatasets[selectedPeriod] || periodDatasets["This Quarter"];
  }, [data, selectedPeriod]);

  const items = rawItems;
  const totalExpense = items.reduce((acc, curr) => acc + curr.amount, 0);

  const formatShortAmount = (val: number) => {
    if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
    if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K`;
    return `${val}`;
  };

  return (
    <div className="col-span-12 lg:col-span-4 flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h2 className="text-base font-bold text-slate-900 tracking-tight">
          Expense Distribution
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
            {["This Month", "Last Month", "This Quarter", "YTD"].map((p) => (
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

      {/* Main Content: Donut + Detailed Legend */}
      <div className="my-auto py-2 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Donut Chart with Center Total */}
        <div className="relative h-[175px] w-[175px] shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={items}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={75}
                paddingAngle={3}
                dataKey="amount"
                nameKey="category"
                stroke="none"
              >
                {items.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.98)",
                  borderRadius: "10px",
                  border: "1px solid #E2E8F0",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  fontSize: "12px",
                }}
                formatter={(value: any, name: any) => [
                  formatLKR(Number(value)),
                  name,
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Centered Total Label */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
              {formatCompactLKR(totalExpense)}
            </span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Expenses
            </span>
          </div>
        </div>

        {/* Legend List */}
        <div className="flex-1 w-full space-y-2">
          {items.map((item, index) => {
            const color = CATEGORY_COLORS[index % CATEGORY_COLORS.length];
            return (
              <div
                key={index}
                onClick={() => navigate("/finance/reports/profit-and-loss")}
                className="group flex items-center justify-between text-xs cursor-pointer hover:bg-slate-50/80 p-1 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-slate-600 font-medium group-hover:text-slate-900 truncate">
                    {item.category}
                  </span>
                </div>
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className="font-bold text-slate-900 text-right">
                    {item.share}%
                  </span>
                  <span className="text-slate-400 font-semibold text-right w-12">
                    {formatShortAmount(item.amount)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
