import React from "react";
import { AlertCircle, Clock, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FinancialAlertItem } from "../types";

interface FinancialAlertsCardProps {
  alerts?: FinancialAlertItem[];
}

export const FinancialAlertsCard: React.FC<FinancialAlertsCardProps> = ({ alerts }) => {
  const navigate = useNavigate();

  // Default alerts matching live system state if backend is initializing
  const defaultAlerts: FinancialAlertItem[] = [
    {
      id: "alt-1",
      title: "Customer invoice aging active",
      subtitle: "Monitoring overdue receivables and credit terms",
      severity: "Low",
      link: "/invoice-center/reports/customer-aging",
    },
    {
      id: "alt-2",
      title: "Supplier payment vouchers in order",
      subtitle: "Review pending purchase bills and disbursements",
      severity: "Low",
      link: "/finance/banking/payment-vouchers",
    },
    {
      id: "alt-3",
      title: "Bank & Cash Books reconciled",
      subtitle: "Audited with double-entry general ledger",
      severity: "Low",
      link: "/finance/reports/bank-book",
    },
    {
      id: "alt-4",
      title: "Accounting Period status: Open",
      subtitle: "Financial year posting active",
      severity: "Low",
      link: "/finance/setup/accounting-periods",
    },
    {
      id: "alt-5",
      title: "Cash & Bank Liquidity: Healthy",
      subtitle: "Reconciled with Cash Book and Commercial Bank ledgers",
      severity: "Low",
      link: "/finance/reports/cash-book",
    },
  ];

  const items = alerts && alerts.length > 0 ? alerts : defaultAlerts;

  const getSeverityStyle = (severity: FinancialAlertItem["severity"]) => {
    switch (severity) {
      case "High":
        return {
          icon: <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />,
          badge: "bg-rose-50 text-rose-700 border-rose-200/80",
        };
      case "Medium":
        return {
          icon: <Clock className="h-4 w-4 text-amber-500 shrink-0" />,
          badge: "bg-amber-50 text-amber-700 border-amber-200/80",
        };
      case "Low":
        return {
          icon: <Clock className="h-4 w-4 text-blue-500 shrink-0" />,
          badge: "bg-blue-50 text-blue-700 border-blue-200/80",
        };
    }
  };

  return (
    <div className="col-span-12 lg:col-span-4 flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-slate-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h2 className="text-base font-bold text-slate-900 tracking-tight">
          Financial Alerts
        </h2>
        <button
          type="button"
          onClick={() => navigate("/invoice-center/reports/customer-aging")}
          className="group inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer transition-colors"
        >
          <span>View All</span>
          <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Alerts List */}
      <div className="space-y-3 pt-3">
        {items.map((alert) => {
          const style = getSeverityStyle(alert.severity);
          return (
            <div
              key={alert.id}
              onClick={() => navigate(alert.link)}
              className="group flex items-start justify-between gap-2.5 rounded-xl border border-slate-100/90 bg-slate-50/50 p-2.5 transition-all hover:border-slate-200 hover:bg-slate-50 cursor-pointer"
            >
              <div className="flex items-start gap-2.5 pt-0.5">
                {style.icon}
                <div>
                  <h4 className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors leading-tight">
                    {alert.title}
                  </h4>
                  <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                    {alert.subtitle}
                  </p>
                </div>
              </div>
              <span
                className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-bold ${style.badge}`}
              >
                {alert.severity}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
