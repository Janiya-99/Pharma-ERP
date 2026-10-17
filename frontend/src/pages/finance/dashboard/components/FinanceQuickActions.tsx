import React from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  ArrowDownLeft,
  FilePlus,
  FileText,
  Landmark,
  Coins,
  BookOpen,
  BarChart3,
  Settings,
} from "lucide-react";
import toast from "react-hot-toast";

export const FinanceQuickActions: React.FC = () => {
  const navigate = useNavigate();

  const actions = [
    {
      label: "Record Payment",
      icon: CreditCard,
      path: "/finance/banking/payment-vouchers",
      iconColor: "text-emerald-600 bg-emerald-50 border-emerald-100",
    },
    {
      label: "Receive Payment",
      icon: ArrowDownLeft,
      path: "/finance/banking/receipt-vouchers",
      iconColor: "text-teal-600 bg-teal-50 border-teal-100",
    },
    {
      label: "Create Invoice",
      icon: FilePlus,
      path: "/invoice-center/sales-invoices/create",
      iconColor: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
      label: "Create Bill",
      icon: FileText,
      path: "/finance/banking/payment-vouchers",
      iconColor: "text-indigo-600 bg-indigo-50 border-indigo-100",
    },
    {
      label: "Bank Reconciliation",
      icon: Landmark,
      path: "/finance/banking/bank-reconciliation",
      iconColor: "text-purple-600 bg-purple-50 border-purple-100",
    },
    {
      label: "Petty Cash Entry",
      icon: Coins,
      path: "/finance/banking/cash-accounts",
      iconColor: "text-pink-600 bg-pink-50 border-pink-100",
    },
    {
      label: "Journal Entry",
      icon: BookOpen,
      path: "/finance/general-ledger/journal-entry/create",
      iconColor: "text-amber-600 bg-amber-50 border-amber-100",
    },
    {
      label: "Financial Reports",
      icon: BarChart3,
      path: "/finance/reports/profit-and-loss",
      iconColor: "text-cyan-600 bg-cyan-50 border-cyan-100",
    },
  ];

  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-slate-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h2 className="text-base font-bold text-slate-900 tracking-tight">
          Quick Actions
        </h2>
        <button
          type="button"
          onClick={() => toast("Quick action settings", { icon: "⚙️" })}
          className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
          title="Configure Quick Actions"
        >
          <Settings className="h-4 w-4" />
        </button>
      </div>

      {/* 2x4 Action Grid */}
      <div className="grid grid-cols-2 gap-2.5 pt-3">
        {actions.map((act, index) => {
          const Icon = act.icon;
          return (
            <button
              key={index}
              type="button"
              onClick={() => navigate(act.path)}
              className="group flex items-center gap-2.5 rounded-xl border border-slate-200/90 bg-white p-2.5 text-left transition-all hover:border-slate-300 hover:bg-slate-50/80 hover:shadow-2xs active:scale-[0.98] cursor-pointer"
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${act.iconColor} transition-transform group-hover:scale-105`}
              >
                <Icon className="h-4 w-4 stroke-[2]" />
              </div>
              <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 transition-colors line-clamp-1">
                {act.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
