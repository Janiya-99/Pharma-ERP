import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight } from "lucide-react";

export interface SummaryCardItem {
  title: string;
  value: string | number;
  format?: "currency" | "number" | "text";
  icon?: React.ReactNode;
  subtitle?: string;
  path?: string;
  onClick?: () => void;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

interface ReportSummaryCardsProps {
  items: SummaryCardItem[];
  isLoading?: boolean;
}

export const ReportSummaryCards: React.FC<ReportSummaryCardsProps> = ({
  items,
  isLoading = false,
}) => {
  const formatValue = (
    value: string | number,
    format?: "currency" | "number" | "text"
  ) => {
    if (format === "currency") {
      return new Intl.NumberFormat("en-LK", {
        style: "currency",
        currency: "LKR",
      }).format(Number(value));
    }
    if (format === "number") {
      return new Intl.NumberFormat("en-US").format(Number(value));
    }
    return value;
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: Math.max(items.length || 4, 4) }).map((_, i) => (
          <Card key={i} className="bg-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4 rounded-full" />
            </CardHeader>
            <CardContent>
              <Skeleton className="mb-1 h-7 w-[120px]" />
              <Skeleton className="h-3 w-[150px]" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const navigate = useNavigate();

  if (!items || items.length === 0) return null;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {items.map((item, index) => {
        const isClickable = Boolean(item.path || item.onClick);
        const handleClick = () => {
          if (item.onClick) item.onClick();
          else if (item.path) navigate(item.path);
        };

        return (
          <Card 
            key={index} 
            onClick={isClickable ? handleClick : undefined}
            className={`border border-slate-200/80 bg-white/80 backdrop-blur-md shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 rounded-2xl group ${isClickable ? 'cursor-pointer hover:border-blue-300 hover:ring-1 hover:ring-blue-100' : ''}`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-slate-500 text-sm font-medium group-hover:text-slate-800 transition-colors">
                {item.title}
              </CardTitle>
              <div className="flex items-center gap-1">
                {item.icon && <div className="text-slate-400 group-hover:text-blue-600 transition-colors">{item.icon}</div>}
                {isClickable && (
                  <ChevronRight className="h-3.5 w-3.5 text-slate-300 group-hover:text-blue-600 transition-colors" />
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-navy-900">
                {formatValue(item.value, item.format)}
              </div>
              {item.subtitle && (
                <p className="text-slate-500 mt-1 text-xs">{item.subtitle}</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
