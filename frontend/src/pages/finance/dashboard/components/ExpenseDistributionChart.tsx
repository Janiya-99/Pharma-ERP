import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { ExpenseCategory } from "../types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../../components/ui/card";
import { money } from "../utils";

interface ExpenseDistributionChartProps {
  data: ExpenseCategory[];
}

const COLORS = ["#4F46E5", "#0F766E", "#16A34A", "#D97706", "#6B7280", "#DC2626"];

export function ExpenseDistributionChart({ data }: ExpenseDistributionChartProps) {
  return (
    <Card className="col-span-1 rounded-2xl border-slate-100 bg-white shadow-lg transition-all duration-300 hover:shadow-xl ring-1 ring-inset ring-slate-50 lg:col-span-4  ">
      <CardHeader className="pb-2">
        <CardTitle>Expense Distribution</CardTitle>
        <CardDescription>Breakdown of operating costs</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex h-[200px] items-center justify-center pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="amount"
                nameKey="category"
                stroke="none"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  borderRadius: "8px",
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                itemStyle={{ fontSize: "14px", fontWeight: 500 }}
                formatter={(value: number, name: string) => [money(value), name]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex flex-col gap-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-gray-600 ">{item.category}</span>
              </div>
              <div className="flex gap-4 font-medium">
                <span className="text-gray-900 ">{money(item.amount)}</span>
                <span className="w-10 text-right text-gray-500">{item.share}%</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
