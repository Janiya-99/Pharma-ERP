import React from "react";
import {
  MdArrowDropUp,
  MdOutlineCalendarToday,
  MdBarChart,
} from "react-icons/md";
import { Line, LineChart, XAxis, CartesianGrid } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartData = [
  { month: "SEP", revenue: 50, profit: 30 },
  { month: "OCT", revenue: 64, profit: 40 },
  { month: "NOV", revenue: 48, profit: 24 },
  { month: "DEC", revenue: 66, profit: 46 },
  { month: "JAN", revenue: 49, profit: 20 },
  { month: "FEB", revenue: 68, profit: 46 },
];

const chartConfig = {
  revenue: {
    label: "Revenue",
    color: "#003A6B",
  },
  profit: {
    label: "Profit",
    color: "#5293BB",
  },
} satisfies ChartConfig;

const TotalSpent = () => {
  return (
    <div className="glass-card flex flex-col justify-between p-5">
      <div className="mb-4 flex items-center justify-between">
        <button className="flex items-center gap-2 rounded-xl bg-blueMono-100/30 px-3.5 py-2 text-sm font-semibold text-blueMono-900 transition hover:bg-blueMono-100/50">
          <MdOutlineCalendarToday className="text-blueMono-600" />
          <span>This month</span>
        </button>
        <button className="flex items-center justify-center rounded-xl bg-blueMono-100/30 p-2 text-blueMono-700 transition hover:bg-blueMono-100/50">
          <MdBarChart className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-col items-stretch gap-5 sm:flex-row">
        <div className="flex min-w-[120px] flex-col justify-center text-left">
          <p className="text-3xl font-extrabold text-blueMono-900">$37.5K</p>
          <p className="mt-1 text-sm font-medium text-blueMono-600">
            Total Spent
          </p>
          <div className="mt-2 flex items-center gap-1">
            <MdArrowDropUp className="h-5 w-5 text-green-500" />
            <p className="text-sm font-bold text-green-500">+2.45%</p>
          </div>
        </div>
        <div className="min-h-[200px] flex-1">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <LineChart
              data={chartData}
              margin={{ left: 12, right: 12, top: 5, bottom: 5 }}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                className="stroke-blueMono-100/30"
              />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
                className="fill-blueMono-600 font-medium"
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Line
                dataKey="revenue"
                type="monotone"
                stroke="var(--color-revenue)"
                strokeWidth={3}
                dot={false}
              />
              <Line
                dataKey="profit"
                type="monotone"
                stroke="var(--color-profit)"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
};

export default TotalSpent;
